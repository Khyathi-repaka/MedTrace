"""Timeline, conditions, treatments, medications — all read straight from
Postgres, scoped to the authenticated patient. Nothing here is hard-coded."""
import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_current_patient
from app.db.session import get_session
from app.models.entities import PatientProfile, Condition, Treatment, Medication, LabResult
from app.services.timeline import get_patient_timeline
from app.schemas.api_schemas import TimelineEventOut, ConditionOut, TreatmentOut, LabResultOut

router = APIRouter(tags=["health-history"])


@router.get("/timeline", response_model=list[TimelineEventOut])
def get_timeline(patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    return get_patient_timeline(session, patient.id)


@router.get("/conditions", response_model=list[ConditionOut])
def list_conditions(patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    conditions = session.exec(select(Condition).where(Condition.patient_id == patient.id)).all()
    labs = session.exec(select(LabResult).where(LabResult.patient_id == patient.id)).all()
    labs_by_test = defaultdict(list)
    for lab in labs:
        labs_by_test[lab.test_name.lower()].append(lab)

    out = []
    for c in conditions:
        matching_labs = [l for name, ls in labs_by_test.items() if name in c.name.lower() for l in ls]
        latest = None
        if matching_labs:
            latest_lab = sorted([l for l in matching_labs if l.test_date], key=lambda l: l.test_date)[-1:] or matching_labs[:1]
            latest = f"{latest_lab[0].test_name}: {latest_lab[0].result}{latest_lab[0].unit or ''}"
        doc_count = len({l.document_id for l in matching_labs})
        out.append(ConditionOut(
            id=c.id, name=c.name, status=c.status, first_diagnosed=c.first_diagnosed,
            severity=c.severity, document_count=doc_count, latest_lab_result=latest,
        ))
    return out


@router.get("/conditions/{condition_id}", response_model=ConditionOut)
def get_condition(condition_id: uuid.UUID, patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    c = session.get(Condition, condition_id)
    if not c or c.patient_id != patient.id:
        raise HTTPException(404, "Condition not found")
    return ConditionOut(id=c.id, name=c.name, status=c.status, first_diagnosed=c.first_diagnosed,
                         severity=c.severity, document_count=0, latest_lab_result=None)


@router.get("/treatments", response_model=list[TreatmentOut])
def list_treatments(patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    return session.exec(select(Treatment).where(Treatment.patient_id == patient.id)).all()


@router.get("/medications")
def list_medications(patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    return session.exec(select(Medication).where(Medication.patient_id == patient.id)).all()


@router.get("/lab-results", response_model=list[LabResultOut])
def list_lab_results(patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    """
    Full historical lab series for the authenticated patient, ordered
    oldest-to-newest — the frontend groups these by test_name to render
    trend charts (e.g. HbA1c over time) on the Conditions page. No values
    are invented here; only what was actually extracted from documents.
    """
    stmt = (
        select(LabResult)
        .where(LabResult.patient_id == patient.id)
        .order_by(LabResult.test_date.asc())
    )
    return session.exec(stmt).all()
