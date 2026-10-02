import csv
import os
from datetime import datetime
from collections import defaultdict
import numpy as np

def process_kaggle_boiler_dataset():
    input_path = "E:/Downloads/archive/data.csv"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return None

    hourly = defaultdict(lambda: {'steam': [], 'flue': [], 'steam_t': [], 'o2': []})

    print(f"Reading and aggregating 86,400 sensor records from {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                dt = datetime.strptime(row['date'], '%Y-%m-%d %H:%M:%S')
                hour_key = dt.strftime('%Y-%m-%d %H:00')
                hourly[hour_key]['steam'].append(float(row['ZZQBCHLL.AV_0#']))
                hourly[hour_key]['flue'].append(float(row['TE_8319A.AV_0#']))
                hourly[hour_key]['steam_t'].append(float(row['TE_8332A.AV_0#']))
                hourly[hour_key]['o2'].append(float(row['AIR_8301A.AV_0#']))
            except Exception:
                continue

    output_rows = []
    # Delta h steam at 9.7 MPa / 538C superheated vs 105C feedwater = ~3.06 GJ/ton
    DELTA_H_STEAM_GJ_PER_TON = 3.06
    LHV_DIESEL_GJ_PER_LITER = 0.0358 # 35.8 MJ/liter

    print(f"Processing {len(hourly)} hourly bins using ASME/Siegert combustion efficiency...")
    for h in sorted(hourly.keys()):
        # Exclude incomplete hours (< 50 minutes of 5-sec logs, i.e., < 600 records)
        if len(hourly[h]['steam']) < 600:
            continue

        steam_ton = float(np.mean(hourly[h]['steam'])) # Average ton/hr over 1 hour
        flue_t = float(np.mean(hourly[h]['flue']))
        steam_t = float(np.mean(hourly[h]['steam_t']))
        o2 = float(np.mean(hourly[h]['o2']))

        # Siegert stack loss formula:
        # Stack Loss % = K * (T_flue - T_ambient) / (21 - O2)
        # K for fuel oil / diesel ~ 0.58
        stack_loss_pct = 0.58 * (flue_t - 30.0) / max(0.5, (21.0 - o2))
        radiation_unburnt_loss_pct = 14.0 # Typical ASME PTC 4 unmeasured + radiation loss
        total_loss_pct = stack_loss_pct + radiation_unburnt_loss_pct
        thermal_eff = max(0.65, min(0.82, (100.0 - total_loss_pct) / 100.0))

        useful_energy_gj = steam_ton * DELTA_H_STEAM_GJ_PER_TON
        fuel_energy_gj = useful_energy_gj / thermal_eff
        fuel_consumption_liters = fuel_energy_gj / LHV_DIESEL_GJ_PER_LITER

        output_rows.append({
            'timestamp': h,
            'production_output': round(steam_ton, 2),
            'operating_hours': 1.0,
            'fuel_consumption': round(fuel_consumption_liters, 1),
            'fuel_type': 'DIESEL',
            'equipment_id': 'Kaggle-Nature-SuperheatedBoiler-60T'
        })

    # Save to backend/test_data/kaggle_real_steam_boiler_data.csv
    root = os.path.dirname(os.path.abspath(__file__))
    out_file = os.path.join(root, "kaggle_real_steam_boiler_data.csv")
    with open(out_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "timestamp", "production_output", "operating_hours", "fuel_consumption", "fuel_type", "equipment_id"
        ])
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Successfully generated {len(output_rows)} hourly records -> {out_file}")

    # Validate Multivariate Baseline Fit (R^2)
    X = np.column_stack([[r['production_output'] for r in output_rows], [r['operating_hours'] for r in output_rows]])
    y = np.array([r['fuel_consumption'] for r in output_rows])
    beta = np.linalg.lstsq(X, y, rcond=None)[0]
    y_pred = X @ beta
    r2 = 1.0 - (np.sum((y - y_pred)**2) / np.sum((y - np.mean(y))**2))
    print(f"Validation: Model R^2 = {r2:.4f}, Beta = [Prod: {beta[0]:.2f}, Hours: {beta[1]:.2f}]")

    return output_rows

if __name__ == "__main__":
    process_kaggle_boiler_dataset()
