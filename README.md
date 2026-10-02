# Industrial Energy Efficiency Copilot & CNG Transition Platform

**ANGEL Innovation Hackathon 2026**  
**Track:** Sustainable Energy | Priority 1: Industrial Energy Efficiency Copilot  
**Solution Proposer:** PT Aqua Gas Energi (AGE)  
**Target Industrial Client / Problem Owner:** PT Indmira Global Energi (Agro-Industry, Organic Fertilizer & Biotechnology, Sleman, D.I. Yogyakarta)  
**Authors:** Dimas Oktavian Prasetyo (Product Lead & UI/UX) & Thermal Engineering Team of PT Aqua Gas Energi  

---

## 1. Executive Summary

The Industrial Energy Efficiency Copilot is a distributed, sales-engineering and operational energy audit platform engineered by PT Aqua Gas Energi (AGE). It empowers industrial thermal facilities—such as agro-industrial dryers and steam boilers operated by PT Indmira Global Energi—to audit operational energy telemetry, detect baseline anomalies and thermodynamic waste, and simulate techno-economic fuel transition to Compressed Natural Gas (CNG) with 100% mathematical traceability.

Operating across distributed microservices (Python gRPC + FastAPI Gateway + React TypeScript frontend), the platform addresses the primary bottleneck preventing industrial clients from adopting cleaner fuels: the lack of verifiable baseline models, uncertainty around capital payback periods, and unquantified carbon reduction trajectories.

---

## 2. Industrial Challenges & Problem Statement

### 2.1 The Operational Energy Dilemma
Industrial process heating accounts for more than 60% of total energy consumption in manufacturing. Facilities such as fertilizer granulation dryers, chemical reactors, and industrial boilers commonly encounter the following operational challenges:

1. **High Fossil Fuel Expenditure:** Many decentralized agro-processing plants rely on Liquefied Petroleum Gas (LPG) at IDR 14,000–16,000/kg or High-Speed Diesel (HSD/Solar) at IDR 15,500/liter. These fuels carry high unit energy costs ($Q_{\text{useful}}$ ranging from IDR 380,000 to IDR 580,000 per useful GJ).
2. **Hidden Operational Waste (Idle and Firing Inefficiencies):** Boilers and dryers are frequently operated at suboptimal air-fuel ratios, leading to elevated flue gas temperatures ($>350^\circ\text{C}$) and unmonitored standby burner idling during process feed interruptions.
3. **The Industrial Fuel Switching Trust Barrier:** Plant directors and finance teams resist converting legacy burners to natural gas due to unverified vendor claims regarding capital expenditure (CAPEX) payback periods, disruption risks, and uncalibrated efficiency assumptions.
4. **Data Granularity Disconnect:** While plant supervisory control and data acquisition (SCADA) systems generate high-frequency time series (sampling at 5-second to 1-minute intervals), energy managers traditionally only audit aggregate monthly utility invoices, concealing intraday operational deviations.

### 2.2 The Strategic Role of PT Aqua Gas Energi (AGE)
PT Aqua Gas Energi provides clean industrial energy through virtual gas pipeline logistics (CNG tube trailers and pressure reduction systems). Rather than acting purely as a commodity gas supplier, AGE deploys this Copilot as a sales-engineering audit platform to establish a credible, mutually verifiable business case for clients:
* Ingest the client's current operational logs (LPG or Diesel).
* Model baseline energy consumption according to US DOE and ASHRAE standards.
* Pinpoint cumulative operational losses and root causes.
* Demonstrate mathematically how switching to AGE's CNG supply reduces useful thermal energy costs by 37.7% to 58.5%, with capital recovery achieved within 12 to 15 months.

---

## 3. System Architecture & Engineering Stack

The platform is designed around a decoupled, microservices-based topology communicating through gRPC (high-throughput binary serialization) and WebSockets (real-time telemetry and pipeline streaming), supported by REST endpoints for fallback resilience.

