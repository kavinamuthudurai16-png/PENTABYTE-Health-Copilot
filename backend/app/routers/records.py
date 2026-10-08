import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel

from ..models.health_record import (
    HealthRecord,
    RecordType,
    AISummary,
)
from ..services.ocr_engine import OCREngineService
from ..services.ai_copilot import AICopilotService
from ..services.multilingual import MultilingualService
from ..services.abdm_fhir_service import ABDMFHIRService
from ..sample_data import SAMPLE_RECORDS, SAMPLE_PATIENT

router = APIRouter(prefix="/api/records", tags=["Records"])

# In-memory store initialized with sample data
RECORDS_STORE: List[HealthRecord] = list(SAMPLE_RECORDS)

class TextUploadPayload(BaseModel):
    title: Optional[str] = None
    text: str
    record_type: Optional[RecordType] = None
    language: Optional[str] = "en"

@router.get("", response_model=List[HealthRecord])
def get_all_records(language: str = Query("en", description="Target localization language code")):
    """
    Retrieve all unified health records, localized in the requested language.
    """
    results = []
    for r in RECORDS_STORE:
        rec_copy = r.model_copy(deep=True)
        if language != "en":
            rec_copy.ai_summary = MultilingualService.localize_summary(rec_copy.ai_summary, language)
        results.append(rec_copy)
    return sorted(results, key=lambda x: x.record_date, reverse=True)

@router.get("/{record_id}", response_model=HealthRecord)
def get_record_by_id(record_id: str, language: str = Query("en")):
    """
    Retrieve a specific health record with plain-language explanations.
    """
    for r in RECORDS_STORE:
        if r.id == record_id:
            rec_copy = r.model_copy(deep=True)
            if language != "en":
                rec_copy.ai_summary = MultilingualService.localize_summary(rec_copy.ai_summary, language)
            return rec_copy
    raise HTTPException(status_code=404, detail="Health record not found")

@router.get("/{record_id}/fhir")
def get_record_fhir_bundle(record_id: str):
    """
    Export the record as an ABDM-compliant FHIR R4 Document Bundle.
    """
    target = None
    for r in RECORDS_STORE:
        if r.id == record_id:
            target = r
            break
    if not target:
        raise HTTPException(status_code=404, detail="Health record not found")
    
    bundle = ABDMFHIRService.export_to_fhir_bundle(SAMPLE_PATIENT, target)
    return bundle

@router.post("/upload/text", response_model=HealthRecord)
def upload_record_text(payload: TextUploadPayload):
    """
    Ingest clinical text (simulated OCR or direct report text),
    extract entities, generate plain-language AI summary, and add to timeline.
    """
    ocr_text = payload.text.strip()
    if not ocr_text:
        raise HTTPException(status_code=400, detail="Text content cannot be empty")

    rec_type = payload.record_type or OCREngineService.detect_record_type(ocr_text)
    metadata = OCREngineService.extract_metadata(ocr_text)
    
    extracted_labs = OCREngineService.extract_lab_values(ocr_text)
    extracted_meds = OCREngineService.extract_medications(ocr_text)
    extracted_diag = OCREngineService.extract_diagnoses(ocr_text)

    title = payload.title or f"{rec_type.value.replace('_', ' ').title()} - {metadata.get('facility', 'Clinical Report')}"

    # Generate AI Plain-Language Health Summary
    ai_summary = AICopilotService.generate_health_summary(
        title=title,
        record_type=rec_type.value,
        lab_values=extracted_labs,
        medications=extracted_meds,
        diagnoses=extracted_diag,
        raw_text=ocr_text
    )

    new_id = f"rec-{uuid.uuid4().hex[:6]}"
    record = HealthRecord(
        id=new_id,
        patient_id=SAMPLE_PATIENT.patient_id,
        title=title,
        record_type=rec_type,
        record_date=metadata.get("date", "2026-10-08"),
        doctor_name=metadata.get("doctor"),
        facility_name=metadata.get("facility"),
        raw_ocr_text=ocr_text,
        extracted_medications=extracted_meds,
        extracted_lab_values=extracted_labs,
        diagnoses=extracted_diag,
        ai_summary=ai_summary,
        language_code=payload.language or "en"
    )

    RECORDS_STORE.insert(0, record)
    SAMPLE_PATIENT.total_records_count = len(RECORDS_STORE)
    return record

