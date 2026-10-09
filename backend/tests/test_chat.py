import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_chat_get_sessions():
    response = client.get("/api/chat/sessions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_chat_explain_latest():
    payload = {"message": "Explain my latest medical report in simple language."}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "HbA1c" in data["reply"]
    assert len(data["citations"]) > 0
    assert data["structured_card"] is not None
    assert data["disclaimer"]

def test_chat_compare_reports():
    payload = {"message": "What changed between my previous and latest reports?"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Comparison" in data["reply"]
    assert data["structured_card"]["type"] == "comparison"
    assert len(data["structured_card"]["items"]) >= 3

def test_chat_medicines():
    payload = {"message": "Find the medicines mentioned in my uploaded prescriptions."}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Metformin" in data["reply"]
    assert "Telmisartan" in data["reply"]

def test_chat_doctor_prep():
    payload = {"message": "Help me prepare for my next doctor appointment."}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["structured_card"]["type"] == "doctor_summary"
    assert len(data["structured_card"]["questions_to_ask"]) >= 2

def test_chat_tamil_localization():
    payload = {"message": "Explain my report in Tamil."}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "வணக்கம்" in data["reply"]
    assert data["structured_card"]["type"] == "tamil_summary"

def test_chat_profile_verification():
    payload = {"message": "Which information in my profile still needs verification?"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "verification" in data["reply"].lower()
    assert data["structured_card"]["type"] == "verification_status"

def test_chat_guardrail_unmatched_record():
    payload = {"message": "Show me my brain MRI scan from last year."}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "couldn't find this information in your uploaded records" in data["reply"]

def test_chat_authorization_security():
    payload = {"message": "Hello", "user_id": "UNAUTHORIZED_ATTACKER_ID"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 403

def test_chat_session_lifecycle():
    # Create session
    create_res = client.post("/api/chat/sessions", params={"title": "Test Pytest Session"})
    assert create_res.status_code == 200
    session_id = create_res.json()["id"]

    # Send message in this session
    msg_res = client.post("/api/chat", json={"session_id": session_id, "message": "Summarize my health records."})
    assert msg_res.status_code == 200

    # Delete session
    del_res = client.delete(f"/api/chat/sessions/{session_id}")
    assert del_res.status_code == 200
