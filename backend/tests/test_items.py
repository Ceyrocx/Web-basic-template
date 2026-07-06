def test_create_and_list_items(client):
    # The list starts empty
    assert client.get("/api/items").json() == []

    # Create an item
    response = client.post("/api/items", json={"name": "Alice"})
    assert response.status_code == 200
    created = response.json()
    assert created["name"] == "Alice"
    assert isinstance(created["id"], int)

    # It now shows up in the list
    items = client.get("/api/items").json()
    assert len(items) == 1
    assert items[0]["name"] == "Alice"


def test_create_item_requires_name(client):
    # Missing "name" → FastAPI returns 422 (validation error)
    response = client.post("/api/items", json={})
    assert response.status_code == 422