```
+---------------------------------------------------------------------------------------+
|                                    REACT FRONTEND                                     |
|                       (TypeScript + Vite + Tailwind CSS + Recharts)                   |
|                                                                                       |
|   - Real-time Pipeline Progress Monitoring       - Dual-Granularity Selector          |
|   - Interactive Multivariate Scatter & Baseline  - CNG Techno-Economic Simulator      |
|   - Mathematical Traceability Modal              - Executive Management Report        |
+------------------------------------------+--------------------------------------------+
                                           |
                                [WebSocket / JSON REST]
                                           |
+------------------------------------------v--------------------------------------------+
|                              FASTAPI API GATEWAY (Port 8000)                          |
|                                                                                       |
|   - Protocol Translation (JSON/WS <-> Protobuf/gRPC)                                  |
|   - CSV Ingestion, Parsing, Sanitization, & Schema Validation                         |
|   - Real-time Stage Progression & Streaming Broadcaster                               |
+---------------------+-----------------------------------------+-----------------------+
                      |                                         |
               [gRPC Channel]                            [gRPC Channel]
             (localhost:50051)                         (localhost:50052)
                      |                                         |
+---------------------v--------------------+ +------------------v----------------------+
|       ANALYTICS ENGINE MICROSERVICE      | |      CNG TRANSITION MICROSERVICE        |
|               (Port 50051)               | |              (Port 50052)               |
|                                          | |                                         |
|  - Unit Normalization (LHV Table)        | |  - Useful Thermal Heat Cost ($/GJ)      |
|  - Data Quality Audit (Negative/Idle)    | |  - Annual Operating Cost Differential   |
|  - US DOE Multivariate Regression        | |  - Burner Retrofit CAPEX Payback Period |
|  - Anomaly Detection (> +1.5 sigma)      | |  - IPCC 2006 CO2 Emission Reduction     |
|  - 100% Traceability Audit Trail Matrix  | |  - Supply Sizing & Recommendation Engine|
+------------------------------------------+ +-----------------------------------------+
```

### 3.1 Technology Stack Summary
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts (Responsive Canvas / SVG plotting).
* **API Gateway:** FastAPI, Uvicorn, Python WebSockets, Multipart Form Parsers.
* **Microservices Communication:** gRPC over HTTP/2, Google Protocol Buffers (v3).
* **Data Science & Analytics:** NumPy, SciPy, Scikit-learn, Pandas, OpenPyXL.
* **Underlying Standards:** US DOE Industrial Assessment Protocols, ASHRAE Guideline 14-2014, ASME PTC 4 Combustion Testing, IPCC 2006 Stationary Combustion Guidelines.

---

## 4. Mathematical & Thermodynamic Formulation

All calculations executed by the microservices are deterministic, auditable, and traceable to international engineering standards.

### 4.1 Heating Value & Energy Normalization
To resolve inconsistencies across volumetric, gravimetric, and imperial units, all fuel quantities are converted to Lower Heating Value (LHV) energy metrics:

$$E_{\text{input}} = M_{\text{fuel}} \times LHV_{\text{fuel}}$$

Where:
* LPG Industri: $LHV = 46.10\text{ MJ/kg} = 0.04610\text{ GJ/kg}$
* Solar / Diesel (HSD): $LHV = 35.80\text{ MJ/L} = 0.03580\text{ GJ/L}$
* Natural Gas / CNG: $LHV = 48.00\text{ MJ/kg} \approx 0.03800\text{ GJ/Nm}^3$ ($1\text{ MMBtu} = 1.055056\text{ GJ}$)

### 4.2 Specific Energy Consumption (SEC / IKE)
Intensitas Konsumsi Energi (IKE) evaluates thermal efficiency relative to net physical production:

$$IKE_i = \frac{E_{\text{input}, i}}{P_i} \quad \left[\frac{\text{GJ}}{\text{Ton}}\right]$$

### 4.3 US DOE / ASHRAE Guideline 14 Multivariate Baseline Model
Following ASHRAE Guideline 14 Option C for whole-facility energy modeling, baseline fuel consumption is formulated as a function of driving physical variables (production output $P$ and operating hours $H$):

$$\hat{E}_i = \beta_1 P_i + \beta_2 H_i + c$$

The parameters $\vec{\beta} = [\beta_1, \beta_2]^T$ and intercept $c$ are computed via Ordinary Least Squares (OLS):

