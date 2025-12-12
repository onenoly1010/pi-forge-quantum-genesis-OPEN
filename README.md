# Quantum Pi Forge (OPEN)

Backend service and dashboard for the Gargoura Engine on Pi Mainnet.

## Quick Start

### Local (Docker)

```bash
docker build -t quantum-pi-forge .
docker run -d -p 8080:8080 --name quantum-forge quantum-pi-forge
```

Open the dashboard: http://localhost:8080

Stop the container:

```bash
docker stop quantum-forge && docker rm quantum-forge
```

### Node.js

```bash
npm start
```

API: GET /api/status

## Project Files

- server.js — HTTP server with graceful shutdown and `/api/status`
- index.html — Dashboard UI with auto-refresh
- package.json — Scripts and metadata
- Dockerfile — Container config (exec-form CMD)
- .dockerignore — Build context exclusions

## Release Notes

- v0.1.0 — Initial backend, dashboard, Docker setup
