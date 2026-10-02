import asyncio
import json
import os
import sys
from typing import List, Optional
from fastapi import FastAPI, File, Form, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from gateway import grpc_client

app = FastAPI(
    title="Industrial Energy Efficiency Copilot API Gateway",
    description="API Gateway connecting React frontend via WebSocket and REST to gRPC microservices",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class BaselineAnalysisRequest(BaseModel):
    normalized_data: List[dict]
    equipment_id: Optional[str] = "Boiler-01"

class CNGSimParams(BaseModel):
    current_fuel: str = "LPG"
    current_fuel_price_idr: float = 14000.0
    current_thermal_efficiency: float = 0.78
    cng_price_idr_per_mmbtu: float = 215000.0
    target_cng_efficiency: float = 0.84
    retrofit_capex_idr: float = 150000000.0
    annual_energy_demand_gj: float = 12000.0

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Industrial Energy Efficiency Copilot Gateway",
        "protocol": "WebSocket & gRPC",
        "services": {
            "analytics_grpc": grpc_client.ANALYTICS_HOST,
            "cng_grpc": grpc_client.CNG_HOST
        }
    }

@app.post("/api/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    default_fuel: str = Form("LPG")
):
    content = await file.read()
    report = grpc_client.call_ingest_and_audit(content, file.filename, default_fuel)
    
    issues_list = [
        {
            "row_index": issue.row_index,
            "column_name": issue.column_name,
            "issue_type": issue.issue_type,
            "description": issue.description
        }
        for issue in report.issues
    ]

    normalized_list = [
        {
            "timestamp": pt.timestamp,
            "production_output": pt.production_output,
            "operating_hours": pt.operating_hours,
            "fuel_consumption_native": pt.fuel_consumption_native,
            "native_unit": pt.native_unit,
            "energy_input_gj": pt.energy_input_gj,
            "energy_input_mmbtu": pt.energy_input_mmbtu,
            "ike_gj_per_ton": pt.ike_gj_per_ton,
            "equipment_id": pt.equipment_id
        }
        for pt in report.normalized_data
    ]

    return {
        "is_valid": report.is_valid,
        "total_rows": report.total_rows,
        "accepted_rows": report.accepted_rows,
        "rejected_rows": report.rejected_rows,
        "summary_message": report.summary_message,
        "issues": issues_list,
        "normalized_data": normalized_list
    }

@app.post("/api/calculate-baseline")
def calculate_baseline(request: BaselineAnalysisRequest):
    res = grpc_client.call_baseline_and_anomalies(request.normalized_data)
    
    anomalies = [
        {
            "timestamp": p.timestamp,
            "actual_energy_gj": p.actual_energy_gj,
            "baseline_energy_gj": p.baseline_energy_gj,
            "deviation_gj": p.deviation_gj,
            "deviation_percent": p.deviation_percent,
            "is_anomaly": p.is_anomaly,
            "estimated_excess_cost_idr": p.estimated_excess_cost_idr,
            "probable_cause": p.probable_cause
        }
        for p in res.points
    ]

    audit = [
        {
            "step_name": step.step_name,
            "formula_applied": step.formula_applied,
            "input_parameters": step.input_parameters,
            "calculation_result": step.calculation_result,
            "standard_reference": step.standard_reference,
            "engineering_rationale": step.engineering_rationale
        }
        for step in res.audit_trail
    ]

    return {
        "model": {
            "r_squared": res.model.r_squared,
            "slope_production": res.model.slope_production,
            "slope_hours": res.model.slope_hours,
            "base_load_intercept": res.model.base_load_intercept,
            "regression_formula": res.model.regression_formula,
            "std_residual": res.model.std_residual,
            "baseline_period_start": res.model.baseline_period_start,
            "baseline_period_end": res.model.baseline_period_end
        },
        "average_ike": res.average_ike,
        "total_actual_energy_gj": res.total_actual_energy_gj,
        "total_baseline_energy_gj": res.total_baseline_energy_gj,
        "total_wasted_energy_gj": res.total_wasted_energy_gj,
        "total_wasted_cost_idr": res.total_wasted_cost_idr,
        "points": anomalies,
        "audit_trail": audit
    }