$$\vec{\beta} = \left( \mathbf{X}^T \mathbf{X} \right)^{-1} \mathbf{X}^T \vec{Y}$$

Goodness of fit is validated against ASHRAE thresholds ($R^2 \ge 0.70$, $CV(RMSE) \le 30\%$):

$$R^2 = 1 - \frac{\sum_{i=1}^N (E_i - \hat{E}_i)^2}{\sum_{i=1}^N (E_i - \bar{E})^2}$$

$$CV(RMSE) = \frac{\sqrt{\frac{1}{N-p} \sum_{i=1}^N (E_i - \hat{E}_i)^2}}{\bar{E}} \times 100\%$$

### 4.4 Anomaly Detection & Operational Waste Quantification
Residual deviations between measured fuel and modeled baseline define instantaneous operational performance:

$$e_i = E_i - \hat{E}_i$$

An operational anomaly is flagged when positive residuals exceed 1.5 sample standard deviations:

$$\text{Flag}_i = \begin{cases} 
\text{ANOMALY (High Waste)}, & \text{if } e_i > +1.5\sigma_e \\ 
\text{NORMAL}, & \text{otherwise} 
\end{cases}$$

Cumulative operational energy waste ($Q_{\text{waste}}$) and its financial impact are calculated across anomalous operational periods and idle consumption days ($P_i = 0$ while $E_i > 0$):

$$Q_{\text{waste}} = \sum_{i \in \text{Anomalies}} (E_i - \hat{E}_i) + \sum_{i \in \text{Idle}} E_i$$

$$\text{Financial Loss (IDR)} = Q_{\text{waste}} \times \text{Cost per GJ of baseline fuel}$$

### 4.5 Combustion Efficiency via Siegert Formulation
When flue gas temperature and excess oxygen sensor data are available (as in SCADA data), combustion efficiency is evaluated via the Siegert formula:

$$q_{\text{stack}} = K \times \frac{T_{\text{flue}} - T_{\text{ambient}}}{21 - O_{2,\text{excess}}}$$

$$\eta_{\text{thermal}} = 100\% - (q_{\text{stack}} + q_{\text{radiation}} + q_{\text{unburnt}})$$

For hydrocarbon fuel oils and gas, $K \approx 0.58$, with unmeasured radiation and convection losses estimated at $12\%–14\%$.

### 4.6 Techno-Economic Fuel Switching to CNG
Cost per unit of useful heat delivered to process steam or hot air accounts for thermal combustion efficiency ($\eta$):

$$C_{\text{useful}} = \frac{\text{Fuel Cost per GJ}}{\eta_{\text{thermal}}}$$

Annual operating cost savings resulting from transition to CNG are computed as:

$$\Delta C_{\text{annual}} = E_{\text{annual demand}} \times \left( C_{\text{useful, current}} - C_{\text{useful, CNG}} \right)$$

Simple Payback Period (PBP) for the burner and Pressure Reduction System (PRS) retrofit is given by:

$$PBP = \frac{\text{CAPEX}_{\text{retrofit}}}{\Delta C_{\text{annual}}} \quad [\text{Years}]$$

$$\text{Payback (Months)} = PBP \times 12$$

### 4.7 Greenhouse Gas Emission Reductions (IPCC 2006)
Emission reduction calculations adhere to IPCC 2006 Guidelines for National Greenhouse Gas Inventories (Volume 2, Energy, Chapter 2 Stationary Combustion):
* LPG: $63.10\text{ kg }CO_2/\text{GJ}$
* Industrial Diesel (HSD): $74.10\text{ kg }CO_2/\text{GJ}$
* Natural Gas (CNG): $56.10\text{ kg }CO_2/\text{GJ}$

$$\Delta CO_2 = \frac{E_{\text{useful}}}{\eta_{\text{current}}} \times EF_{\text{current}} - \frac{E_{\text{useful}}}{\eta_{\text{CNG}}} \times EF_{\text{CNG}}$$

---

## 5. Dual-Granularity Data Ingestion & Ground Truth Benchmarks

The platform supports dual temporal granularities to serve both high-level managerial audits and granular engineering diagnostics.

