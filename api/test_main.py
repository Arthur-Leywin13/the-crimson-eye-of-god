from fastapi.testclient import TestClient

from api.main import app, make_variants

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_global_search_returns_all_supported_platforms():
    response = client.post("/api/search", json={"username": "sample_handle", "authorized": True})
    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "global"
    assert len(payload["results"]) == 9
    assert {item["platform_id"] for item in payload["results"]} >= {
        "instagram", "telegram", "facebook", "x", "threads",
        "tiktok", "youtube", "linktree", "linkedin",
    }
    assert all(item["verification"] == "manual_required" for item in payload["results"])


def test_single_platform_search():
    response = client.post(
        "/api/search",
        json={"username": "sample_handle", "platform": "youtube", "authorized": True},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "platform"
    assert len(payload["results"]) == 1
    assert payload["results"][0]["platform_id"] == "youtube"


def test_unknown_platform_is_rejected():
    response = client.post(
        "/api/search",
        json={"username": "sample_handle", "platform": "unknown"},
    )
    assert response.status_code == 404


def test_invalid_username_is_rejected():
    response = client.post("/api/search", json={"username": "not a valid handle", "authorized": True})
    assert response.status_code == 422


def test_variant_generator_is_unique_and_bounded():
    variants = make_variants("sample_handle")
    assert variants[0] == "sample_handle"
    assert len(variants) == len(set(variants))
    assert len(variants) <= 10



def test_search_requires_authorization():
    response = client.post("/api/search", json={"username": "sample_handle"})
    assert response.status_code == 403


def test_search_accepts_authorized_self_audit():
    response = client.post(
        "/api/search", json={"username": "sample_handle", "authorized": True}
    )
    assert response.status_code == 200
