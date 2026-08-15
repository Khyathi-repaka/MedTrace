"""Patient-filtered semantic retrieval. Used by both /search and /assistant/chat."""
from rag.embeddings.embedder import embed_texts
from rag.embeddings.vector_store import query_patient_chunks


def retrieve_patient_chunks(query: str, patient_id: str, top_k: int = 5) -> list[dict]:
    query_embedding = embed_texts([query])[0]
    results = query_patient_chunks(query_embedding, patient_id=patient_id, top_k=top_k)

    out = []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0] if results.get("distances") else [None] * len(docs)

    for text, meta, dist in zip(docs, metas, distances):
        out.append({
            "chunk_text": text,
            "document_id": meta.get("document_id"),
            "document_name": meta.get("document_name"),
            "document_type": meta.get("document_type"),
            "medical_date": meta.get("medical_date") or None,
            "relevance_distance": dist,
        })
    return out
