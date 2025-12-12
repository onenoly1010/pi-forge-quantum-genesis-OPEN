# Quantum Pi Forge Roadmap

This document tracks planned enhancements and future work.

## v0.2.0 (Next)
- Dashboard: Live WebSocket updates for status
- Backend: `/api/metrics` endpoint with uptime and request counts
- Docker: Multi-arch builds (arm64, amd64)
- Observability: Add structured logs and healthcheck endpoint

## v0.3.0
- Auth: Token-based access for API endpoints
- Config: Environment-driven dashboard values
- Deployment: Compose file for easy local stack

## Ideas (Backlog)
- Dark mode toggle in dashboard
- Prometheus metrics export
- CI pipeline for build and lint
- Helm chart for Kubernetes deploy

## Notes
- Keep JSON status shape stable (`status`, `service`, `engine`, `network`)
- Maintain graceful shutdown and signal handling in Docker
