import csv
import math
import random
import os

def generate_indmira_agro_daily():
    """
    Studi Kasus 1: PT Indmira Global Energi - Harian (90 Hari)
    Unit: Boiler Uap & Rotary Dryer Produksi Pupuk Organik
    Bahan Bakar Eksisting: LPG Industri (LHV = 46.1 MJ/kg)
    """
    rows = []
    random.seed(42)
    
    for day in range(1, 91):
        date_str = f"2026-10-{(day-1)%30 + 1:02d}" if day <= 30 else (
            f"2026-11-{(day-31)%30 + 1:02d}" if day <= 60 else f"2026-12-{(day-61)%30 + 1:02d}"
        )
        
        # Shutdown days
        if day in [15, 45, 75]:
            rows.append({
                "timestamp": date_str,
                "production_output": 0.0,
                "operating_hours": 0.0,
                "fuel_consumption": 0.0,
                "fuel_type": "LPG",
                "equipment_id": "Boiler-Dryer-Indmira-01"
            })
            continue

        # Idle warming day
        if day == 28:
            rows.append({
                "timestamp": date_str,
                "production_output": 0.0,
                "operating_hours": 6.0,
                "fuel_consumption": 380.0,
                "fuel_type": "LPG",
                "equipment_id": "Boiler-Dryer-Indmira-01"
            })
            continue

        moisture_factor = 1.15 if 40 <= day <= 70 else 1.0
        prod = round(random.uniform(55.0, 92.0), 1)
        hours = round(random.uniform(16.0, 24.0), 1)
        base_fuel = 250.0 + (24.0 * prod * moisture_factor) + (35.0 * hours)
        fuel = base_fuel + random.gauss(0, 45.0)

        if day in [36, 68]:
            fuel += 850.0 # Anomaly

        rows.append({
            "timestamp": date_str,
            "production_output": prod,
            "operating_hours": hours,
            "fuel_consumption": round(fuel, 1),
            "fuel_type": "LPG",
            "equipment_id": "Boiler-Dryer-Indmira-01"
        })
    return rows

def generate_indmira_agro_hourly():
    """
    Studi Kasus 1: PT Indmira Global Energi - Per Jam / SCADA Logger (2,160 Jam / 90 Hari)
    """
    rows = []
    random.seed(42)
    
    for day in range(1, 91):
        date_str = f"2026-10-{(day-1)%30 + 1:02d}" if day <= 30 else (
            f"2026-11-{(day-31)%30 + 1:02d}" if day <= 60 else f"2026-12-{(day-61)%30 + 1:02d}"
        )
        is_shutdown = day in [15, 45, 75]
        is_idle_day = day == 28
        moisture_factor = 1.15 if 40 <= day <= 70 else 1.0

        for hour in range(24):
            time_str = f"{date_str} {hour:02d}:00"
            
            if is_shutdown:
                rows.append({
                    "timestamp": time_str,
                    "production_output": 0.0,
                    "operating_hours": 0.0,
                    "fuel_consumption": 0.0,
                    "fuel_type": "LPG",
                    "equipment_id": "Boiler-Dryer-Indmira-01"
                })
                continue
                
            if is_idle_day:
                # Standby warming up only from 08:00 to 14:00
                if 8 <= hour < 14:
                    rows.append({
                        "timestamp": time_str,
                        "production_output": 0.0,
                        "operating_hours": 1.0,
                        "fuel_consumption": round(63.3 + random.gauss(0, 3.0), 1),
                        "fuel_type": "LPG",
                        "equipment_id": "Boiler-Dryer-Indmira-01"
                    })
                else:
                    rows.append({
                        "timestamp": time_str,
                        "production_output": 0.0,
                        "operating_hours": 0.0,
                        "fuel_consumption": 0.0,
                        "fuel_type": "LPG",
                        "equipment_id": "Boiler-Dryer-Indmira-01"
                    })
                continue

            # Diurnal 3-shift industrial cycle
            # Shift 1 (07:00 - 15:00): Full load 3.5 - 4.5 ton/hr
            # Shift 2 (15:00 - 23:00): Medium load 2.5 - 3.8 ton/hr
            # Shift 3 (23:00 - 07:00): Low/Standby load 1.0 - 2.5 ton/hr
            if 7 <= hour < 15:
                hourly_prod = random.uniform(3.5, 4.5)
            elif 15 <= hour < 23:
                hourly_prod = random.uniform(2.5, 3.8)
            else:
                hourly_prod = random.uniform(1.2, 2.5)

            # Base load per hour ~10.4 kg + 24 kg/ton * prod + noise
            base_fuel = 10.4 + (24.0 * hourly_prod * moisture_factor) + random.gauss(0, 2.5)
            
            # Anomaly spikes on Day 36 & 68 (afternoon burner failure)
            if day in [36, 68] and 13 <= hour <= 19:
                base_fuel += 75.0

            rows.append({
                "timestamp": time_str,
                "production_output": round(hourly_prod, 2),
                "operating_hours": 1.0,
                "fuel_consumption": round(base_fuel, 1),
                "fuel_type": "LPG",
                "equipment_id": "Boiler-Dryer-Indmira-01"
            })
            
    return rows

