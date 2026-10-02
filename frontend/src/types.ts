export interface DataQualityIssue {
  row_index: number;
  column_name: string;
  issue_type: string;
  description: string;
}

export interface NormalizedDataPoint {
  timestamp: string;
  production_output: number;
  operating_hours: number;
  fuel_consumption_native: number;
  native_unit: string;
  energy_input_gj: number;
  energy_input_mmbtu: number;
  ike_gj_per_ton: number;
  equipment_id: string;
}

export interface QualityReport {
  is_valid: boolean;
  total_rows: number;
  accepted_rows: number;
  rejected_rows: number;
  summary_message: string;
  issues: DataQualityIssue[];
}

export interface BaselineModelParams {
  r_squared: number;
  slope_production: number;
  slope_hours: number;
  base_load_intercept: number;
  regression_formula: string;
  std_residual: number;
}

export interface AnomalyPoint {
  timestamp: string;
  actual_energy_gj: number;
  baseline_energy_gj: number;
  deviation_gj: number;
  deviation_percent: number;
  is_anomaly: boolean;
  estimated_excess_cost_idr: number;
  probable_cause: string;
}

export interface BaselineResponse {
  model: BaselineModelParams;
  points: AnomalyPoint[];
  average_ike: number;
  total_actual_energy_gj: number;
  total_baseline_energy_gj: number;
  total_wasted_energy_gj: number;
  total_wasted_cost_idr: number;
}

export interface TraceabilityStep {
  step_name: string;
  formula_applied: string;
  input_parameters: string;
  calculation_result: string;
  standard_reference: string;
  engineering_rationale: string;
}

export interface CNGSimResult {
  current_cost_per_useful_gj: number;
  cng_cost_per_useful_gj: number;
  cost_savings_percent: number;
  annual_current_fuel_cost: number;
  annual_cng_fuel_cost: number;
  annual_gross_savings_idr: number;
  payback_period_months: number;
  simple_roi_percent: number;
  current_annual_co2_tonnes: number;
  cng_annual_co2_tonnes: number;
  co2_reduction_tonnes: number;
  co2_reduction_percent: number;
  is_recommended: boolean;
  recommendation_summary: string;
}

export interface PipelineCompletePayload {
  quality: QualityReport;
  baseline: BaselineResponse;
  cng: CNGSimResult;
  audit_trail: TraceabilityStep[];
}

export interface WebSocketMessage {
  type: 'CONNECTION_ESTABLISHED' | 'PROGRESS' | 'PIPELINE_COMPLETE' | 'ERROR';
  stage?: string;
  progress?: number;
  message?: string;
  payload?: PipelineCompletePayload;
}
