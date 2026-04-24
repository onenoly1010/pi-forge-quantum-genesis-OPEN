from __future__ import annotations

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/health")
def health() -> tuple[str, int]:
    """Liveness probe endpoint."""
    return jsonify({"status": "healthy"}), 200


@app.route("/ready")
def ready() -> tuple[str, int]:
    """Readiness probe endpoint."""
    return jsonify({"status": "ready"}), 200


@app.route("/")
def index() -> tuple[str, int]:
    return jsonify({"message": "Pi Forge Quantum Genesis"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
