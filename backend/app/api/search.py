from fastapi import APIRouter, Depends
from app.api.deps import get_current_patient
from app.models.entities import PatientProfile
from app.schemas.api_schemas import SearchRequest, SearchResultOut
from rag.retrieval.retriever import retrieve_patient_chunks

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=list[SearchResultOut])
def semantic_search(payload: SearchRequest, patient: PatientProfile = Depends(get_current_patient)):
    # patient.id (from JWT-derived profile) is the ONLY patient_id used for
    # retrieval — never anything from the request body.
    results = retrieve_patient_chunks(payload.query, patient_id=str(patient.id), top_k=payload.top_k)
    return [SearchResultOut(**r) for r in results]
