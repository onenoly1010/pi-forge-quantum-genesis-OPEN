from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(title="Pi Forge Quantum Genesis API")


@app.get("/health")
def health() -> dict[str, str]:
    """Liveness probe endpoint."""
    return {"status": "healthy"}


@app.get("/ready")
def ready() -> dict[str, str]:
    """Readiness probe endpoint."""
    return {"status": "ready"}


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Pi Forge Quantum Genesis"}
