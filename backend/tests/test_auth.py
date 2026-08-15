def test_register_and_login(client):
    r = client.post("/auth/register", json={
        "email": "a@example.com", "password": "password123", "name": "Alice",
    })
    assert r.status_code == 201
    assert "access_token" in r.json()

    r2 = client.post("/auth/login", json={"email": "a@example.com", "password": "password123"})
    assert r2.status_code == 200

    r3 = client.post("/auth/login", json={"email": "a@example.com", "password": "wrong"})
    assert r3.status_code == 401


def test_protected_route_requires_token(client):
    r = client.get("/patients/me")
    assert r.status_code == 401