### 5.1 Dual-Granularity Overview
* **Daily Log Mode (90 Rows / 1 Quarter):** Corresponds to plant daily production logbooks. Consolidates 24-hour production output, operating hours, and total fuel burned. Highly responsive for executive review without client-side SVG rendering overhead.
* **Hourly SCADA Mode (2,160 Rows / 90 Days):** Reflects digital instrumentation telemetry sampled hourly from SCADA systems. Captures diurnal shift variations (Day shift high load vs. night shift low load) and instantaneous burner idling.

### 5.2 Case Study Datasets Built Into the System
1. **Case Study 1: PT Indmira Global Energi (Agro-Boiler & Rotary Fertilizer Dryer)**
   * **Fuel:** Industrial LPG ($LHV = 46.10\text{ MJ/kg}$).
   * **Telemetry:** 90 daily rows and 2,160 hourly SCADA rows.
   * **Characteristics:** Captures moisture variations across wet seasons (feedstock moisture $+15\%$), planned maintenance shutdowns (Days 15, 45, 75), standby warm-up idling (Day 28), and burner miscalibration anomalies (Days 36 and 68).
   * **Model Fit:** $R^2 = 0.9238$ (Daily) and $R^2 = 0.9145$ (Hourly).
   * **CNG Transition Outcome:** 37.7% reduction in useful energy costs, 352.8 tonnes $CO_2$/year reduced, payback within 0.5–1.2 months.

2. **Case Study 2: US DOE Manufacturing Benchmark (Steam Boiler Solar / Diesel)**
   * **Fuel:** Industrial Diesel ($LHV = 35.80\text{ MJ/L}$).
   * **Telemetry:** 90 daily rows and 2,160 hourly SCADA rows.
   * **Characteristics:** Calibrated against US Department of Energy Advanced Manufacturing Office (AMO) steam system profiles.
   * **Model Fit:** $R^2 = 0.9625$ (Daily) and $R^2 = 0.9589$ (Hourly).
   * **CNG Transition Outcome:** 58.5% reduction in useful energy costs, 833.7 tonnes $CO_2$/year reduced, payback within 0.3–1.0 months.

3. **Case Study 3: Nature Scientific Data Industrial Telemetry (60-Ton Superheated Steam Boiler)**
   * **Source:** Open-access industrial telemetry published in *Nature Scientific Data* (2025).
   * **Telemetry Volume:** 86,400 raw sensor records sampled at 5-second intervals over 5 days, aggregated into 119 hourly observations.
   * **Physical Sensors:** Main steam flow rate (`ZZQBCHLL.AV_0` avg $59.8\text{ ton/hr}$), steam temperature (`TE_8332A.AV_0` avg $537.5^\circ\text{C}$), economizer flue gas temperature (`TE_8319A.AV_0` avg $356.9^\circ\text{C}$), and excess $O_2$ (`AIR_8301A.AV_0` avg $2.09\%$).
   * **Model Fit:** $R^2 = 0.9950$ (validating physical heat balance under ASME PTC 4).

### 5.3 Macro-Financial Ground Truth: US DOE ITAC Database
To validate financial projections, our analytics pipeline queried the official U.S. Department of Energy Industrial Training & Assessment Centers (ITAC) database (October 2026 release, 16.8 MB, 23,000+ plant audits, 170,000+ recommendations):
* **Total Boiler Recommendations (ARC 2.2x):** 20,910 records.
* **Fuel Switching & Combustion Recommendations (ARC 2.21 & 2.23):** 10,958 plants analyzed.
* **Average Empirical Payback Period:** 1.50 years (18.0 months).
* **Median Empirical Payback Period:** 1.04 years (12.5 months).

This real-world benchmark is surfaced dynamically in the Copilot Executive Decision Report to corroborate the platform's calculated payback estimates against global empirical evidence.

---

## 6. Repository Structure

