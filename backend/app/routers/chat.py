import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel, Field

from ..services.grounded_rag_engine import GroundedRAGEngine
from ..services.ocr_engine import OCREngineService
from ..services.ai_copilot import AICopilotService
from ..models.health_record import HealthRecord, RecordType
from .records import RECORDS_STORE
from ..sample_data import SAMPLE_PATIENT

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

# Data Models
class ChatCitation(BaseModel):
    document_id: str
    title: str
    date: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: f"msg-{uuid.uuid4().hex[:8]}")
    role: str # "user" or "assistant"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    citations: Optional[List[Dict[str, Any]]] = None
    structured_card: Optional[Dict[str, Any]] = None
    ai_provider: Optional[str] = None

class ChatSession(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: List[ChatMessage] = []

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="User question or query")
    session_id: Optional[str] = None
    language: Optional[str] = "en"
    user_id: Optional[str] = "PENTABYTE-PATIENT-001"

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    citations: List[Dict[str, Any]] = []
    structured_card: Optional[Dict[str, Any]] = None
    disclaimer: str
    ai_provider: str
    timestamp: str

# In-memory session store
# Pre-populated with default welcome session
DEFAULT_SESSION_ID = "session-primary-001"
CHAT_SESSIONS: Dict[str, ChatSession] = {
    DEFAULT_SESSION_ID: ChatSession(
        id=DEFAULT_SESSION_ID,
        title="Health Consultation & Lab Review",
        created_at="2026-10-08T09:00:00Z",
        updated_at="2026-10-08T09:00:00Z",
        messages=[
            ChatMessage(
                id="msg-welcome",
                role="assistant",
                content=(
                    "Hi! I'm your HealthLens AI assistant. I can help you understand your medical records, "
                    "compare reports, track medication history, and prepare questions for your doctor."
                ),
                timestamp="2026-10-08T09:00:00Z",
                ai_provider="HealthLens Grounded Clinical Engine"
            )
        ]
    )
}

@router.get("/sessions", response_model=List[ChatSession])
def get_chat_sessions(user_id: str = Query("PENTABYTE-PATIENT-001")):
    """
    Retrieve all conversation sessions for the authenticated user.
    """
    sessions = list(CHAT_SESSIONS.values())
    return sorted(sessions, key=lambda s: s.updated_at, reverse=True)

@router.post("/sessions", response_model=ChatSession)
def create_chat_session(title: Optional[str] = None, user_id: str = "PENTABYTE-PATIENT-001"):
    """
    Create a new chat conversation session.
    """
    new_id = f"session-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    session = ChatSession(
        id=new_id,
        title=title or f"Consultation {datetime.utcnow().strftime('%b %d, %H:%M')}",
        created_at=now,
        updated_at=now,
        messages=[
            ChatMessage(
                id=f"msg-{uuid.uuid4().hex[:8]}",
                role="assistant",
                content=(
                    "Hi! I'm your HealthLens AI assistant. I can help you understand your medical records, "
                    "compare reports, and prepare questions for your doctor."
                ),
                timestamp=now,
                ai_provider="HealthLens Grounded Clinical Engine"
            )
        ]
    )
    CHAT_SESSIONS[new_id] = session
    return session

@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: str):
    """
    Delete a specific conversation session.
    """
    if session_id in CHAT_SESSIONS:
        del CHAT_SESSIONS[session_id]
        return {"status": "success", "message": f"Session {session_id} deleted"}
    raise HTTPException(status_code=404, detail="Chat session not found")

@router.delete("/sessions")
def clear_all_chat_sessions():
    """
    Clear all conversation history and re-initialize with a clean welcome session.
    """
    CHAT_SESSIONS.clear()
    now = datetime.utcnow().isoformat()
    clean_session = ChatSession(
        id=f"session-{uuid.uuid4().hex[:8]}",
        title="New Consultation",
        created_at=now,
        updated_at=now,
        messages=[
            ChatMessage(
                id=f"msg-{uuid.uuid4().hex[:8]}",
                role="assistant",
                content="Hi! I'm your HealthLens AI assistant. I can help you understand your medical records, compare reports, and prepare questions for your doctor.",
                timestamp=now,
                ai_provider="HealthLens Grounded Clinical Engine"
            )
        ]
    )
    CHAT_SESSIONS[clean_session.id] = clean_session
    return {"status": "success", "message": "All conversations cleared", "session": clean_session}

