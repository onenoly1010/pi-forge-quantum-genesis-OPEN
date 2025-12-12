---
name: quantum-pi-forge
description: Expert agent for Quantum Pi Forge backend development and Gargoura Engine monitoring
---

# Quantum Pi Forge Agent

This agent specializes in the Quantum Pi Forge backend service and Gargoura Engine dashboard.

## Project Context

**Quantum Pi Forge** is a Node.js-based backend service running on Pi Mainnet with the Gargoura Engine. The project includes:

- **Backend Service** (`server.js`) - HTTP server with graceful shutdown handling
- **Dashboard** (`index.html`) - Real-time monitoring interface with auto-refresh
- **Docker Configuration** - Containerized deployment with proper signal handling

## Technical Stack

- **Runtime**: Node.js 18+ (Alpine-based container)
- **Server**: Built-in `http` module (no external dependencies)
- **Port**: 8080
- **Network**: Pi Mainnet
- **Engine**: Gargoura Engine (Active)

## Repository Structure

```
/workspaces/pi-forge-quantum-genesis-OPEN/
├── server.js           # Main backend server with API endpoints
├── index.html          # Dashboard UI (real-time status monitoring)
├── package.json        # Project metadata and scripts
├── Dockerfile          # Container build configuration
├── .dockerignore       # Docker build exclusions
└── README.md           # Project documentation
```

## Key Features

### Backend Server (`server.js`)
- **Endpoints**:
  - `/` - Serves dashboard HTML
  - `/api/status` - JSON status endpoint
- **Graceful Shutdown**: Handles SIGTERM/SIGINT properly to avoid npm error logs
- **Error Handling**: Uncaught exceptions and unhandled rejections logged

### Dashboard (`index.html`)
- Real-time status display (auto-refresh every 5 seconds)
- Responsive purple gradient UI
- System information panel
- Manual refresh button
- Cross-browser compatible (standard + webkit prefixes)

### Docker Deployment
- Multi-stage Alpine-based build
- Exec-form CMD for proper signal handling
- Exposed port 8080
- Production-ready with `--omit=dev` flag

## Common Tasks

### Build & Run Container
```bash
docker build -t quantum-pi-forge .
docker run -d -p 8080:8080 --name quantum-forge quantum-pi-forge
```

### Stop Container
```bash
docker stop quantum-forge  # Graceful shutdown
docker rm quantum-forge    # Remove container
```

### View Logs
```bash
docker logs quantum-forge
```

### Access Dashboard
Open browser to `http://localhost:8080`

## Configuration

**Environment Variables**:
- `PORT` - Server port (default: 8080)

**Config Files**:
- `package.json` - npm scripts and metadata
- `Dockerfile` - Container build steps
- `.dockerignore` - Excludes node_modules, logs, .git

## Development Guidelines

1. **Graceful Shutdown**: Always handle SIGTERM/SIGINT signals properly
2. **Cross-Browser CSS**: Use standard properties + webkit prefixes
3. **Docker CMD**: Use exec form `["node", "server.js"]` for signal handling
4. **Error Logging**: Include descriptive emoji indicators (⚡🛡️✅💥🔄)
5. **API Design**: Keep JSON responses consistent with status/service/engine/network fields

## Troubleshooting

**npm error logs on shutdown**: Fixed via graceful shutdown handlers
**Dashboard not loading**: Check server is routing `/` to index.html
**Container not stopping cleanly**: Verify CMD uses exec form in Dockerfile
**CSS not rendering**: Ensure both `background-clip` and `-webkit-background-clip` are present

## Agent Capabilities

When invoked, this agent can:
- Analyze and fix backend server issues
- Update dashboard UI and styling
- Troubleshoot Docker deployment problems
- Add new API endpoints or features
- Implement proper error handling patterns
- Optimize container configuration
