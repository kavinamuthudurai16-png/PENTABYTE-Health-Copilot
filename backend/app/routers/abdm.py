from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime

from ..models.health_record import (
    ABHALinkRequest,
    ABHAVerifyOTPRequest,
    ABHACardResponse,
)
from ..services.abdm_fhir_service import ABDMFHIRService
from ..sample_data import SAMPLE_PATIENT, SAMPLE_RECORDS
from .records import RECORDS_STORE

router = APIRouter(prefix="/api/abdm", tags=["ABDM & ABHA Integration"])

# In-memory ABDM state
ABDM_STATE = {
    "linked": SAMPLE_PATIENT.is_abha_linked,
    "current_card": ABDMFHIRService.verify_and_create_abha_card(
        txn_id="TXN-INIT",
        otp="123456",
        patient_name=SAMPLE_PATIENT.full_name,
        custom_address=SAMPLE_PATIENT.abha_address or "kavina.m@abdm"
    )
}

@router.post("/initiate")
def initiate_abha_linking(payload: ABHALinkRequest) -> Dict[str, str]:
    """
    Step 1: Initiate ABDM ABHA ID linking via Mock Mobile / Aadhaar OTP.
    """
    return ABDMFHIRService.initiate_abha_linking(payload.abha_id_or_number)

@router.post("/verify", response_model=ABHACardResponse)
def verify_and_link_abha(payload: ABHAVerifyOTPRequest):
    """
    Step 2: Verify OTP and mint official mock ABHA Health Card.
    """
    # Demo accept OTP
    if payload.otp != "123456" and len(payload.otp) != 6:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter demo OTP '123456'.")

    card = ABDMFHIRService.verify_and_create_abha_card(
        txn_id=payload.txn_id,
        otp=payload.otp,
        patient_name=SAMPLE_PATIENT.full_name,
        custom_address=SAMPLE_PATIENT.abha_address or "kavina.m@abdm"
    )

    ABDM_STATE["linked"] = True
    ABDM_STATE["current_card"] = card
    SAMPLE_PATIENT.is_abha_linked = True
    SAMPLE_PATIENT.abha_id = card.abha_number
    SAMPLE_PATIENT.abha_address = card.abha_address

    return card

@router.get("/card", response_model=ABHACardResponse)
def get_abha_card():
    """
    Retrieve active linked ABHA Health Card details and QR data.
    """
    if not ABDM_STATE["current_card"]:
        raise HTTPException(status_code=404, detail="No ABHA account linked yet")
    return ABDM_STATE["current_card"]

@router.get("/fhir-export")
def export_all_records_fhir():
    """
    Export all unified health records as an aggregated ABDM FHIR R4 Bundle.
    """
    if not RECORDS_STORE:
        raise HTTPException(status_code=404, detail="No clinical records available for export")
    
    # Bundle the latest record with references to all
    primary_record = RECORDS_STORE[0]
    bundle = ABDMFHIRService.export_to_fhir_bundle(SAMPLE_PATIENT, primary_record)
    return bundle

@router.post("/consent-request")
def create_mock_consent_request(requester: str = "Dr. Radhakrishnan (Apollo Hospital)") -> Dict[str, Any]:
    """
    Simulate ABDM Consent Manager artifact creation for Health Information Provider (HIP) exchange.
    """
    return {
        "consent_id": f"ABDM-CONSENT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "status": "GRANTED",
        "requester": requester,
        "purpose": "Care Management & Clinical Review",
        "hi_types": ["DiagnosticReport", "Prescription", "OPConsultation"],
        "data_erase_at": "2026-11-08T00:00:00Z",
        "created_at": datetime.utcnow().isoformat()
    }
