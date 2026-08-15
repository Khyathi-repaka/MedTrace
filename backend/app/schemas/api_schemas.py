"""Request/response models for the API layer (kept separate from DB entities
so the wire format can evolve independently of storage)."""
from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PatientProfileOut(BaseModel):
    id: UUID
    name: str
    date_of_birth: Optional[date]
    age: Optional[int]
    gender: Optional[str]
    phone: Optional[str]
    blood_group: Optional[str]
    allergies: Optional[str]


class DocumentOut(BaseModel):
    id: UUID
    name: str
    document_type: str
    medical_date: Optional[date]
    upload_date: datetime
    hospital: Optional[str]
    doctor: Optional[str]
    processing_status: str


class DocumentUploadMeta(BaseModel):
    document_type: str = "report"
    medical_date: Optional[date] = None
    hospital: Optional[str] = None
    doctor: Optional[str] = None


class TimelineEventOut(BaseModel):
    id: UUID
    event_type: str
    event_date: date
    title: str
    description: Optional[str]


class ConditionOut(BaseModel):
    id: UUID
    name: str
    status: str
    first_diagnosed: Optional[date]
    severity: Optional[str]
    document_count: int = 0
    latest_lab_result: Optional[str] = None


class TreatmentOut(BaseModel):
    id: UUID
    treatment_name: str
    medication: Optional[str]
    dosage: Optional[str]
    frequency: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    doctor: Optional[str]
    status: str
    notes: Optional[str]


class LabResultOut(BaseModel):
    id: UUID
    test_name: str
    result: str
    unit: Optional[str]
    reference_range: Optional[str]
    test_date: Optional[date]


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResultOut(BaseModel):
    chunk_text: str
    document_id: Optional[str]
    document_name: Optional[str]
    document_type: Optional[str]
    medical_date: Optional[str]


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    session_id: UUID
    disclaimer: str = (
        "MedTrace AI helps organize and understand medical records. "
        "It does not provide medical diagnosis or replace professional medical advice."
    )
