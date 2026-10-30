import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Appointment as AppointmentModel
from app.schemas import (
    AppointmentCreateRequest,
    AppointmentResponse,
)
from app.data_loader import data_loader
from app.services.advisory_service import AdvisoryService

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def find_advisor_name(advisor_id: str) -> str:
    adv = data_loader.advisors.get(advisor_id)
    if adv:
        return adv.get("advisor_name", "Certified LifeWise Advisor")
    return "Certified Advisor"


@router.post("/book", response_model=AppointmentResponse)
def book_appointment(
    payload: AppointmentCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Book a digital advisory consultation appointment with a certified financial planner.
    Enforces slot availability, prevents duplicate bookings, and stores record.
    """
    # 1. Check if advisor exists
    adv = data_loader.advisors.get(payload.advisor_id)
    if not adv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Advisor '{payload.advisor_id}' not found in certified advisor directory."
        )

    # 2. Check for duplicate booking of the same slot by another client
    existing = db.query(AppointmentModel).filter(
        AppointmentModel.advisor_id == payload.advisor_id,
        AppointmentModel.slot_time == payload.slot_time,
        AppointmentModel.client_email != payload.client_email,
        AppointmentModel.status == "confirmed"
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This consultation slot has already been booked. Please select another available time slot."
        )

    # 3. Mark slot booked in memory cache
    AdvisoryService.mark_slot_booked(payload.slot_time)

    # 4. Generate unique human-readable LifeWise appointment code
    short_uuid = str(uuid.uuid4()).upper()[:6]
    appointment_code = f"LW-APT-{short_uuid}"

    appointment = AppointmentModel(
        appointment_code=appointment_code,
        client_name=payload.client_name,
        client_email=payload.client_email,
        client_phone=payload.client_phone,
        advisor_id=payload.advisor_id,
        topic=payload.topic,
        slot_time=payload.slot_time,
        consultation_mode=payload.consultation_mode,
        status="confirmed",
        notes=payload.notes or "",
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    advisor_name = find_advisor_name(payload.advisor_id)

    return AppointmentResponse(
        id=appointment.id,
        appointment_code=appointment.appointment_code,
        advisor_id=appointment.advisor_id,
        advisor_name=advisor_name,
        client_name=appointment.client_name,
        client_email=appointment.client_email,
        client_phone=appointment.client_phone,
        topic=appointment.topic,
        slot_time=appointment.slot_time,
        consultation_mode=appointment.consultation_mode,
        status=appointment.status,
        notes=appointment.notes,
        created_at=appointment.created_at,
    )


@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    client_email: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    List appointments, optionally filtered by client email for customer dashboard.
    """
    query = db.query(AppointmentModel)
    if client_email:
        query = query.filter(AppointmentModel.client_email.ilike(f"%{client_email.strip()}%"))
    
    appointments = query.order_by(AppointmentModel.created_at.desc()).limit(limit).all()
    results = []
    for apt in appointments:
        results.append(
            AppointmentResponse(
                id=apt.id,
                appointment_code=apt.appointment_code,
                advisor_id=apt.advisor_id,
                advisor_name=find_advisor_name(apt.advisor_id),
                client_name=apt.client_name,
                client_email=apt.client_email,
                client_phone=apt.client_phone,
                topic=apt.topic,
                slot_time=apt.slot_time,
                consultation_mode=apt.consultation_mode,
                status=apt.status,
                notes=apt.notes,
                created_at=apt.created_at,
            )
        )
    return results


@router.get("/{code_or_id}", response_model=AppointmentResponse)
def get_appointment(code_or_id: str, db: Session = Depends(get_db)):
    """
    Retrieve specific consultation appointment by code or ID.
    """
    if code_or_id.isdigit():
        apt = db.query(AppointmentModel).filter(AppointmentModel.id == int(code_or_id)).first()
    else:
        apt = db.query(AppointmentModel).filter(AppointmentModel.appointment_code == code_or_id.upper()).first()

    if not apt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment '{code_or_id}' not found."
        )

    return AppointmentResponse(
        id=apt.id,
        appointment_code=apt.appointment_code,
        advisor_id=apt.advisor_id,
        advisor_name=find_advisor_name(apt.advisor_id),
        client_name=apt.client_name,
        client_email=apt.client_email,
        client_phone=apt.client_phone,
        topic=apt.topic,
        slot_time=apt.slot_time,
        consultation_mode=apt.consultation_mode,
        status=apt.status,
        notes=apt.notes,
        created_at=apt.created_at,
    )


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    new_status: str,
    db: Session = Depends(get_db)
):
    """
    Update appointment status (confirmed, completed, cancelled).
    """
    apt = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if new_status.lower() not in ["confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be confirmed, completed, or cancelled.")

    apt.status = new_status.lower()
    db.commit()
    db.refresh(apt)

    return AppointmentResponse(
        id=apt.id,
        appointment_code=apt.appointment_code,
        advisor_id=apt.advisor_id,
        advisor_name=find_advisor_name(apt.advisor_id),
        client_name=apt.client_name,
        client_email=apt.client_email,
        client_phone=apt.client_phone,
        topic=apt.topic,
        slot_time=apt.slot_time,
        consultation_mode=apt.consultation_mode,
        status=apt.status,
        notes=apt.notes,
        created_at=apt.created_at,
    )
