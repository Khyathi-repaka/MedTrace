from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.core.security import hash_password, verify_password, create_access_token
from app.models.entities import User, PatientProfile
from app.schemas.api_schemas import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(email=payload.email, password_hash=hash_password(payload.password))
    session.add(user)
    session.flush()  # get user.id before creating profile

    age = None
    if payload.date_of_birth:
        from datetime import date
        today = date.today()
        age = today.year - payload.date_of_birth.year - (
            (today.month, today.day) < (payload.date_of_birth.month, payload.date_of_birth.day)
        )

    profile = PatientProfile(
        user_id=user.id, name=payload.name, date_of_birth=payload.date_of_birth, age=age,
        gender=payload.gender, phone=payload.phone, blood_group=payload.blood_group,
        allergies=payload.allergies,
    )
    session.add(profile)
    session.commit()

    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    return TokenResponse(access_token=create_access_token(str(user.id)))
