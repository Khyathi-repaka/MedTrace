"""
Writes a validated MedicalExtraction into Postgres: conditions, symptoms,
lab_results, medications, treatments, timeline_events. Pure function of
(extraction, patient_id, document_id) — no hidden state, easy to unit test.
"""
from datetime import date, datetime
from uuid import UUID

from sqlmodel import Session

from app.models.entities import (
    Condition, Symptom, LabResult, Medication, Treatment, TimelineEvent,
)
from ai.schemas.extraction import MedicalExtraction


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return None


def persist_extraction(
    session: Session, *, extraction: MedicalExtraction, patient_id: UUID, document_id: UUID,
) -> dict:
    counts = {"conditions": 0, "symptoms": 0, "lab_results": 0, "medications": 0, "timeline_events": 0}

    for dx in extraction.diagnoses:
        dx_date = _parse_date(dx.diagnosis_date)
        cond = Condition(
            patient_id=patient_id, name=dx.condition, status="active",
            first_diagnosed=dx_date, severity=dx.severity,
        )
        session.add(cond)
        counts["conditions"] += 1
        if dx_date:
            session.add(TimelineEvent(
                patient_id=patient_id, document_id=document_id, event_type="diagnosis",
                event_date=dx_date, title=f"Diagnosed: {dx.condition}",
                description=dx.severity, event_metadata={"severity": dx.severity},
            ))
            counts["timeline_events"] += 1

    for sym in extraction.symptoms:
        session.add(Symptom(patient_id=patient_id, document_id=document_id,
                             name=sym.symptom, duration=sym.duration))
        counts["symptoms"] += 1

    for lab in extraction.lab_results:
        lab_date = _parse_date(lab.test_date)
        session.add(LabResult(
            patient_id=patient_id, document_id=document_id, test_name=lab.test_name,
            result=lab.result, unit=lab.unit, reference_range=lab.reference_range,
            test_date=lab_date,
        ))
        counts["lab_results"] += 1
        if lab_date:
            session.add(TimelineEvent(
                patient_id=patient_id, document_id=document_id, event_type="lab_result",
                event_date=lab_date, title=f"{lab.test_name}: {lab.result}{lab.unit or ''}",
                description=lab.reference_range,
            ))
            counts["timeline_events"] += 1

    for med in extraction.medications:
        start_date = _parse_date(med.start_date)
        session.add(Medication(
            patient_id=patient_id, document_id=document_id, name=med.name, dosage=med.dosage,
            frequency=med.frequency, duration=med.duration, start_date=start_date,
            end_date=_parse_date(med.end_date), status="active",
        ))
        session.add(Treatment(
            patient_id=patient_id, document_id=document_id, treatment_name=med.name,
            medication=med.name, dosage=med.dosage, frequency=med.frequency,
            start_date=start_date, end_date=_parse_date(med.end_date),
            doctor=extraction.doctor.name if extraction.doctor else None, status="active",
        ))
        counts["medications"] += 1
        if start_date:
            session.add(TimelineEvent(
                patient_id=patient_id, document_id=document_id, event_type="medication",
                event_date=start_date, title=f"Started {med.name}",
                description=f"{med.dosage or ''} {med.frequency or ''}".strip(),
            ))
            counts["timeline_events"] += 1

    session.commit()
    return counts