```
.
├── backend/
│   ├── gateway/
│   │   ├── app.py                     # FastAPI Gateway: WebSocket & REST endpoints
│   │   └── grpc_client.py             # gRPC client stubs and IPC connection wrappers
│   ├── proto/
│   │   ├── energy_copilot_pb2.py      # Generated protobuf message classes
│   │   └── energy_copilot_pb2_grpc.py # Generated protobuf gRPC service interfaces
│   ├── services/
│   │   ├── analytics_service.py       # gRPC Service (Port 50051): Regression & Audits
│   │   └── cng_service.py             # gRPC Service (Port 50052): Techno-economic modeling
│   ├── test_data/
│   │   ├── generate_benchmark_datasets.py # Dual-granularity data synthesis script
│   │   ├── process_kaggle_dataset.py      # Downsampler for 86,400 raw sensor records
│   │   ├── indmira_agro_boiler_data.csv   # Case 1: Indmira 90-day daily dataset
│   │   ├── indmira_agro_boiler_hourly.csv # Case 1: Indmira 2,160-hour SCADA dataset
│   │   ├── us_doe_steam_boiler_data.csv   # Case 2: US DOE 90-day daily dataset
│   │   ├── us_doe_steam_boiler_hourly.csv # Case 2: US DOE 2,160-hour SCADA dataset
│   │   ├── kaggle_real_steam_boiler_data.csv # Case 3: Nature SciData 119-hour dataset
│   │   └── test_integration.py        # Automated end-to-end integration test runner
│   ├── requirements.txt               # Backend Python dependencies
│   └── run_all.py                     # Multi-process orchestrator for backend services
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx             # Navigation, case switcher, & granularity toggle
│   │   │   ├── DataIngestionSection.tsx # File drag-and-drop & quality report cards
│   │   │   ├── IKEBaselineSection.tsx # Recharts scatter plot & regression line
│   │   │   ├── CNGSimulatorSection.tsx# Interactive techno-economic parameter inputs
│   │   │   ├── DecisionReport.tsx     # Executive summary with US DOE benchmark banner
│   │   │   └── TraceabilityModal.tsx  # Step-by-step mathematical audit matrix
│   │   ├── services/
│   │   │   ├── sampleData.ts          # Embedded dual-granularity CSV datasets
│   │   │   └── websocket.ts           # Resilient WebSocket connection & REST fallback
│   │   ├── types.ts                   # TypeScript interfaces matching protobuf schemas
│   │   ├── App.tsx                    # Top-level state coordinator and layout
│   │   ├── main.tsx                   # React application entry point
│   │   └── index.css                  # Design tokens, glassmorphism, & dark mode theme
│   ├── index.html                     # HTML document template
│   ├── package.json                   # Frontend scripts and npm package definitions
│   ├── tailwind.config.js             # Tailwind CSS design system tokens
│   ├── postcss.config.js              # PostCSS plugin configurations
│   ├── tsconfig.json                  # TypeScript compiler settings
│   └── vite.config.ts                 # Vite bundler configurations
├── proto/
│   └── energy_copilot.proto           # Core Protocol Buffer interface definitions
└── README.md                          # Comprehensive project documentation
```

---

## 7. Protocol Buffer & API Specifications

The cross-service contracts are defined in `proto/energy_copilot.proto`.

### 7.1 Protocol Buffer Definition (`energy_copilot.proto`)

