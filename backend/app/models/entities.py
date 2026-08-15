"""
SQLModel entities = ORM model + Pydantic schema in one. Every patient-owned
table carries patient_id as a foreign key; the API layer NEVER trusts a
patient_id supplied by the client (see app/api/deps.py) — it is always
derived from the authenticated JWT subject -> patient profile.
"""
from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, JSON, Column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class PatientProfile(SQLModel, table=True):
    __tablename__ = "patient_profiles"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", unique=True, index=True)
    name: str
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class Document(SQLModel, table=True):
    __tablename__ = "documents"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    name: str
    document_type: str  # report | prescription | consultation | discharge_summary | scan
    medical_date: Optional[date] = None
    upload_date: datetime = Field(default_factory=utcnow)
    hospital: Optional[str] = None
    doctor: Optional[str] = None
    file_path: str
    processing_status: str = Field(default="UPLOADED")  # UPLOADED|PROCESSING|PROCESSED|FAILED
    raw_text: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class Condition(SQLModel, table=True):
    __tablename__ = "conditions"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    name: str
    status: str = Field(default="active")  # active|resolved|monitoring
    first_diagnosed: Optional[date] = None
    severity: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class Symptom(SQLModel, table=True):
    __tablename__ = "symptoms"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    document_id: UUID = Field(foreign_key="documents.id", index=True)
    name: str
    duration: Optional[str] = None


class LabResult(SQLModel, table=True):
    __tablename__ = "lab_results"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    document_id: UUID = Field(foreign_key="documents.id", index=True)
    test_name: str
    result: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    test_date: Optional[date] = None


class Medication(SQLModel, table=True):
    __tablename__ = "medications"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    document_id: UUID = Field(foreign_key="documents.id", index=True)
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = Field(default="active")


class Treatment(SQLModel, table=True):
    __tablename__ = "treatments"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    document_id: UUID = Field(foreign_key="documents.id", index=True)
    treatment_name: str
    medication: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    doctor: Optional[str] = None
    status: str = Field(default="active")
    notes: Optional[str] = None


class TimelineEvent(SQLModel, table=True):
    __tablename__ = "timeline_events"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    document_id: UUID = Field(foreign_key="documents.id", index=True)
    event_type: str  # diagnosis | lab_result | medication | treatment | finding
    event_date: date
    title: str
    description: Optional[str] = None
    event_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))


class DocumentChunk(SQLModel, table=True):
    __tablename__ = "document_chunks"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    document_id: UUID = Field(foreign_key="documents.id", index=True)
    chunk_text: str
    chunk_index: int
    chunk_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))


class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_sessions"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    patient_id: UUID = Field(foreign_key="patient_profiles.id", index=True)
    created_at: datetime = Field(default_factory=utcnow)


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chat_sessions.id", index=True)
    role: str  # user | assistant
    content: str
    created_at: datetime = Field(default_factory=utcnow)
