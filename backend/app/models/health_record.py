from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class RecordType(str, Enum):
    PRESCRIPTION = "PRESCRIPTION"
    LAB_REPORT = "LAB_REPORT"
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY"
    DIAGNOSTIC_IMAGING = "DIAGNOSTIC_IMAGING"
    WELLNESS = "WELLNESS"

class ValueStatus(str, Enum):
    NORMAL = "NORMAL"
    BORDERLINE = "BORDERLINE"
    LOW = "LOW"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Medication(BaseModel):
    name: str
    generic_name: Optional[str] = None
    strength: str
    frequency: str  # e.g., "1-0-1 (Twice daily)"
    timing: str     # e.g., "After meals"
    route: str = "Oral"
    duration: str   # e.g., "30 days"
    purpose: Optional[str] = None
    instructions: Optional[str] = None
    interaction_warnings: List[str] = Field(default_factory=list)

class LabValue(BaseModel):
    test_name: str
    category: str = "General"  # e.g., Glycemic, Lipid, Renal, Hematology
    loinc_code: Optional[str] = None
    value: float
    unit: str
    reference_range: str
    min_ref: Optional[float] = None
    max_ref: Optional[float] = None
    status: ValueStatus = ValueStatus.NORMAL
    explanation: str  # Plain English explanation
    risk_level: str = "Low"  # Low, Moderate, High, Critical

class Diagnosis(BaseModel):
    condition_name: str
    icd10_code: Optional[str] = None
    severity: str = "Moderate"  # Mild, Moderate, Severe, Chronic
    clinical_status: str = "Active"  # Active, Inactive, Resolved
    explanation: str

class AISummary(BaseModel):
    plain_language_overview: str
    eli5_summary: str  # "Explain Like I'm 5"
    abnormal_findings_explained: List[str] = Field(default_factory=list)
    patient_action_items: List[str] = Field(default_factory=list)
    dietary_lifestyle_advice: List[str] = Field(default_factory=list)
    questions_for_doctor: List[str] = Field(default_factory=list)
    red_flag_warnings: List[str] = Field(default_factory=list)
    medical_disclaimer: str = (
        "IMPORTANT NOTICE: This AI analysis is for informational and organizational "
        "purposes only. It is not medical advice, diagnosis, or treatment. Always consult "
        "a qualified healthcare provider for clinical decisions."
    )

class HealthRecord(BaseModel):
    id: str
    patient_id: str = "PENTABYTE-PATIENT-001"
    title: str
    record_type: RecordType
    record_date: str
    doctor_name: Optional[str] = "Dr. S. Radhakrishnan, MD"
    facility_name: Optional[str] = "Apollo Multispeciality Hospital"
    department: Optional[str] = "Internal Medicine"
    raw_ocr_text: str
    extracted_medications: List[Medication] = Field(default_factory=list)
    extracted_lab_values: List[LabValue] = Field(default_factory=list)
    diagnoses: List[Diagnosis] = Field(default_factory=list)
    ai_summary: AISummary
    fhir_resource_id: Optional[str] = None
    language_code: str = "en"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class VitalMetricPoint(BaseModel):
    date: str
    value: float
    unit: str
    status: ValueStatus
    record_id: str

class PatientProfile(BaseModel):
    patient_id: str
    full_name: str
    age: int
    gender: str
    blood_group: str
    abha_id: Optional[str] = None
    abha_address: Optional[str] = None
    is_abha_linked: bool = False
    allergies: List[str] = Field(default_factory=list)
    chronic_conditions: List[str] = Field(default_factory=list)
    active_medications_count: int = 0
    total_records_count: int = 0
    vital_trends: Dict[str, List[VitalMetricPoint]] = Field(default_factory=dict)

class ABHALinkRequest(BaseModel):
    abha_id_or_number: str
    auth_method: str = "MOBILE_OTP"  # MOBILE_OTP, AADHAAR_OTP, DEMOGRAPHIC

class ABHAVerifyOTPRequest(BaseModel):
    txn_id: str
    otp: str

class ABHACardResponse(BaseModel):
    abha_number: str  # 14-digit format: 91-1234-5678-9012
    abha_address: str # username@abdm
    full_name: str
    gender: str
    dob: str
    mobile: str
    qr_data: str
    verification_status: str = "VERIFIED"
    abdm_facility: str = "National Health Authority (NHA) Sandbox"
    issued_at: str

class ChatQueryRequest(BaseModel):
    message: str
    language: str = "en"
    record_id: Optional[str] = None

class ChatQueryResponse(BaseModel):
    reply: str
    referenced_records: List[str] = Field(default_factory=list)
    clarification_prompt: Optional[str] = None
    safety_disclaimer: str