@app.post("/api/simulate-cng")
def simulate_cng(params: CNGSimParams):
    res = grpc_client.call_simulate_cng(params.dict())
    
    audit = [
        {
            "step_name": step.step_name,
            "formula_applied": step.formula_applied,
            "input_parameters": step.input_parameters,
            "calculation_result": step.calculation_result,
            "standard_reference": step.standard_reference,
            "engineering_rationale": step.engineering_rationale
        }
        for step in res.audit_trail
    ]

    return {
        "current_cost_per_useful_gj": res.current_cost_per_useful_gj,
        "cng_cost_per_useful_gj": res.cng_cost_per_useful_gj,
        "cost_savings_percent": res.cost_savings_percent,
        "annual_current_fuel_cost": res.annual_current_fuel_cost,
        "annual_cng_fuel_cost": res.annual_cng_fuel_cost,
        "annual_gross_savings_idr": res.annual_gross_savings_idr,
        "payback_period_months": res.payback_period_months,
        "simple_roi_percent": res.simple_roi_percent,
        "current_annual_co2_tonnes": res.current_annual_co2_tonnes,
        "cng_annual_co2_tonnes": res.cng_annual_co2_tonnes,
        "co2_reduction_tonnes": res.co2_reduction_tonnes,
        "co2_reduction_percent": res.co2_reduction_percent,
        "is_recommended": res.is_recommended,
        "recommendation_summary": res.recommendation_summary,
        "audit_trail": audit
    }