```protobuf
syntax = "proto3";

package energy_copilot;

service AnalyticsService {
  rpc IngestData (IngestionRequest) returns (IngestionResponse);
  rpc CalculateBaseline (BaselineRequest) returns (BaselineResponse);
  rpc GetTraceabilityMatrix (TraceabilityRequest) returns (TraceabilityResponse);
}

service CngService {
  rpc SimulateTransition (CngSimulationRequest) returns (CngSimulationResponse);
}

message NormalizedRecord {
  string timestamp = 1;
  double production_output = 2;
  double operating_hours = 3;
  double fuel_consumption = 4;
  string fuel_type = 5;
  double fuel_energy_gj = 6;
  double ike_gj_per_ton = 7;
  string equipment_id = 8;
}

message IngestionRequest {
  string csv_raw_content = 1;
  string default_fuel_type = 2;
}

message IngestionResponse {
  int32 total_rows = 1;
  int32 accepted_rows = 2;
  int32 rejected_rows = 3;
  repeated string issues = 4;
  repeated NormalizedRecord normalized_records = 5;
}

message BaselineRequest {
  repeated NormalizedRecord records = 1;
}

message BaselineResponse {
  double beta_production = 1;
  double beta_hours = 2;
  double intercept = 3;
  double r_squared = 4;
  double cv_rmse = 5;
  double average_ike = 6;
  double total_wasted_energy_gj = 7;
  double total_wasted_cost_idr = 8;
  repeated DataPoint data_points = 9;
}

message DataPoint {
  string timestamp = 1;
  double production_output = 2;
  double operating_hours = 3;
  double actual_energy_gj = 4;
  double baseline_energy_gj = 5;
  double residual_gj = 6;
  bool is_anomaly = 7;
  string root_cause = 8;
}

message CngSimulationRequest {
  string current_fuel = 1;
  double current_fuel_price_idr = 2;
  double current_thermal_efficiency = 3;
  double cng_price_idr_per_mmbtu = 4;
  double target_cng_efficiency = 5;
  double retrofit_capex_idr = 6;
  double annual_energy_demand_gj = 7;
}

message CngSimulationResponse {
  double current_cost_per_useful_gj = 1;
  double cng_cost_per_useful_gj = 2;
  double annual_fuel_cost_current_idr = 3;
  double annual_fuel_cost_cng_idr = 4;
  double annual_savings_idr = 5;
  double cost_savings_percent = 6;
  double payback_period_months = 7;
  double co2_reduction_tonnes = 8;
  double co2_reduction_percent = 9;
  string technical_recommendation = 10;
}

message TraceabilityRequest {
  string simulation_id = 1;
}

message TraceabilityItem {
  string step_name = 1;
  string formula_applied = 2;
  string standard_reference = 3;
  string input_values = 4;
  string output_value = 5;
}

message TraceabilityResponse {
  repeated TraceabilityItem audit_items = 1;
}
```

### 7.2 WebSocket Protocol (`ws://localhost:8000/ws/copilot`)
Clients initiate the calculation pipeline by transmitting an action payload:

```json
{
  "action": "RUN_FULL_PIPELINE",
  "payload": {
    "csv_raw": "<raw_csv_string>",
    "fuel_type": "LPG",
    "cng_params": {
      "current_fuel": "LPG",
      "current_fuel_price_idr": 14000,
      "current_thermal_efficiency": 0.78,
      "cng_price_idr_per_mmbtu": 215000,
      "target_cng_efficiency": 0.84,
      "retrofit_capex_idr": 150000000
    }
  }
}
```

The gateway streams status updates during calculation stages:
* `{"type": "PROGRESS", "progress": 25, "message": "Memeriksa Integritas CSV..."}`
* `{"type": "PROGRESS", "progress": 50, "message": "Normalisasi Nilai Kalor (LHV)..."}`
* `{"type": "PROGRESS", "progress": 75, "message": "Menghitung Regresi Multivariat US DOE..."}`
* `{"type": "PIPELINE_COMPLETE", "payload": { "quality": {...}, "baseline": {...}, "cng": {...}, "audit_trail": [...] }}`

---

## 8. Installation & Setup Guide

### 8.1 System Prerequisites
* Operating System: Windows 10/11, macOS, or Linux
* Python: Version 3.10 or newer (Python 3.11+ recommended)
* Node.js: Version 18.0 or newer with npm
* Git

### 8.2 Backend Setup
1. Clone the repository and navigate to the backend directory:
   ```bash
   git clone https://github.com/dimasoktavianprasetyo/aquagasenergy-hackathon.git
   cd "Aqua Gas Energy - Angel Innovation Hackathon/backend"
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Regenerate Protocol Buffer stubs (if schema is modified):
   ```bash
   python -m grpc_tools.protoc -I../proto --python_out=./proto --grpc_python_out=./proto ../proto/energy_copilot.proto
   ```

### 8.3 Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Build and verify the frontend distribution bundle:
   ```bash
   npm run build
   ```

---

## 9. Running the Application

### 9.1 Launching the Backend Microservices
The backend provides an orchestrator script that initializes the Analytics gRPC service (port 50051), the CNG gRPC service (port 50052), and the FastAPI Gateway (port 8000) concurrently within a single supervisor process:

```bash
# From the backend directory with virtual environment active:
python run_all.py
```

Expected startup output:
```text
======================================================================
  INDUSTRIAL ENERGY EFFICIENCY COPILOT - MICROSERVICES RUNNER
  ANGEL Innovation Hackathon 2026 | PT Indmira & PT Aqua Gas Energy