def generate_us_doe_steam_daily():
    """
    Studi Kasus 2: US DOE Steam Boiler Benchmark - Harian (90 Hari)
    """
    rows = []
    random.seed(101)

    for day in range(1, 91):
        date_str = f"2026-10-{(day-1)%30 + 1:02d}" if day <= 30 else (
            f"2026-11-{(day-31)%30 + 1:02d}" if day <= 60 else f"2026-12-{(day-61)%30 + 1:02d}"
        )
        if day in [20, 50, 80]:
            rows.append({
                "timestamp": date_str,
                "production_output": 0.0,
                "operating_hours": 0.0,
                "fuel_consumption": 0.0,
                "fuel_type": "DIESEL",
                "equipment_id": "US-DOE-SteamBoiler-02"
            })
            continue

        prod = round(random.uniform(70.0, 120.0), 1)
        hours = round(random.uniform(18.0, 24.0), 1)
        base_fuel = 400.0 + (32.0 * prod) + (45.0 * hours)
        fuel = base_fuel + random.gauss(0, 60.0)

        if day in [42, 72]:
            fuel += 1100.0

        rows.append({
            "timestamp": date_str,
            "production_output": prod,
            "operating_hours": hours,
            "fuel_consumption": round(fuel, 1),
            "fuel_type": "DIESEL",
            "equipment_id": "US-DOE-SteamBoiler-02"
        })
    return rows

def generate_us_doe_steam_hourly():
    """
    Studi Kasus 2: US DOE Steam Boiler Benchmark - Per Jam / SCADA Logger (2,160 Jam / 90 Hari)
    """
    rows = []
    random.seed(101)

    for day in range(1, 91):
        date_str = f"2026-10-{(day-1)%30 + 1:02d}" if day <= 30 else (
            f"2026-11-{(day-31)%30 + 1:02d}" if day <= 60 else f"2026-12-{(day-61)%30 + 1:02d}"
        )
        is_shutdown = day in [20, 50, 80]

        for hour in range(24):
            time_str = f"{date_str} {hour:02d}:00"
            if is_shutdown:
                rows.append({
                    "timestamp": time_str,
                    "production_output": 0.0,
                    "operating_hours": 0.0,
                    "fuel_consumption": 0.0,
                    "fuel_type": "DIESEL",
                    "equipment_id": "US-DOE-SteamBoiler-02"
                })
                continue

            if 6 <= hour < 18:
                hourly_prod = random.uniform(4.0, 5.8) # Daytime high steam
            else:
                hourly_prod = random.uniform(2.5, 4.2) # Nighttime lower steam

            # Base load per hour ~16.7 liter + 32 liter/ton * prod + noise
            base_fuel = 16.7 + (32.0 * hourly_prod) + random.gauss(0, 3.5)

            if day in [42, 72] and 10 <= hour <= 16:
                base_fuel += 95.0 # Burner miscalibration spike

            rows.append({
                "timestamp": time_str,
                "production_output": round(hourly_prod, 2),
                "operating_hours": 1.0,
                "fuel_consumption": round(base_fuel, 1),
                "fuel_type": "DIESEL",
                "equipment_id": "US-DOE-SteamBoiler-02"
            })
    return rows

def main():
    root = os.path.dirname(os.path.abspath(__file__))

    # 1. Indmira Agro
    indmira_daily = generate_indmira_agro_daily()
    f1 = os.path.join(root, "indmira_agro_boiler_data.csv")
    with open(f1, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["timestamp", "production_output", "operating_hours", "fuel_consumption", "fuel_type", "equipment_id"])
        w.writeheader()
        w.writerows(indmira_daily)
    print(f"Generated Indmira Daily: {len(indmira_daily)} rows -> {f1}")

    indmira_hourly = generate_indmira_agro_hourly()
    f2 = os.path.join(root, "indmira_agro_boiler_hourly.csv")
    with open(f2, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["timestamp", "production_output", "operating_hours", "fuel_consumption", "fuel_type", "equipment_id"])
        w.writeheader()
        w.writerows(indmira_hourly)
    print(f"Generated Indmira Hourly: {len(indmira_hourly)} rows -> {f2}")

    # 2. US DOE Benchmark
    doe_daily = generate_us_doe_steam_daily()
    f3 = os.path.join(root, "us_doe_steam_boiler_data.csv")
    with open(f3, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["timestamp", "production_output", "operating_hours", "fuel_consumption", "fuel_type", "equipment_id"])
        w.writeheader()
        w.writerows(doe_daily)
    print(f"Generated US DOE Daily: {len(doe_daily)} rows -> {f3}")

    doe_hourly = generate_us_doe_steam_hourly()
    f4 = os.path.join(root, "us_doe_steam_boiler_hourly.csv")
    with open(f4, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["timestamp", "production_output", "operating_hours", "fuel_consumption", "fuel_type", "equipment_id"])
        w.writeheader()
        w.writerows(doe_hourly)
    print(f"Generated US DOE Hourly: {len(doe_hourly)} rows -> {f4}")

if __name__ == "__main__":
    main()