# ==========================================
# WEBSOCKET REAL-TIME STREAMING
# ==========================================
@app.websocket("/ws/copilot")
async def websocket_copilot_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({
        "type": "CONNECTION_ESTABLISHED",
        "message": "Terhubung dengan Industrial Energy Efficiency Copilot Gateway (Microservices Stream)"
    })
    
    try:
        while True:
            raw_text = await websocket.receive_text()
            data = json.loads(raw_text)
            action = data.get("action")

            if action == "RUN_FULL_PIPELINE":
                # Simulated realistic multi-step gRPC pipeline execution with live UI push
                csv_raw = data.get("csv_raw", "")
                fuel_type = data.get("fuel_type", "LPG")
                cng_params = data.get("cng_params", {})

                async def stream_range(start_pct: int, end_pct: int, duration_sec: float, stage: str, msg: str):
                    steps = end_pct - start_pct
                    if steps <= 0:
                        return
                    step_delay = duration_sec / steps
                    for p in range(start_pct, end_pct + 1):
                        await websocket.send_json({
                            "type": "PROGRESS",
                            "stage": stage,
                            "progress": p,
                            "message": msg
                        })
                        await asyncio.sleep(step_delay)

                # Stage 1: Ingestion & Quality check (0 -> 25 dalam 0.8s)
                msg_1 = "Memanggil gRPC Analytics: Validasi Integritas & Filter Fisik Data CSV..."
                await stream_range(0, 25, 0.8, "INGESTION", msg_1)
                
                quality_report = grpc_client.call_ingest_and_audit(
                    csv_raw.encode("utf-8"), "dataset.csv", fuel_type
                )
                await asyncio.sleep(0.3)

                normalized_points = [
                    {
                        "timestamp": pt.timestamp,
                        "production_output": pt.production_output,
                        "operating_hours": pt.operating_hours,
                        "fuel_consumption_native": pt.fuel_consumption_native,
                        "native_unit": pt.native_unit,
                        "energy_input_gj": pt.energy_input_gj,
                        "energy_input_mmbtu": pt.energy_input_mmbtu,
                        "ike_gj_per_ton": pt.ike_gj_per_ton,
                        "equipment_id": pt.equipment_id
                    }
                    for pt in quality_report.normalized_data
                ]

                # Stage 2: Normalization (26 -> 50 dalam 0.8s)
                msg_2 = f"Normalisasi Kalor Berhasil: {quality_report.accepted_rows} baris dikonversi ke basis GJ/MMBTU."
                await stream_range(26, 50, 0.8, "NORMALIZATION", msg_2)
                await asyncio.sleep(0.3)

                # Stage 3: Baseline & Anomaly (51 -> 75 dalam 0.8s)
                msg_3 = "Memanggil gRPC Analytics: Regresi Baseline US DOE & Deteksi Anomali Operasional (+1.5σ)..."
                await stream_range(51, 75, 0.8, "BASELINE_DOE", msg_3)
                
                baseline_res = grpc_client.call_baseline_and_anomalies(normalized_points)
                await asyncio.sleep(0.3)

                # Stage 4: CNG Simulation (76 -> 99 dalam 0.8s)
                msg_4 = "Memanggil gRPC CNG Service: Menghitung Biaya Panas Berguna (LHV) & Reduksi Emisi CO₂..."
                await stream_range(76, 99, 0.8, "CNG_SIMULATION", msg_4)
                
                # Annual useful demand based on actual dataset sum scaled to year
                total_actual_gj = baseline_res.total_actual_energy_gj
                annual_useful = total_actual_gj * 12.0 * 0.78 # Extrapolate to 12 months useful heat
                cng_params["annual_energy_demand_gj"] = annual_useful
                cng_params["current_fuel"] = fuel_type
                if fuel_type == "CNG" and cng_params.get("current_fuel_price_idr", 0) < 50000:
                    cng_params["current_fuel_price_idr"] = 245000.0
                cng_res = grpc_client.call_simulate_cng(cng_params)
                await asyncio.sleep(0.2)

                # Final Completed Payload
                anomalies = [
                    {
                        "timestamp": p.timestamp,
                        "actual_energy_gj": p.actual_energy_gj,
                        "baseline_energy_gj": p.baseline_energy_gj,
                        "deviation_gj": p.deviation_gj,
                        "deviation_percent": p.deviation_percent,
                        "is_anomaly": p.is_anomaly,
                        "estimated_excess_cost_idr": p.estimated_excess_cost_idr,
                        "probable_cause": p.probable_cause
                    }
                    for p in baseline_res.points
                ]

                all_audit = [
                    {
                        "step_name": s.step_name,
                        "formula_applied": s.formula_applied,
                        "input_parameters": s.input_parameters,
                        "calculation_result": s.calculation_result,
                        "standard_reference": s.standard_reference,
                        "engineering_rationale": s.engineering_rationale
                    }
                    for s in list(baseline_res.audit_trail) + list(cng_res.audit_trail)
                ]

                await websocket.send_json({
                    "type": "PIPELINE_COMPLETE",
                    "progress": 100,
                    "payload": {
                        "quality": {
                            "is_valid": quality_report.is_valid,
                            "total_rows": quality_report.total_rows,
                            "accepted_rows": quality_report.accepted_rows,
                            "rejected_rows": quality_report.rejected_rows,
                            "summary_message": quality_report.summary_message,
                            "issues": [
                                {
                                    "row_index": i.row_index,
                                    "column_name": i.column_name,
                                    "issue_type": i.issue_type,
                                    "description": i.description
                                }
                                for i in quality_report.issues
                            ]
                        },
                        "baseline": {
                            "model": {
                                "r_squared": baseline_res.model.r_squared,
                                "slope_production": baseline_res.model.slope_production,
                                "slope_hours": baseline_res.model.slope_hours,
                                "base_load_intercept": baseline_res.model.base_load_intercept,
                                "regression_formula": baseline_res.model.regression_formula,
                                "std_residual": baseline_res.model.std_residual
                            },
                            "average_ike": baseline_res.average_ike,
                            "total_actual_energy_gj": baseline_res.total_actual_energy_gj,
                            "total_baseline_energy_gj": baseline_res.total_baseline_energy_gj,
                            "total_wasted_energy_gj": baseline_res.total_wasted_energy_gj,
                            "total_wasted_cost_idr": baseline_res.total_wasted_cost_idr,
                            "points": anomalies
                        },
                        "cng": {
                            "current_cost_per_useful_gj": cng_res.current_cost_per_useful_gj,
                            "cng_cost_per_useful_gj": cng_res.cng_cost_per_useful_gj,
                            "cost_savings_percent": cng_res.cost_savings_percent,
                            "annual_current_fuel_cost": cng_res.annual_current_fuel_cost,
                            "annual_cng_fuel_cost": cng_res.annual_cng_fuel_cost,
                            "annual_gross_savings_idr": cng_res.annual_gross_savings_idr,
                            "payback_period_months": cng_res.payback_period_months,
                            "simple_roi_percent": cng_res.simple_roi_percent,
                            "current_annual_co2_tonnes": cng_res.current_annual_co2_tonnes,
                            "cng_annual_co2_tonnes": cng_res.cng_annual_co2_tonnes,
                            "co2_reduction_tonnes": cng_res.co2_reduction_tonnes,
                            "co2_reduction_percent": cng_res.co2_reduction_percent,
                            "is_recommended": cng_res.is_recommended,
                            "recommendation_summary": cng_res.recommendation_summary
                        },
                        "audit_trail": all_audit
                    }
                })

    except WebSocketDisconnect:
        print("[Gateway WebSocket] Klien terputus.")
