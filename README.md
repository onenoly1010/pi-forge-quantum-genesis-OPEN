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

### Multi-Architecture Build (Docker Buildx)

Build for both arm64 and amd64 architectures:

```bash
# Create and use a buildx builder (one-time setup)
docker buildx create --use --name multiarch-builder --platform linux/amd64,linux/arm64

# Enable QEMU for cross-platform emulation (one-time setup)
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t quantum-pi-forge:multiarch .

# To push to a registry (e.g., Docker Hub)
docker buildx build --platform linux/amd64,linux/arm64 -t <your-registry>/quantum-pi-forge:latest --push .

# To build and load for current architecture only
docker buildx build --platform linux/amd64 -t quantum-pi-forge:amd64 --load .
# or for arm64
docker buildx build --platform linux/arm64 -t quantum-pi-forge:arm64 --load .
```

**Note:** Multi-arch images cannot be loaded directly into Docker with `--load`. Use `--push` to push to a registry, or build for a single platform with `--load` for local testing.

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

- v0.1.0 — Initial backend, dashboard, Docker setup# 🗄️ ARCHIVED REPOSITORY

This repository has been archived as part of the Quantum Genesis Reset Protocol.

## 📅 Archive Date
2026-01-13

## 📍 Active Development
All active development has moved to the primary repository:
**https://github.com/onenoly1010/pi-forge-quantum-genesis**

## 🔗 Related Resources
- [Status Dashboard](https://github.com/onenoly1010/pi-forge-quantum-genesis/blob/main/STATUS.md)
- [Runbook](https://github.com/onenoly1010/pi-forge-quantum-genesis/blob/main/RUNBOOK.md)
- [Architecture Documentation](https://github.com/onenoly1010/pi-forge-quantum-genesis/tree/main/docs)

---

*This repository is read-only. For questions or contributions, please use the primary repository.*