======================================================================
[gRPC:50051] Starting Analytics Microservice...
[gRPC:50052] Starting CNG Transition Microservice...
[HTTP:8000] Starting FastAPI & WebSocket Gateway...
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 9.2 Launching the React Development Server
In a separate terminal:

```bash
# From the frontend directory:
npm run dev -- --host
```

Open a web browser and navigate to:
```text
http://localhost:5173
```

---

## 10. Automated Testing & Verification

An automated end-to-end integration test runner is provided in `backend/test_data/test_integration.py`. It tests the full data pipeline across both temporal granularities (Daily and Hourly) for all three case studies against live gRPC microservices and the HTTP Gateway:

```bash
# From the project root:
backend\.venv\Scripts\python backend/test_data/test_integration.py
```

### 10.1 Integration Test Verification Results
```text
===================================================================================
  VERIFIKASI INTEGRASI DUAL-GRANULARITY (HARIAN 90 HARI & HOURLY SCADA 2,160 BARIS)
===================================================================================
[1A. INDMIRA (HARIAN - 90 BARIS)]        -> R²: 0.9238 | Diterima: 90 Baris   | Hemat: 37.7%
[2A. US DOE (HARIAN - 90 BARIS)]         -> R²: 0.9625 | Diterima: 90 Baris   | Hemat: 58.5%
[1B. INDMIRA (HOURLY SCADA - 2,160 BARIS)]-> R²: 0.9145 | Diterima: 2.160 Baris| Hemat: 37.7%
[2B. US DOE (HOURLY SCADA - 2,160 BARIS)] -> R²: 0.9589 | Diterima: 2.160 Baris| Hemat: 58.5%
[3.  KAGGLE / NATURE SENSOR (119 JAM)]    -> R²: 0.9950 | Diterima: 119 Baris  | Hemat: 58.5%

[OK] SELURUH DATASET HARIAN & PER JAM (SCADA 2,160 BARIS) DIVERIFIKASI 100%!
```

All baseline fits surpass the ASHRAE Guideline 14 acceptance threshold ($R^2 \ge 0.70$), with processing times under 0.25 seconds per dataset.

---

## 11. Technology Readiness Level & Commercialization Roadmap

### 11.1 Current Status: Technology Readiness Level 3 (TRL 3)
The current implementation represents a functional Analytical Proof-of-Concept (Alpha Prototype):
* Synthetic and open-source real telemetry validation complete.
* Microservices intercommunication and mathematical traceability validated.
* Web-based decision support reporting operational.

### 11.2 Next Phases (Post-Hackathon)
* **TRL 4 (Laboratory Validation):** Hardware-in-the-loop (HIL) testing using physical burner controllers and Edge IoT logger hardware (Modbus RTU over RS-485 / MQTT to FastAPI Gateway).
* **TRL 5–6 (Pilot Field Deployment at PT Indmira):** Installation of gas flow meters and temperature sensors on Indmira's rotary organic fertilizer dryer in Sleman; initial trial conversion of one dual-fuel burner to AGE CNG supply.
* **TRL 7–8 (Commercial Scaling):** Deployment of automated burner trim controls, multi-facility fleet monitoring for AGE industrial clients across Central Java and D.I. Yogyakarta, and integration with carbon credit registries under Indonesia's SRN-PPI (Sistem Registrasi Nasional Pengendalian Perubahan Iklim).

---

## 12. License & Attribution

Developed for the **ANGEL Innovation Hackathon 2026**.  
Copyright 2026 PT Aqua Gas Energi (AGE) & PT Indmira Global Energi. All rights reserved.  
Calculations and baseline models follow guidelines published by the U.S. Department of Energy (DOE), ASHRAE, ASME, and the Intergovernmental Panel on Climate Change (IPCC). Open-access boiler operational telemetry provided under Creative Commons licensing via *Nature Scientific Data* (2025).
