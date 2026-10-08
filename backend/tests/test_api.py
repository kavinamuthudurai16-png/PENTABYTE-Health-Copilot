import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.ocr_engine import OCREngineService
from backend.app.services.ai_copilot import AICopilotService
from backend.app.services.abdm_fhir_service import ABDMFHIRService
from backend.app.sample_data import SAMPLE_PATIENT

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["team"] == "PENTABYTE"
    assert data["abdm_compliant"] is True
    assert data["fhir_version"] == "R4"

def test_get_all_records():
    response = client.get("/api/records")
    assert response.status_code == 200
    records = response.json()
    assert len(records) >= 3
    assert "extracted_lab_values" in records[0]
    assert "ai_summary" in records[0]

def test_multilingual_record_localization():
    response_hi = client.get("/api/records?language=hi")
    assert response_hi.status_code == 200
    records = response_hi.json()
    # Check that disclaimer or actions are localized
    summary = records[0]["ai_summary"]
    assert "चेतावनी" in summary["medical_disclaimer"] or len(summary["patient_action_items"]) > 0

def test_ocr_lab_extraction():
    sample_text = """
    HbA1c: 8.5 %
    Fasting Blood Sugar: 152 mg/dL
    Total Cholesterol: 210 mg/dL
    Serum Creatinine: 1.1 mg/dL
    BP: 135/85 mmHg
    """
    labs = OCREngineService.extract_lab_values(sample_text)
    assert len(labs) >= 5
    hba1c_lab = next((l for l in labs if "hba1c" in l.test_name.lower()), None)
    assert hba1c_lab is not None
    assert hba1c_lab.value == 8.5
    assert hba1c_lab.status.value in ["HIGH", "CRITICAL"]

def test_ocr_medication_extraction():
    rx_text = """
    Tab Metformin 500mg 1-0-1 after food x 30 days
    Tab Telmisartan 40mg 1-0-0 morning after breakfast x 30 days
    Tab Atorvastatin 20mg 0-0-1 night x 30 days
    """
    meds = OCREngineService.extract_medications(rx_text)
    assert len(meds) >= 3
    med_names = [m.name for m in meds]
    assert "Metformin" in med_names
    assert "Telmisartan" in med_names

def test_ai_copilot_plain_language_summary():
    labs = OCREngineService.extract_lab_values("HbA1c: 8.4 %")
    summary = AICopilotService.generate_health_summary(
        title="Lab Test",
        record_type="LAB_REPORT",
        lab_values=labs,
        medications=[],
        diagnoses=[]
    )
    assert len(summary.plain_language_overview) > 20
    assert len(summary.eli5_summary) > 20
    assert len(summary.abnormal_findings_explained) > 0
    assert "LEGAL & MEDICAL DISCLAIMER" in summary.medical_disclaimer

def test_fhir_r4_bundle_generation():
    response = client.get("/api/records")
    records = response.json()
    first_id = records[0]["id"]
    
    fhir_response = client.get(f"/api/records/{first_id}/fhir")
    assert fhir_response.status_code == 200
    bundle = fhir_response.json()
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "document"
    assert len(bundle["entry"]) >= 2
    # Verify patient resource inside bundle
    patient_entry = next((e for e in bundle["entry"] if e["resource"]["resourceType"] == "Patient"), None)
    assert patient_entry is not None

def test_abdm_abha_flow():
    # 1. Initiate linking
    initiate_resp = client.post("/api/abdm/initiate", json={"abha_id_or_number": "91-8472-1092-3841"})
    assert initiate_resp.status_code == 200
    txn_id = initiate_resp.json()["txn_id"]
    
    # 2. Verify with mock OTP
    verify_resp = client.post("/api/abdm/verify", json={"txn_id": txn_id, "otp": "123456"})
    assert verify_resp.status_code == 200
    card = verify_resp.json()
    assert card["verification_status"] == "VERIFIED"
    assert "91-" in card["abha_number"]

    # 3. Fetch active card
    card_resp = client.get("/api/abdm/card")
    assert card_resp.status_code == 200

def test_patient_profile_and_vitals():
    profile_resp = client.get("/api/timeline/profile")
    assert profile_resp.status_code == 200
    profile = profile_resp.json()
    assert profile["full_name"] == "Kavina M"
    assert len(profile["vital_trends"]) > 0

def test_copilot_chat():
    chat_resp = client.post("/api/copilot/chat", json={"message": "Can you explain my HbA1c reading?"})
    assert chat_resp.status_code == 200
    data = chat_resp.json()
    assert len(data["reply"]) > 20
    assert "HbA1c" in data["reply"]
    assert "disclaimer" in data["safety_disclaimer"].lower()
