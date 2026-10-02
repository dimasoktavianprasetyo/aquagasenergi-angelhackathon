import os
import sys
from concurrent import futures
import grpc

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from generated import energy_copilot_pb2 as pb2
from generated import energy_copilot_pb2_grpc as pb2_grpc

# Conversion & Emission Factors (IPCC 2006 Guidelines for National GHG Inventories)
# LHV Lower Heating Values
LHV_LPG_GJ_PER_KG = 0.0461       # 46.1 MJ/kg
LHV_DIESEL_GJ_PER_LITER = 0.0358 # 35.8 MJ/liter
MMBTU_TO_GJ = 1.055056           # 1 MMBTU = 1.055056 GJ

# CO2 Emission Factors (kg CO2 per GJ input)
CO2_FACTOR_LPG = 63.1            # kg CO2 / GJ
CO2_FACTOR_DIESEL = 74.1         # kg CO2 / GJ
CO2_FACTOR_CNG = 56.1            # kg CO2 / GJ (Cleaner combustion, Blue Flame)

class CNGTransitionServiceServicer(pb2_grpc.CNGTransitionServiceServicer):

    def SimulateCNGTransition(self, request, context):
        """Simulates economic and environmental impact of switching from LPG/Diesel to CNG"""
        current_fuel = (request.current_fuel or "LPG").upper()
        current_price = request.current_fuel_price_idr or 14000.0  # Rp 14.000 / kg LPG
        current_eff = request.current_thermal_efficiency or 0.78   # 78% thermal efficiency
        
        cng_price_mmbtu = request.cng_price_idr_per_mmbtu or 215000.0 # Parameter simulasi awal: ~Rp 215.000/MMBTU (Skenario pasokan PT Aqua Gas Energy)
        cng_eff = request.target_cng_efficiency or 0.84          # 84% modern gas burner efficiency
        retrofit_capex = request.retrofit_capex_idr or 150000000.0 # Rp 150 Juta dual-fuel burner & PRS setup
        
        annual_useful_demand_gj = request.annual_energy_demand_gj or 12000.0 # ~12,000 GJ useful heat/year

        # 1. Cost per Useful Thermal Energy calculation
        # Cost/Useful GJ = Fuel_Unit_Price / (LHV_per_unit * Efficiency)
        if current_fuel == "DIESEL":
            lhv_current = LHV_DIESEL_GJ_PER_LITER
            unit_name = "liter"
            co2_factor_current = CO2_FACTOR_DIESEL
        else: # Default LPG
            lhv_current = LHV_LPG_GJ_PER_KG
            unit_name = "kg"
            co2_factor_current = CO2_FACTOR_LPG

        cost_per_useful_current = current_price / (lhv_current * current_eff)
        
        # CNG: Price per MMBTU -> Price per GJ input = cng_price_mmbtu / MMBTU_TO_GJ
        cng_price_per_input_gj = cng_price_mmbtu / MMBTU_TO_GJ
        cost_per_useful_cng = cng_price_per_input_gj / cng_eff

        cost_savings_pct = ((cost_per_useful_current - cost_per_useful_cng) / cost_per_useful_current) * 100.0

        # 2. Annual Cost & Savings
        annual_current_cost = annual_useful_demand_gj * cost_per_useful_current
        annual_cng_cost = annual_useful_demand_gj * cost_per_useful_cng
        annual_savings = annual_current_cost - annual_cng_cost

        # 3. Payback Period & ROI
        payback_months = (retrofit_capex / annual_savings * 12.0) if annual_savings > 0 else 999.0
        simple_roi = (annual_savings / retrofit_capex * 100.0) if retrofit_capex > 0 else 0.0

        # 4. Emissions Impact
        # Total fuel energy input = useful heat / efficiency
        annual_input_current_gj = annual_useful_demand_gj / current_eff
        annual_input_cng_gj = annual_useful_demand_gj / cng_eff

        co2_current_tonnes = (annual_input_current_gj * co2_factor_current) / 1000.0
        co2_cng_tonnes = (annual_input_cng_gj * CO2_FACTOR_CNG) / 1000.0
        co2_reduction_tonnes = co2_current_tonnes - co2_cng_tonnes
        co2_reduction_pct = (co2_reduction_tonnes / co2_current_tonnes * 100.0) if co2_current_tonnes > 0 else 0.0

        # 5. Recommendation Logic
        is_recommended = cost_savings_pct > 15.0 and payback_months <= 24.0
        if is_recommended:
            rec_summary = (
                f"HASIL SIMULASI KELAYAKAN TINGGI: Berdasarkan parameter input yang dimasukkan, konversi ke CNG memproyeksikan penghematan biaya panas berguna sebesar "
                f"{cost_savings_pct:.1f}% (estimasi Rp {annual_savings:,.0f}/tahun) dengan perkiraan periode pengembalian modal (payback) "
                f"{payback_months:.1f} bulan dan reduksi emisi CO2 sebesar {co2_reduction_pct:.1f}% ({co2_reduction_tonnes:.1f} ton/tahun). "
                f"Skenario pasokan dapat diselaraskan dengan rencana distribusi PT Aqua Gas Energi (AGE) setelah survei teknis."
            )
        else:
            rec_summary = (
                f"HASIL SIMULASI PERLU KAJIAN KHUSUS: Penghematan disimulasikan sebesar {cost_savings_pct:.1f}% dengan payback {payback_months:.1f} bulan. "
                f"Disarankan penyesuaian parameter tarif volume gas atau audit jam operasional boiler sebelum investasi modifikasi burner."
            )

        # 6. Audit Trail for Traceability
        audit_trail = [
            pb2.TraceabilityStep(
                step_name="Perhitungan Biaya per Panas Berguna (Useful Heat)",
                formula_applied="Cost_useful = Price / (LHV * Thermal_Efficiency)",
                input_parameters=(
                    f"Eksisting ({current_fuel}): Rp {current_price:,.0f}/{unit_name}, LHV={lhv_current} GJ/{unit_name}, Eff={current_eff*100:.0f}%. "
                    f"CNG: Rp {cng_price_mmbtu:,.0f}/MMBTU, LHV=1.055 GJ/MMBTU, Eff={cng_eff*100:.0f}%"
                ),
                calculation_result=f"Eksisting: Rp {cost_per_useful_current:,.0f}/GJ | CNG: Rp {cost_per_useful_cng:,.0f}/GJ (Hemat {cost_savings_pct:.1f}%)",
                standard_reference="Buku Pedoman Efisiensi Energi Industri & Formula Termal Teknik Kimia",
                engineering_rationale="Membandingkan harga rupiah per unit fisik (kg vs m³) adalah bias; yang dinilai adalah rupiah per satuan energi kalor yang berhasil diserap proses produksi."
            ),
            pb2.TraceabilityStep(
                step_name="Analisis Payback Period Investasi Retrofit",
                formula_applied="Payback (Bulan) = (CAPEX_Retrofit / Annual_Gross_Savings) * 12",
                input_parameters=f"CAPEX = Rp {retrofit_capex:,.0f}, Penghematan Tahunan = Rp {annual_savings:,.0f}",
                calculation_result=f"Payback = {payback_months:.1f} bulan (ROI: {simple_roi:.1f}%)",
                standard_reference="Standard Financial Appraisal for Industrial Energy Retrofits",
                engineering_rationale="Memastikan kelayakan belanja modal (CAPEX) penggantian burner atau penambahan Pressure Regulating Station (PRS) CNG."
            ),
            pb2.TraceabilityStep(
                step_name="Kuantifikasi Reduksi Emisi Karbon (GHG)",
                formula_applied="Emisi CO2 (Ton) = (Energi Input GJ * Faktor Emisi IPCC kg/GJ) / 1000",
                input_parameters=f"Faktor Emisi {current_fuel}: {co2_factor_current} kg/GJ, CNG: {CO2_FACTOR_CNG} kg/GJ",
                calculation_result=f"Reduksi: {co2_reduction_tonnes:,.1f} Ton CO2/tahun ({co2_reduction_pct:.1f}% pengurangan)",
                standard_reference="IPCC 2006 Guidelines for National Greenhouse Gas Inventories & Blue Flame Transition Report",
                engineering_rationale="Gas alam (CNG/CH4) memiliki rasio atom C terhadap H paling rendah di antara hidrokarbon, menghasilkan pembakaran bersih (Blue Flame) dan jejak karbon terendah."
            )
        ]

        return pb2.CNGSimResult(
            current_cost_per_useful_gj=cost_per_useful_current,
            cng_cost_per_useful_gj=cost_per_useful_cng,
            cost_savings_percent=cost_savings_pct,
            annual_current_fuel_cost=annual_current_cost,
            annual_cng_fuel_cost=annual_cng_cost,
            annual_gross_savings_idr=annual_savings,
            payback_period_months=payback_months,
            simple_roi_percent=simple_roi,
            current_annual_co2_tonnes=co2_current_tonnes,
            cng_annual_co2_tonnes=co2_cng_tonnes,
            co2_reduction_tonnes=co2_reduction_tonnes,
            co2_reduction_percent=co2_reduction_pct,
            is_recommended=is_recommended,
            recommendation_summary=rec_summary,
            audit_trail=audit_trail
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_CNGTransitionServiceServicer_to_server(CNGTransitionServiceServicer(), server)
    port = "50052"
    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    print(f"[gRPC CNG Transition Service] Berjalan di port {port}...")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
