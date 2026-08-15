import io


def _register(client, email):
    r = client.post("/auth/register", json={"email": email, "password": "password123", "name": "Test User"})
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_upload_invalid_file_type_rejected(client):
    headers = _register(client, "docs@example.com")
    r = client.post(
        "/documents/upload",
        headers=headers,
        files={"file": ("malware.exe", io.BytesIO(b"not a real file"), "application/octet-stream")},
    )
    assert r.status_code == 400


def test_upload_and_list(client):
    headers = _register(client, "docs2@example.com")
    r = client.post(
        "/documents/upload",
        headers=headers,
        files={"file": ("report.pdf", io.BytesIO(b"%PDF-1.4 fake pdf bytes"), "application/pdf")},
        data={"document_type": "report"},
    )
    assert r.status_code == 201
    assert r.json()["processing_status"] == "UPLOADED"

    r2 = client.get("/documents", headers=headers)
    assert r2.status_code == 200
    assert len(r2.json()) == 1
