export type RecordType = 
  | 'PRESCRIPTION' 
  | 'LAB_REPORT' 
  | 'DISCHARGE_SUMMARY' 
  | 'DIAGNOSTIC_IMAGING' 
  | 'WELLNESS';

export type ValueStatus = 
  | 'NORMAL' 
  | 'BORDERLINE' 
  | 'LOW' 
  | 'HIGH' 
  | 'CRITICAL';

export interface Medication {
  name: string;
  generic_name?: string;
  strength: string;
  frequency: string;
  timing: string;
  route: string;
  duration: string;
  purpose?: string;
  instructions?: string;
  interaction_warnings: string[];
}

export interface LabValue {
  test_name: string;
  category: string;
  loinc_code?: string;
  value: number;
  unit: string;
  reference_range: string;
  min_ref?: number;
  max_ref?: number;
  status: ValueStatus;
  explanation: string;
  risk_level: string;
}

export interface Diagnosis {
  condition_name: string;
  icd10_code?: string;
  severity: string;
  clinical_status: string;
  explanation: string;
}

export interface AISummary {
  plain_language_overview: string;
  eli5_summary: string;
  abnormal_findings_explained: string[];
  patient_action_items: string[];
  dietary_lifestyle_advice: string[];
  questions_for_doctor: string[];
  red_flag_warnings: string[];
  medical_disclaimer: string;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  title: string;
  record_type: RecordType;
  record_date: string;
  doctor_name?: string;
  facility_name?: string;
  department?: string;
  raw_ocr_text: string;
  extracted_medications: Medication[];
  extracted_lab_values: LabValue[];
  diagnoses: Diagnosis[];
  ai_summary: AISummary;
  fhir_resource_id?: string;
  language_code: string;
  created_at: string;
}

export interface VitalMetricPoint {
  date: string;
  value: number;
  unit: string;
  status: ValueStatus;
  record_id: string;
}

export interface PatientProfile {
  patient_id: string;
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  abha_id?: string;
  abha_address?: string;
  is_abha_linked: boolean;
  allergies: string[];
  chronic_conditions: string[];
  active_medications_count: number;
  total_records_count: number;
  vital_trends: Record<string, VitalMetricPoint[]>;
}

export interface ABHACard {
  abha_number: string;
  abha_address: string;
  full_name: string;
  gender: string;
  dob: string;
  mobile: string;
  qr_data: string;
  verification_status: string;
  abdm_facility: string;
  issued_at: string;
}

export interface ChatCitation {
  document_id: string;
  title: string;
  date: string;
}

export interface ComparisonItem {
  test_name: string;
  previous_value: string;
  latest_value: string;
  unit: string;
  change: string;
  status: string;
  source: string;
  explanation: string;
}

export interface ChatStructuredCard {
  type: string;
  title: string;
  date?: string;
  facility?: string;
  previous_date?: string;
  latest_date?: string;
  items?: ComparisonItem[];
  patient?: string;
  doctor?: string;
  recent_improvements?: string[];
  questions_to_ask?: string[];
  active_count?: number;
  short_term_count?: number;
  safety_alert?: string;
  verified_items?: string[];
  unverified_items?: string[];
  key_findings?: string[];
  doctor_review?: string;
  record_id?: string;
  extracted_labs_count?: number;
  abnormal_count?: number;
  extracted_meds_count?: number;
  key_takeaway?: string;
  total_records?: number;
  active_conditions?: string[];
  allergies?: string[];
  vital_status?: string;
}

export interface ChatMessage {
  id: string;
  role?: 'user' | 'assistant';
  sender?: 'user' | 'assistant';
  content: string;
  text?: string;
  timestamp: string;
  citations?: ChatCitation[];
  structured_card?: ChatStructuredCard;
  ai_provider?: string;
  references?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

