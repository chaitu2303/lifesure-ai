import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserAccount
from app.services.auth_service import verify_password, hash_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    user_id: str
    password: str

class LoginResponse(BaseModel):
    user_id: str
    full_name: str
    role: str
    must_change_password: bool
    email: Optional[str] = None
    token: str

class PasswordChangeRequest(BaseModel):
    user_id: str
    old_password: str
    new_password: str

class RegisterRequest(BaseModel):
    user_id: str
    password: str
    full_name: str
    email: Optional[str] = None
    linked_profile_id: Optional[str] = None

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an administrator (ADMIN001) or registered customer.
    Checks hashed credentials with constant-time comparison.
    """
    account = db.query(UserAccount).filter_by(user_id=payload.user_id.strip()).first()
    if not account or not account.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or inactive account."
        )

    if not verify_password(payload.password, account.password_hash, account.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )

    account.last_login_at = datetime.datetime.utcnow()
    db.commit()

    # Generate session token
    token = f"lw-{account.role}-{account.user_id}-{int(datetime.datetime.utcnow().timestamp())}"

    return LoginResponse(
        user_id=account.user_id,
        full_name=account.full_name,
        role=account.role,
        must_change_password=account.must_change_password,
        email=account.email,
        token=token,
    )

@router.post("/change-password")
def change_password(payload: PasswordChangeRequest, db: Session = Depends(get_db)):
    """
    Change account password (e.g. required for initial admin on first login).
    """
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    account = db.query(UserAccount).filter_by(user_id=payload.user_id.strip()).first()
    if not account or not account.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    if not verify_password(payload.old_password, account.password_hash, account.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect old password."
        )

    new_hash, new_salt = hash_password(payload.new_password)
    account.password_hash = new_hash
    account.salt = new_salt
    account.must_change_password = False
    db.commit()

    return {"status": "success", "message": "Password changed successfully."}

@router.post("/register")
def register_customer(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a genuine customer account.
    """
    existing = db.query(UserAccount).filter_by(user_id=payload.user_id.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User ID '{payload.user_id}' already registered."
        )

    pw_hash, salt = hash_password(payload.password)
    new_user = UserAccount(
        user_id=payload.user_id.strip(),
        role="customer",
        password_hash=pw_hash,
        salt=salt,
        full_name=payload.full_name,
        email=payload.email,
        linked_profile_id=payload.linked_profile_id,
        must_change_password=False,
        is_active=True,
    )
    db.add(new_user)
    db.commit()

    return {"status": "success", "message": "Customer account registered successfully."}