@router.post("", response_model=ChatResponse)
def handle_chat_query(payload: ChatRequest):
    """
    Main Grounded AI Health Chatbot Endpoint (POST /api/chat).
    
    1. Authenticates & validates request payload.
    2. Retrieves permitted patient health records.
    3. Runs Grounded RAG reasoning (with Gemini if GEMINI_API_KEY is configured,
       or grounded clinical fallback).
    4. Records messages in session history.
    5. Returns grounded answer, structured cards, and citations.
    """
    msg_clean = payload.message.strip()
    if not msg_clean:
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")

    # Authorization verification: Ensure user is querying within permitted tenant
    if payload.user_id and payload.user_id != SAMPLE_PATIENT.patient_id:
        raise HTTPException(status_code=403, detail="Unauthorized access: Patient record access denied.")

    # Locate or generate session
    session_id = payload.session_id
    if not session_id or session_id not in CHAT_SESSIONS:
        session_id = f"session-{uuid.uuid4().hex[:8]}"
        now_ts = datetime.utcnow().isoformat()
        first_title = msg_clean[:32] + ("..." if len(msg_clean) > 32 else "")
        session = ChatSession(
            id=session_id,
            title=first_title,
            created_at=now_ts,
            updated_at=now_ts,
            messages=[]
        )
        CHAT_SESSIONS[session_id] = session
    else:
        session = CHAT_SESSIONS[session_id]

    now_str = datetime.utcnow().isoformat()

    # Append user message
    user_msg = ChatMessage(
        role="user",
        content=msg_clean,
        timestamp=now_str
    )
    session.messages.append(user_msg)

    # Execute Grounded RAG Engine with authorized records
    try:
        rag_result = GroundedRAGEngine.query(
            message=msg_clean,
            records=RECORDS_STORE,
            patient_profile=SAMPLE_PATIENT,
            language=payload.language or "en",
            user_id=payload.user_id or SAMPLE_PATIENT.patient_id
        )
    except Exception as e:
        rag_result = {
            "reply": "I encountered an error analyzing your medical records. Please retry or contact support.",
            "citations": [],
            "structured_card": None,
            "ai_provider": "HealthLens Engine (Safety Fallback)",
            "disclaimer": "Informational health assistant. Not a medical diagnosis. Consult a doctor for clinical concerns."
        }

    # Append assistant response to session
    assistant_msg = ChatMessage(
        role="assistant",
        content=rag_result.get("reply", ""),
        timestamp=now_str,
        citations=rag_result.get("citations", []),
        structured_card=rag_result.get("structured_card"),
        ai_provider=rag_result.get("ai_provider", "HealthLens AI")
    )
    session.messages.append(assistant_msg)
    session.updated_at = now_str

    # Update session title if default
    if session.title.startswith("Consultation") or session.title == "New Consultation":
        session.title = msg_clean[:30] + ("..." if len(msg_clean) > 30 else "")

    return ChatResponse(
        session_id=session.id,
        reply=rag_result.get("reply", ""),
        citations=rag_result.get("citations", []),
        structured_card=rag_result.get("structured_card"),
        disclaimer=rag_result.get("disclaimer", "Informational health assistant. Not a medical diagnosis."),
        ai_provider=rag_result.get("ai_provider", "HealthLens AI"),
        timestamp=now_str
    )