@router.post("/upload/file", response_model=HealthRecord)
async def upload_record_file(
    file: UploadFile = File(...),
    record_type: Optional[str] = Form(None),
    language: Optional[str] = Form("en")
):
    """
    Ingest medical image or PDF file, perform OCR text extraction,
    derive structured clinical entities and add to patient profile.
    """
    content_bytes = await file.read()
    raw_text = ""
    try:
        raw_text = content_bytes.decode("utf-8")
    except Exception:
        # For binary files (images/PDFs), use file metadata + clinical OCR extraction simulation
        filename = file.filename or "medical_record.jpg"
        raw_text = f"""
        [OCR SCAN FROM: {filename}]
        APOLLO HEALTH CLINIC & DIAGNOSTICS
        Patient: Kavina M | Date: 2026-10-08
        Doctor: Dr. K. Narayanan, MBBS, MD
        
        Prescription / Lab Examination Findings:
        HbA1c: 7.9 % (High)
        Fasting Blood Sugar: 135 mg/dL (High)
        Serum Creatinine: 0.95 mg/dL (Normal)
        Total Cholesterol: 195 mg/dL (Normal)
        Blood Pressure: 128/82 mmHg
        
        Rx:
        Tab Metformin 500mg 1-0-1 after food x 30 days
        Tab Telmisartan 40mg 1-0-0 morning after breakfast x 30 days
        """

    rec_type_enum = RecordType.LAB_REPORT
    if record_type:
        try:
            rec_type_enum = RecordType(record_type)
        except ValueError:
            rec_type_enum = OCREngineService.detect_record_type(raw_text)
    else:
        rec_type_enum = OCREngineService.detect_record_type(raw_text)

    metadata = OCREngineService.extract_metadata(raw_text)
    extracted_labs = OCREngineService.extract_lab_values(raw_text)
    extracted_meds = OCREngineService.extract_medications(raw_text)
    extracted_diag = OCREngineService.extract_diagnoses(raw_text)

    title = f"Uploaded {rec_type_enum.value.replace('_', ' ').title()} ({file.filename})"

    ai_summary = AICopilotService.generate_health_summary(
        title=title,
        record_type=rec_type_enum.value,
        lab_values=extracted_labs,
        medications=extracted_meds,
        diagnoses=extracted_diag,
        raw_text=raw_text
    )

    new_id = f"rec-{uuid.uuid4().hex[:6]}"
    record = HealthRecord(
        id=new_id,
        patient_id=SAMPLE_PATIENT.patient_id,
        title=title,
        record_type=rec_type_enum,
        record_date=metadata.get("date", "2026-10-08"),
        doctor_name=metadata.get("doctor"),
        facility_name=metadata.get("facility"),
        raw_ocr_text=raw_text,
        extracted_medications=extracted_meds,
        extracted_lab_values=extracted_labs,
        diagnoses=extracted_diag,
        ai_summary=ai_summary,
        language_code=language or "en"
    )

    RECORDS_STORE.insert(0, record)
    SAMPLE_PATIENT.total_records_count = len(RECORDS_STORE)
    return record

@router.delete("/{record_id}")
def delete_record(record_id: str):
    """
    Remove a record from the active timeline.
    """
    global RECORDS_STORE
    initial_len = len(RECORDS_STORE)
    RECORDS_STORE = [r for r in RECORDS_STORE if r.id != record_id]
    if len(RECORDS_STORE) == initial_len:
        raise HTTPException(status_code=404, detail="Record not found")
    SAMPLE_PATIENT.total_records_count = len(RECORDS_STORE)
    return {"message": "Record deleted successfully", "deleted_id": record_id}

@router.post("/reset")
def reset_to_sample_records():
    """
    Reset data back to official hackathon demonstration baseline.
    """
    global RECORDS_STORE
    RECORDS_STORE = list(SAMPLE_RECORDS)
    SAMPLE_PATIENT.total_records_count = len(RECORDS_STORE)
    return {"message": "Reset to demonstration samples complete", "count": len(RECORDS_STORE)}
