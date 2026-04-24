from __future__ import annotations

from fastapi.testclient import TestClient

from fastapi_app.main import app as fastapi_app
from flask_app.app import app as flask_app
from gradio_app import app as gradio_app


def test_fastapi_health() -> None:
    client = TestClient(fastapi_app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_fastapi_ready() -> None:
    client = TestClient(fastapi_app)
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_flask_health_and_ready() -> None:
    with flask_app.test_client() as client:
        health_response = client.get("/health")
        ready_response = client.get("/ready")
        assert health_response.status_code == 200
        assert ready_response.status_code == 200
        assert health_response.get_json() == {"status": "healthy"}
        assert ready_response.get_json() == {"status": "ready"}


def test_gradio_health_check() -> None:
    assert gradio_app.health_check() == {"status": "healthy"}
    interface = gradio_app.create_interface()
    assert interface is not None
