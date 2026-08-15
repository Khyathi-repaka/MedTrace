from fastapi import APIRouter, Depends
from app.api.deps import get_current_patient
from app.models.entities import PatientProfile
from app.schemas.api_schemas import PatientProfileOut

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/me", response_model=PatientProfileOut)
def get_my_profile(patient: PatientProfile = Depends(get_current_patient)):
    return patient
