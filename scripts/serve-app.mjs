import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.join(process.cwd(), 'app');
const startPort = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded === '/' ? '/index.html' : decoded);
  const fullPath = path.join(root, normalized);

  if (!fullPath.startsWith(root)) {
    return null;
  }

  return fullPath;
}

function createServer() {
  return http.createServer((request, response) => {
    const filePath = safePath(request.url || '/');

    if (!filePath) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }

      response.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      response.end(content);
    });
  });
}

function listen(port) {
  const server = createServer();

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && port < startPort + 10) {
      listen(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, host, () => {
    console.log(`App server running at http://${host}:${port}`);
  });
}

listen(startPort);
