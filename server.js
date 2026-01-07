const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

let requestCount = 0;
const startedAt = Date.now();

// Structured JSON logging utility
function log(level, message, metadata = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  };
  console.log(JSON.stringify(entry));
}

const server = http.createServer((req, res) => {
  requestCount += 1;
  
  // Log incoming HTTP request
  log('info', 'HTTP request received', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    requestCount
  });
  
  // API endpoint for status
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'online',
      service: 'Quantum Pi Forge',
      engine: 'Gargoura Active',
      network: 'Pi Mainnet'
    }));
    return;
  }

  // Healthcheck endpoint
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, uptime_ms: Date.now() - startedAt }));
    return;
  }

  // Metrics endpoint
  if (req.url === '/api/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      uptime_ms: Date.now() - startedAt,
      request_count: requestCount,
      endpoints: {
        status: 'served',
        healthz: 'served',
        metrics: 'served'
      }
    }));
    return;
  }
  
  // Serve dashboard HTML
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading dashboard');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  log('info', 'Quantum Pi Forge server started', {
    port: PORT,
    service: 'Quantum Pi Forge',
    engine: 'Gargoura Active',
    network: 'Pi Mainnet',
    pid: process.pid
  });
});

// --- Minimal WebSocket (RFC6455) implementation without external deps ---
const sockets = new Set();

server.on('upgrade', (req, socket) => {
  if (req.headers['upgrade'] !== 'websocket') {
    socket.end('HTTP/1.1 400 Bad Request');
    return;
  }

  const acceptKey = req.headers['sec-websocket-key'];
  const hash = crypto
    .createHash('sha1')
    .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${hash}`
  ];
  socket.write(headers.join('\r\n') + '\r\n\r\n');

  sockets.add(socket);
  socket.on('close', () => sockets.delete(socket));
  socket.on('error', () => sockets.delete(socket));

  // Send initial status frame
  wsSend(socket, JSON.stringify({
    type: 'status',
    payload: {
      status: 'online',
      service: 'Quantum Pi Forge',
      engine: 'Gargoura Active',
      network: 'Pi Mainnet',
      ts: Date.now()
    }
  }));
});

function wsSend(socket, data) {
  const json = Buffer.from(data);
  const frame = Buffer.alloc(2 + json.length);
  frame[0] = 0x81; // FIN + text frame
  frame[1] = json.length; // <126 bytes (our payload is small)
  json.copy(frame, 2);
  try { socket.write(frame); } catch {}
}

// Broadcast status every 5 seconds
setInterval(() => {
  const msg = JSON.stringify({
    type: 'status',
    payload: {
      status: 'online',
      service: 'Quantum Pi Forge',
      engine: 'Gargoura Active',
      network: 'Pi Mainnet',
      ts: Date.now()
    }
  });
  for (const s of sockets) wsSend(s, msg);
}, 5000);

// Graceful shutdown handling to prevent npm error logs
const shutdown = (signal) => {
  log('info', 'Shutdown signal received', { signal });
  
  server.close(() => {
    log('info', 'Server closed successfully', { signal });
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    log('error', 'Forced shutdown after timeout', { signal, timeoutMs: 10000 });
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  log('error', 'Uncaught exception', {
    error: err.message,
    stack: err.stack,
    name: err.name
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
  process.exit(1);
});
