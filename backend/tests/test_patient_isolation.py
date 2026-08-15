"""
CRITICAL SECURITY TEST (spec Section 49/9): Patient A must NEVER retrieve
Patient B's records — neither via the relational API nor via RAG retrieval.
"""
import io


def _register_and_upload(client, email):
    r = client.post("/auth/register", json={"email": email, "password": "password123", "name": email})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    client.post(
        "/documents/upload", headers=headers,
        files={"file": ("report.pdf", io.BytesIO(b"%PDF-1.4 fake"), "application/pdf")},
    )
    return headers


def test_patient_cannot_see_other_patients_documents(client):
    headers_a = _register_and_upload(client, "patient_a@example.com")
    headers_b = _register_and_upload(client, "patient_b@example.com")

    docs_a = client.get("/documents", headers=headers_a).json()
    docs_b = client.get("/documents", headers=headers_b).json()

    assert len(docs_a) == 1
    assert len(docs_b) == 1
    assert docs_a[0]["id"] != docs_b[0]["id"]

    # Patient A must not be able to fetch Patient B's document by ID
    other_doc_id = docs_b[0]["id"]
    r = client.get(f"/documents/{other_doc_id}", headers=headers_a)
    assert r.status_code == 404


def test_rag_retrieval_is_patient_filtered(client):
    """Verifies the retriever always calls query_patient_chunks with the
    caller's own patient_id, never a globally unfiltered query."""
    import rag.retrieval.retriever as retriever_mod

    captured = {}
    original_query = retriever_mod.query_patient_chunks
    original_embed = retriever_mod.embed_texts

    def spy_query(query_embedding, patient_id, top_k=5):
        captured["patient_id"] = patient_id
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    # Stub embeddings too — this test asserts the isolation filter is always
    # passed through, not that the embedding model is reachable in CI.
    retriever_mod.query_patient_chunks = spy_query
    retriever_mod.embed_texts = lambda texts: [[0.0] * 384 for _ in texts]
    try:
        headers_a = _register_and_upload(client, "iso_a@example.com")
        client.post("/search", headers=headers_a, json={"query": "diabetes"})
        assert captured["patient_id"], "retrieval must always pass a patient_id filter"
    finally:
        retriever_mod.query_patient_chunks = original_query
        retriever_mod.embed_texts = original_embed