@router.post("/upload")
async def chat_upload_document(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    user_id: Optional[str] = Form("PENTABYTE-PATIENT-001"),
    language: Optional[str] = Form("en")
):
    """
    Upload a medical report (PDF, PNG, JPG, JPEG, TXT) directly inside the chat interface.
    Ingests through OCR pipeline, updates patient timeline, and answers the user with
    a structured summary card and immediate grounded analysis.
    """
    if user_id and user_id != SAMPLE_PATIENT.patient_id:
        raise HTTPException(status_code=403, detail="Unauthorized access: Patient record access denied.")

    content = await file.read()
    filename = file.filename or "uploaded_report.pdf"

    # Process through OCR Engine
    ocr_result = OCREngineService.process_uploaded_file(
        filename=filename,
        content=content,
        content_type=file.content_type or "application/octet-stream"
    )

    ocr_text = ocr_result["raw_text"]
    rec_type = ocr_result["record_type"]
    metadata = ocr_result["metadata"]
    extracted_labs = ocr_result["extracted_lab_values"]
    extracted_meds = ocr_result["extracted_medications"]
    extracted_diag = ocr_result["diagnoses"]

    title = f"{rec_type.value.replace('_', ' ').title()} - {metadata.get('facility', 'Uploaded Report')}"

    # Generate plain-language AI summary
    ai_summary = AICopilotService.generate_health_summary(
        title=title,
        record_type=rec_type.value,
        lab_values=extracted_labs,
        medications=extracted_meds,
        diagnoses=extracted_diag,
        raw_text=ocr_text
    )

    # Save to records store
    new_id = f"rec-{uuid.uuid4().hex[:6]}"
    new_record = HealthRecord(
        id=new_id,
        patient_id=SAMPLE_PATIENT.patient_id,
        title=title,
        record_type=rec_type,
        record_date=metadata.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
        doctor_name=metadata.get("doctor"),
        facility_name=metadata.get("facility"),
        raw_ocr_text=ocr_text,
        extracted_medications=extracted_meds,
        extracted_lab_values=extracted_labs,
        diagnoses=extracted_diag,
        ai_summary=ai_summary,
        language_code=language or "en"
    )

    RECORDS_STORE.insert(0, new_record)
    SAMPLE_PATIENT.total_records_count = len(RECORDS_STORE)

    # Locate or create session
    if not session_id or session_id not in CHAT_SESSIONS:
        session_id = f"session-{uuid.uuid4().hex[:8]}"
        now_ts = datetime.utcnow().isoformat()
        session = ChatSession(
            id=session_id,
            title=f"Uploaded: {filename[:24]}",
            created_at=now_ts,
            updated_at=now_ts,
            messages=[]
        )
        CHAT_SESSIONS[session_id] = session
    else:
        session = CHAT_SESSIONS[session_id]

    now_str = datetime.utcnow().isoformat()

    # User message representing upload
    session.messages.append(ChatMessage(
        role="user",
        content=f"📎 Uploaded document: {filename} ({len(content)} bytes)",
        timestamp=now_str
    ))

    # Structured explanation card
    abnormal_count = sum(1 for lab in extracted_labs if lab.status.value in ["HIGH", "LOW", "CRITICAL"])
    structured_card = {
        "type": "uploaded_report",
        "title": title,
        "date": new_record.record_date,
        "facility": new_record.facility_name or "Diagnostics Lab",
        "record_id": new_id,
        "extracted_labs_count": len(extracted_labs),
        "abnormal_count": abnormal_count,
        "extracted_meds_count": len(extracted_meds),
        "key_takeaway": ai_summary.simple_explanation
    }

    reply_text = (
        f"**Medical Report Successfully Ingested & Analyzed!**\n\n"
        f"• **Document:** `{filename}`\n"
        f"• **Category:** {rec_type.value.replace('_', ' ').title()}\n"
        f"• **Extracted Biomarkers:** {len(extracted_labs)} parameters ({abnormal_count} outside reference range)\n"
        f"• **Extracted Medications:** {len(extracted_meds)} items identified\n\n"
        f"**Plain-Language Explanation:**\n{ai_summary.simple_explanation}\n\n"
        f"This document is now indexed in your timeline under ID `[{new_id}]`. You can ask me to compare it with prior tests or explain any specific value!"
    )

    citations = [{
        "document_id": new_id,
        "title": title,
        "date": new_record.record_date
    }]

    # Assistant message
    assistant_msg = ChatMessage(
        role="assistant",
        content=reply_text,
        timestamp=now_str,
        citations=citations,
        structured_card=structured_card,
        ai_provider="HealthLens OCR & Grounded Engine"
    )
    session.messages.append(assistant_msg)
    session.updated_at = now_str

    return {
        "status": "success",
        "session_id": session_id,
        "record_id": new_id,
        "reply": reply_text,
        "citations": citations,
        "structured_card": structured_card,
        "disclaimer": "Informational health assistant. Not a medical diagnosis. Consult a doctor for clinical concerns.",
        "ai_provider": "HealthLens OCR & Grounded Engine",
        "timestamp": now_str
    }
