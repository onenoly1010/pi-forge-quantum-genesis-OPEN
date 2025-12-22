const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

let requestCount = 0;
const startedAt = Date.now();

// Per-endpoint request counters
const endpointCounts = {
  '/api/status': 0,
  '/healthz': 0,
  '/api/metrics': 0,
  '/': 0
};

const server = http.createServer((req, res) => {
  requestCount += 1;
  
  // API endpoint for status
  if (req.url === '/api/status') {
    endpointCounts['/api/status'] += 1;
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
    endpointCounts['/healthz'] += 1;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, uptime_ms: Date.now() - startedAt }));
    return;
  }

  // Metrics endpoint
  if (req.url === '/api/metrics') {
    endpointCounts['/api/metrics'] += 1; // Include current request for consistency
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      uptime_ms: Date.now() - startedAt,
      request_count: requestCount,
      endpoints: {
        '/api/status': endpointCounts['/api/status'],
        '/healthz': endpointCounts['/healthz'],
        '/api/metrics': endpointCounts['/api/metrics'],
        '/': endpointCounts['/']
      }
    }));
    return;
  }
  
  // Serve dashboard HTML
  endpointCounts['/'] += 1;
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
  console.log(`⚡ QUANTUM PI FORGE IGNITED - Port ${PORT}`);
  console.log('🛡️  Gargoura Engine: ACTIVE on Pi Mainnet');
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
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
