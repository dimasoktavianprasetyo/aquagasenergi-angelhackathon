import io
import math
import sys
import os
from concurrent import futures
import grpc
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

# Ensure parent directory is in path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from generated import energy_copilot_pb2 as pb2
from generated import energy_copilot_pb2_grpc as pb2_grpc

# Standard LHV Values (Lower Heating Value)
LHV_FACTORS_GJ = {
    "LPG": 0.0461,       # 46.1 MJ/kg -> 0.0461 GJ/kg
    "DIESEL": 0.0358,    # 35.8 MJ/liter -> 0.0358 GJ/liter
    "CNG": 0.0383,       # 38.3 MJ/Nm3 -> 0.0383 GJ/Nm3
    "NATURAL_GAS": 0.0383
}

GJ_TO_MMBTU = 0.947817

class EnergyAnalyticsServiceServicer(pb2_grpc.EnergyAnalyticsServiceServicer):
    
    def IngestAndAudit(self, request, context):
        """Parses CSV and runs quality inspection, edge-case detection, and normalization"""
        csv_bytes = request.csv_content
        default_fuel = request.default_fuel_type or "LPG"
        
        try:
            df = pd.read_csv(io.BytesIO(csv_bytes))
        except Exception as e:
            return pb2.QualityReport(
                is_valid=False,
                summary_message=f"Gagal membaca format CSV: {str(e)}"
            )

        # Standardize column names (lowercase and strip whitespace)
        df.columns = [c.strip().lower() for c in df.columns]
        
        required_cols = {"timestamp", "production_output", "fuel_consumption", "operating_hours"}
        missing_required = required_cols - set(df.columns)
        
        issues = []
        if missing_required:
            for col in missing_required:
                issues.append(pb2.DataQualityIssue(
                    row_index=-1,
                    column_name=col,
                    issue_type="MISSING_COLUMN",
                    description=f"Kolom wajib '{col}' tidak ditemukan di CSV."
                ))
            return pb2.QualityReport(
                is_valid=False,
                total_rows=len(df),
                accepted_rows=0,
                rejected_rows=len(df),
                issues=issues,
                summary_message=f"Kolom wajib tidak lengkap: {', '.join(missing_required)}"
            )

        normalized_data = []
        accepted = 0
        rejected = 0

        for idx, row in df.iterrows():
            row_idx = int(idx) + 1
            has_error = False

            # Check null values
            for col in required_cols:
                if pd.isna(row[col]):
                    issues.append(pb2.DataQualityIssue(
                        row_index=row_idx,
                        column_name=col,
                        issue_type="MISSING_VALUE",
                        description=f"Baris {row_idx}: Nilai kosong pada kolom {col}"
                    ))
                    has_error = True

            if has_error:
                rejected += 1
                continue

            try:
                prod = float(row["production_output"])
                fuel = float(row["fuel_consumption"])
                hours = float(row["operating_hours"])
            except ValueError:
                issues.append(pb2.DataQualityIssue(
                    row_index=row_idx,
                    column_name="numeric_parsing",
                    issue_type="INVALID_TYPE",
                    description=f"Baris {row_idx}: Format angka numerik tidak valid."
                ))
                rejected += 1
                continue

            # Edge Case: Zero or negative values
            if fuel < 0 or prod < 0 or hours < 0:
                issues.append(pb2.DataQualityIssue(
                    row_index=row_idx,
                    column_name="negative_value",
                    issue_type="NEGATIVE_VALUE",
                    description=f"Baris {row_idx}: Nilai negatif tidak diperbolehkan (Produksi={prod}, Bahan Bakar={fuel}, Jam={hours})."
                ))
                rejected += 1
                continue

            # Edge Case: Zero production but fuel is burning (idle loss)
            if prod == 0 and fuel > 0:
                issues.append(pb2.DataQualityIssue(
                    row_index=row_idx,
                    column_name="production_output",
                    issue_type="ZERO_OUTPUT_RUNNING",
                    description=f"Baris {row_idx}: Fasilitas mengonsumsi {fuel} bahan bakar saat output produksi = 0 (indikasi idle/kebocoran)."
                ))
                # Not rejected, but flagged as operational loss
            
            # Fuel type & conversion
            fuel_type = str(row.get("fuel_type", default_fuel)).upper()
            if fuel_type not in LHV_FACTORS_GJ:
                fuel_type = "LPG"

            lhv = LHV_FACTORS_GJ[fuel_type]
            energy_gj = fuel * lhv
            energy_mmbtu = energy_gj * GJ_TO_MMBTU
            ike = (energy_gj / prod) if prod > 0 else 0.0

            equipment = str(row.get("equipment_id", "Boiler-01"))

            normalized_data.append(pb2.NormalizedDataPoint(
                timestamp=str(row["timestamp"]),
                production_output=prod,
                operating_hours=hours,
                fuel_consumption_native=fuel,
                native_unit="kg" if fuel_type == "LPG" else ("liter" if fuel_type == "DIESEL" else "Nm3"),
                energy_input_gj=energy_gj,
                energy_input_mmbtu=energy_mmbtu,
                ike_gj_per_ton=ike,
                equipment_id=equipment
            ))
            accepted += 1

        is_valid = accepted > 0
        summary = (
            f"Mutu Data Terverifikasi: {accepted} baris diterima, {rejected} baris ditolak. "
            f"Ditemukan {len(issues)} catatan mutu/anomali data."
        )

        return pb2.QualityReport(
            is_valid=is_valid,
            total_rows=len(df),
            accepted_rows=accepted,
            rejected_rows=rejected,
            issues=issues,
            normalized_data=normalized_data,
            summary_message=summary
        )

    def CalculateBaselineAndAnomalies(self, request, context):
        """Calculates Energy Baseline via Multiple Linear Regression (US DOE Guidance) and flags anomalies"""
        data = request.data
        if len(data) < 3:
            return pb2.BaselineResponse(
                average_ike=0,
                audit_trail=[pb2.TraceabilityStep(
                    step_name="Validasi Jumlah Titik Data",
                    formula_applied="N >= 3",
                    input_parameters=f"N={len(data)}",
                    calculation_result="Gagal",
                    standard_reference="US DOE Energy Baselining & Tracking Guidance 2020",
                    engineering_rationale="Dibutuhkan minimal 3 titik data historis untuk membentuk model regresi baseline."
                )]
            )

        # Build feature matrices
        prod_list = [p.production_output for p in data]
        hours_list = [p.operating_hours for p in data]
        energy_list = [p.energy_input_gj for p in data]

        X = np.column_stack([prod_list, hours_list])
        y = np.array(energy_list)

        # Linear regression: E = m1*P + m2*H + c
        reg = LinearRegression().fit(X, y)
        r2 = float(reg.score(X, y))
        m1 = float(reg.coef_[0])  # GJ per unit prod
        m2 = float(reg.coef_[1])  # GJ per operating hr
        c = float(reg.intercept_) # Basal standby loss
        formula_str = f"E_baseline (GJ) = {m1:.4f} * Produksi + {m2:.4f} * Jam + {c:.4f}"

        # Residual analysis
        predicted = reg.predict(X)
        residuals = y - predicted
        std_residual = float(np.std(residuals)) if len(residuals) > 1 else 1.0

        # Fuel price estimation for cost impact (LPG ~ Rp 14,000 / kg -> ~ Rp 303,687 / GJ)
        approx_cost_per_gj = 303687.0

        anomaly_points = []
        total_wasted_energy = 0.0
        total_wasted_cost = 0.0

        for i, pt in enumerate(data):
            base_val = float(predicted[i])
            actual_val = float(pt.energy_input_gj)
            dev_gj = actual_val - base_val
            dev_pct = (dev_gj / base_val * 100.0) if base_val > 0 else 0.0

            # US DOE Threshold: > 1.5 standard deviation above baseline is an operational anomaly
            is_anomaly = dev_gj > (1.5 * std_residual)
            cost_excess = (dev_gj * approx_cost_per_gj) if dev_gj > 0 else 0.0

            if is_anomaly:
                total_wasted_energy += dev_gj
                total_wasted_cost += cost_excess
                cause = (
                    "Konsumsi energi melebihi toleransi baseline (+1.5σ). "
                    "Kemungkinan: rasio udara-bahan bakar berlebih, kerak/fouling boiler, atau kebocoran steam."
                )
            else:
                cause = "Konsumsi dalam batas kendali operasional wajar."

            anomaly_points.append(pb2.AnomalyPoint(
                timestamp=pt.timestamp,
                actual_energy_gj=actual_val,
                baseline_energy_gj=base_val,
                deviation_gj=dev_gj,
                deviation_percent=dev_pct,
                is_anomaly=is_anomaly,
                estimated_excess_cost_idr=cost_excess,
                probable_cause=cause
            ))

        avg_ike = float(np.mean([p.ike_gj_per_ton for p in data if p.production_output > 0]))
        total_actual = float(np.sum(energy_list))
        total_base = float(np.sum(predicted))

        audit_trail = [
            pb2.TraceabilityStep(
                step_name="Metodologi Normalisasi Baseline",
                formula_applied="E_baseline = β1 * Produksi + β2 * Jam_Operasi + β0",
                input_parameters=f"Dataset N={len(data)} titik data",
                calculation_result=formula_str,
                standard_reference="US DOE Energy Baselining and Tracking Guidance (2020)",
                engineering_rationale="Memisahkan variabel produksi dan jam kerja agar tagihan bahan bakar mencerminkan efisiensi murni, bukan fluktuasi output."
            ),
            pb2.TraceabilityStep(
                step_name="Evaluasi Goodness of Fit Baseline",
                formula_applied="R² = 1 - (SS_res / SS_tot)",
                input_parameters=f"Std Residual = {std_residual:.4f} GJ",
                calculation_result=f"R² = {r2:.4f} ({'Model Sangat Akurat' if r2 > 0.8 else 'Perlu Koreksi Variabel Tambahan'})",
                standard_reference="ASHRAE Guideline 14 & US DOE",
                engineering_rationale="Nilai R² > 0.75 menunjukkan baseline valid digunakan sebagai acuan tolak ukur penghematan dan anomali."
            ),
            pb2.TraceabilityStep(
                step_name="Kriteria Deteksi Anomali Pemborosan",
                formula_applied="Threshold Anomali = E_actual > (E_baseline + 1.5 * σ)",
                input_parameters=f"1.5 * σ = {1.5 * std_residual:.4f} GJ",
                calculation_result=f"Ditemukan {sum(1 for a in anomaly_points if a.is_anomaly)} insiden anomali, potensi kerugian Rp {total_wasted_cost:,.0f}",
                standard_reference="Statistical Process Control (SPC) for Industrial Energy",
                engineering_rationale="Mendeteksi inefisiensi sesaat secara proaktif sebelum menjadi akumulasi biaya tinggi di akhir bulan."
            )
        ]

        return pb2.BaselineResponse(
            model=pb2.BaselineModelParams(
                r_squared=r2,
                slope_production=m1,
                slope_hours=m2,
                base_load_intercept=c,
                regression_formula=formula_str,
                std_residual=std_residual,
                baseline_period_start=data[0].timestamp if data else "",
                baseline_period_end=data[-1].timestamp if data else ""
            ),
            points=anomaly_points,
            average_ike=avg_ike,
            total_actual_energy_gj=total_actual,
            total_baseline_energy_gj=total_base,
            total_wasted_energy_gj=total_wasted_energy,
            total_wasted_cost_idr=total_wasted_cost,
            audit_trail=audit_trail
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_EnergyAnalyticsServiceServicer_to_server(EnergyAnalyticsServiceServicer(), server)
    port = "50051"
    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    print(f"[gRPC Analytics Service] Berjalan di port {port}...")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
