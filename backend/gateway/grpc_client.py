import os
import sys
import grpc

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from generated import energy_copilot_pb2 as pb2
from generated import energy_copilot_pb2_grpc as pb2_grpc

ANALYTICS_HOST = os.getenv("ANALYTICS_HOST", "localhost:50051")
CNG_HOST = os.getenv("CNG_HOST", "localhost:50052")

def get_analytics_client():
    channel = grpc.insecure_channel(ANALYTICS_HOST)
    return pb2_grpc.EnergyAnalyticsServiceStub(channel)

def get_cng_client():
    channel = grpc.insecure_channel(CNG_HOST)
    return pb2_grpc.CNGTransitionServiceStub(channel)

def call_ingest_and_audit(csv_bytes: bytes, filename: str, default_fuel: str = "LPG"):
    client = get_analytics_client()
    req = pb2.IngestRequest(
        filename=filename,
        csv_content=csv_bytes,
        default_fuel_type=default_fuel
    )
    return client.IngestAndAudit(req)

def call_baseline_and_anomalies(normalized_points):
    client = get_analytics_client()
    proto_points = []
    for pt in normalized_points:
        proto_points.append(pb2.NormalizedDataPoint(
            timestamp=pt["timestamp"],
            production_output=float(pt["production_output"]),
            operating_hours=float(pt["operating_hours"]),
            fuel_consumption_native=float(pt["fuel_consumption_native"]),
            native_unit=pt["native_unit"],
            energy_input_gj=float(pt["energy_input_gj"]),
            energy_input_mmbtu=float(pt["energy_input_mmbtu"]),
            ike_gj_per_ton=float(pt["ike_gj_per_ton"]),
            equipment_id=pt.get("equipment_id", "Boiler-01")
        ))
    req = pb2.BaselineRequest(data=proto_points)
    return client.CalculateBaselineAndAnomalies(req)

def call_simulate_cng(params: dict):
    client = get_cng_client()
    req = pb2.CNGSimRequest(
        current_fuel=params.get("current_fuel", "LPG"),
        current_fuel_price_idr=float(params.get("current_fuel_price_idr", 14000.0)),
        current_thermal_efficiency=float(params.get("current_thermal_efficiency", 0.78)),
        cng_price_idr_per_mmbtu=float(params.get("cng_price_idr_per_mmbtu", 215000.0)),
        target_cng_efficiency=float(params.get("target_cng_efficiency", 0.84)),
        retrofit_capex_idr=float(params.get("retrofit_capex_idr", 150000000.0)),
        annual_energy_demand_gj=float(params.get("annual_energy_demand_gj", 12000.0))
    )
    return client.SimulateCNGTransition(req)
