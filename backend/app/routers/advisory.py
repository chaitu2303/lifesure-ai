from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    AdvisorItem,
    AvailableSlot,
)
from app.services.advisory_service import AdvisoryService

router = APIRouter(prefix="", tags=["Advisory & Education"])

@router.post("/chat", response_model=ChatMessageResponse)
def handle_chat_message(req: ChatMessageRequest):
    """
    Educational AI Advisory Chatbot.
    Answers user questions on insurance categories, calculation logic, riders, and inflation.
    Strictly educational: does not fabricate rates, terms, or insurer guarantees.
    """
    response = AdvisoryService.answer_chat_query(req.message)
    return response

@router.get("/advisors", response_model=List[AdvisorItem])
def get_advisors():
    """
    List certified financial planners and protection advisors available for consultation.
    """
    return AdvisoryService.get_advisors()

@router.get("/advisors/{advisor_id}/slots", response_model=List[AvailableSlot])
def get_advisor_slots(advisor_id: str):
    """
    Retrieve real-time available consultation appointment slots for a specific advisor.
    """
    slots = AdvisoryService.get_available_slots(advisor_id)
    return slots
