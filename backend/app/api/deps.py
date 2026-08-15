"""
Auth dependencies. get_current_patient_id is the ONLY source of truth for
"who is asking" — every patient-scoped endpoint depends on this rather than
accepting a patient_id from the request body/query string.
"""
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.entities import PatientProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> UUID:
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    return UUID(user_id)


def get_current_patient(
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> PatientProfile:
    patient = session.exec(
        select(PatientProfile).where(PatientProfile.user_id == user_id)
    ).first()
    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient profile not found")
    return patient
