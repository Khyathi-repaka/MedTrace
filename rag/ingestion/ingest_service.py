"""Document -> chunks -> embeddings -> ChromaDB, with patient_id/document_id
in every chunk's metadata (also mirrored into Postgres document_chunks for
traceability, per the DB schema)."""
from uuid import uuid4

from rag.ingestion.chunker import chunk_text
from rag.embeddings.embedder import embed_texts
from rag.embeddings.vector_store import upsert_chunks


def ingest_document_text(
    *, patient_id: str, document_id: str, document_name: str,
    document_type: str, medical_date: str | None, raw_text: str,
) -> list[dict]:
    """Returns the list of chunk records persisted to Postgres by the caller."""
    chunks = chunk_text(raw_text)
    if not chunks:
        return []

    embeddings = embed_texts(chunks)
    ids = [str(uuid4()) for _ in chunks]
    metadatas = [
        {
            "patient_id": patient_id,
            "document_id": document_id,
            "document_name": document_name,
            "document_type": document_type,
            "medical_date": medical_date or "",
            "chunk_index": i,
        }
        for i in range(len(chunks))
    ]

    upsert_chunks(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)

    return [
        {"id": ids[i], "chunk_text": chunks[i], "chunk_index": i, "metadata": metadatas[i]}
        for i in range(len(chunks))
    ]
