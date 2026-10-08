from fastapi import APIRouter
from typing import Dict, Any, List

from ..models.health_record import PatientProfile, HealthRecord
from ..services.timeline_service import TimelineService
from ..sample_data import SAMPLE_PATIENT
from .records import RECORDS_STORE

router = APIRouter(prefix="/api/timeline", tags=["Timeline & Profile"])

@router.get("/profile", response_model=PatientProfile)
def get_patient_profile():
    """
    Get unified patient profile with chronic conditions, allergies, and ABHA status.
    """
    patient = SAMPLE_PATIENT.model_copy()
    patient.total_records_count = len(RECORDS_STORE)
    
    # Calculate active medications count
    active_meds = TimelineService.extract_active_medications(RECORDS_STORE)
    patient.active_medications_count = len(active_meds)
    
    # Calculate vital trends
    patient.vital_trends = TimelineService.extract_vital_trends(RECORDS_STORE)
    return patient

@router.get("/vitals")
def get_vital_trends() -> Dict[str, Any]:
    """
    Get time-series vital metric trajectories for interactive charts.
    """
    return TimelineService.extract_vital_trends(RECORDS_STORE)

@router.get("/medications")
def get_active_medications() -> List[Dict[str, Any]]:
    """
    Get current consolidated active medication regimen and safety checks.
    """
    return TimelineService.extract_active_medications(RECORDS_STORE)
