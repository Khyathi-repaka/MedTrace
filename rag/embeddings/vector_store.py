"""
ChromaDB wrapper. Every write/read carries patient_id in metadata, and every
query enforces a patient_id filter server-side — patient isolation happens
at retrieval, never by filtering results afterward in the API layer.
"""
from functools import lru_cache
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import get_settings


@lru_cache
def get_chroma_client():
    settings = get_settings()
    # anonymized_telemetry=False avoids the noisy (and harmless) posthog
    # "capture() takes 1 positional argument but 3 were given" errors that
    # show up in some chromadb/posthog version combos.
    return chromadb.PersistentClient(
        path=settings.CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def get_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(name="medtrace_documents")


def upsert_chunks(ids: list[str], embeddings: list[list[float]], documents: list[str], metadatas: list[dict]):
    collection = get_collection()
    collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)


def query_patient_chunks(query_embedding: list[float], patient_id: str, top_k: int = 5):
    collection = get_collection()
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"patient_id": patient_id},  # <-- mandatory server-side isolation filter
    )