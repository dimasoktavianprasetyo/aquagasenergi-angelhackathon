import urllib.request
import json
import os

def test_single_dataset(filename, fuel_type, label):
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(root, "test_data", filename)
    
    with open(csv_path, "rb") as f:
        csv_bytes = f.read()

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: text/csv\r\n\r\n"
        + csv_bytes.decode("utf-8")
        + f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="default_fuel"\r\n\r\n{fuel_type}\r\n'
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    # Step 1: Upload & Audit
    req = urllib.request.Request("http://localhost:8000/api/upload-csv", data=body, headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    })
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"[{label}] Ingestion -> Total: {res['total_rows']}, Diterima: {res['accepted_rows']}, Ditolak: {res['rejected_rows']}, Isu: {len(res['issues'])}")
    assert res["accepted_rows"] > 0, "Harus menerima baris valid"

    # Step 2: Baseline & Anomaly
    req2 = urllib.request.Request("http://localhost:8000/api/calculate-baseline", 
        data=json.dumps({"normalized_data": res["normalized_data"]}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res2 = json.loads(urllib.request.urlopen(req2).read().decode())
    print(f"[{label}] Baseline  -> R2: {res2['model']['r_squared']:.4f}, IKE: {res2['average_ike']:.4f} GJ/Ton")
    print(f"[{label}] Pemborosan-> {res2['total_wasted_energy_gj']:.1f} GJ (~Rp {res2['total_wasted_cost_idr']:,.0f})")
    assert res2["model"]["r_squared"] > 0.75, "R2 harus valid"

    # Step 3: CNG Simulation
    price = 14000.0 if fuel_type == "LPG" else 15500.0
    req3 = urllib.request.Request("http://localhost:8000/api/simulate-cng",
        data=json.dumps({
            "current_fuel": fuel_type,
            "current_fuel_price_idr": price,
            "current_thermal_efficiency": 0.78 if fuel_type == "LPG" else 0.74,
            "cng_price_idr_per_mmbtu": 215000.0,
            "target_cng_efficiency": 0.84,
            "retrofit_capex_idr": 150000000.0 if fuel_type == "LPG" else 200000000.0,
            "annual_energy_demand_gj": 25000.0
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res3 = json.loads(urllib.request.urlopen(req3).read().decode())
    print(f"[{label}] Transisi  -> Hemat: {res3['cost_savings_percent']:.1f}%, Payback: {res3['payback_period_months']:.1f} Bulan, Reduksi CO2: {res3['co2_reduction_tonnes']:.1f} Ton/Thn")

def main():
    print("=" * 70)
    print("  VERIFIKASI INTEGRASI DUAL-GRANULARITY (HARIAN 90 HARI & HOURLY SCADA 2,160 BARIS)")
    print("=" * 70)
    # 1. Harian (Daily)
    test_single_dataset("indmira_agro_boiler_data.csv", "LPG", "1A. INDMIRA (HARIAN - 90 BARIS)")
    print("-" * 70)
    test_single_dataset("us_doe_steam_boiler_data.csv", "DIESEL", "2A. US DOE (HARIAN - 90 BARIS)")
    print("-" * 70)
    # 2. Per Jam (Hourly SCADA - 2,160 Baris)
    test_single_dataset("indmira_agro_boiler_hourly.csv", "LPG", "1B. INDMIRA (HOURLY SCADA - 2,160 BARIS)")
    print("-" * 70)
    test_single_dataset("us_doe_steam_boiler_hourly.csv", "DIESEL", "2B. US DOE (HOURLY SCADA - 2,160 BARIS)")
    print("-" * 70)
    # 3. Kaggle Nature Telemetry (119 Jam)
    test_single_dataset("kaggle_real_steam_boiler_data.csv", "DIESEL", "3. KAGGLE / NATURE SENSOR RIIL (119 JAM)")
    print("\n[OK] SELURUH DATASET HARIAN & PER JAM (SCADA 2,160 BARIS) DIVERIFIKASI 100%!")

if __name__ == "__main__":
    main()
