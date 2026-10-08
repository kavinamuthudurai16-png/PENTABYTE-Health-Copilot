from fastapi import APIRouter
from typing import List, Dict, Any

from ..models.health_record import (
    ChatQueryRequest,
    ChatQueryResponse,
)
from ..services.ai_copilot import AICopilotService
from ..services.multilingual import MultilingualService
from .records import RECORDS_STORE

router = APIRouter(prefix="/api/copilot", tags=["AI Copilot"])

@router.post("/chat", response_model=ChatQueryResponse)
def copilot_chat(request: ChatQueryRequest):
    """
    Conversational AI Health Copilot query endpoint.
    Answers patient questions regarding lab results, medications, and health journey.
    """
    reply_text = AICopilotService.answer_patient_query(
        query=request.message,
        records=RECORDS_STORE,
        language=request.language
    )

    # Referenced records
    ref_ids = [r.id for r in RECORDS_STORE[:2]]

    return ChatQueryResponse(
        reply=reply_text,
        referenced_records=ref_ids,
        clarification_prompt="Ask any question about your blood tests, medication timings, or lifestyle advice.",
        safety_disclaimer=(
            "Medical Disclaimer: AI Copilot is an educational tool. Never substitute this advice for professional medical diagnosis. "
            "In case of emergency, contact 108 or your local hospital emergency room."
        )
    )

@router.get("/languages")
def get_supported_languages() -> List[Dict[str, str]]:
    """
    Get supported regional and global languages.
    """
    return MultilingualService.get_supported_languages()
