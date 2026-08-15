"""
Structured extraction contract. The LLM is FORCED into this shape — no
free-form medical text is trusted directly. Anything that fails validation
is rejected (see ai/extraction/extract_service.py), never silently coerced.
"""
from typing import Optional
from pydantic import BaseModel, Field


class DiagnosisOut(BaseModel):
    condition: str
    diagnosis_date: Optional[str] = None  # ISO date string, null if not stated
    severity: Optional[str] = None


class SymptomOut(BaseModel):
    symptom: str
    duration: Optional[str] = None


class LabResultOut(BaseModel):
    test_name: str
    result: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    test_date: Optional[str] = None


class MedicationOut(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class DoctorOut(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None


class HospitalOut(BaseModel):
    name: Optional[str] = None


class FindingOut(BaseModel):
    finding: str
    recommendation: Optional[str] = None


class MedicalExtraction(BaseModel):
    """Top-level object the LLM must return, matching this schema exactly."""
    diagnoses: list[DiagnosisOut] = Field(default_factory=list)
    symptoms: list[SymptomOut] = Field(default_factory=list)
    lab_results: list[LabResultOut] = Field(default_factory=list)
    medications: list[MedicationOut] = Field(default_factory=list)
    doctor: Optional[DoctorOut] = None
    hospital: Optional[HospitalOut] = None
    findings: list[FindingOut] = Field(default_factory=list)

    @property
    def fact_count(self) -> int:
        return (
            len(self.diagnoses) + len(self.symptoms) + len(self.lab_results)
            + len(self.medications) + len(self.findings)
        )
