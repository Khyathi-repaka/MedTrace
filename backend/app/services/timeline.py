from uuid import UUID
from sqlmodel import Session, select
from app.models.entities import TimelineEvent


def get_patient_timeline(session: Session, patient_id: UUID) -> list[TimelineEvent]:
    stmt = (
        select(TimelineEvent)
        .where(TimelineEvent.patient_id == patient_id)
        .order_by(TimelineEvent.event_date.asc())
    )
    return list(session.exec(stmt))
