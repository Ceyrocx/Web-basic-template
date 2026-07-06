def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_health_db(client):
    response = client.get("/api/health/db")
    assert response.status_code == 200
    assert response.json() == {"database": "ok"}
