/**
 * Production server for OpenAcademy PWA.
 * Serves static files and proxies API requests to the upstream Laravel API.
 * Uses Node.js http-proxy to handle HTTPS upstream (which nginx:alpine struggles with in Docker).
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 80;
const STATIC_DIR = path.join(__dirname, 'dist');
const UPSTREAM_HOST = 'app.theopenacademy.org';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
};

// Proxy paths: local prefix → upstream path prefix
const PROXY_ROUTES = {
  '/v3/': '/api/v3/',
  '/auth/': '/api/auth/',
  '/guest/': '/api/guest/',
  '/media/': '/media/',
};

function proxyRequest(req, res, upstreamPath) {
  // Collect request body
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks);

    const forwardHeaders = { ...req.headers };
    delete forwardHeaders['host'];
    delete forwardHeaders['connection'];
    delete forwardHeaders['content-length'];
    delete forwardHeaders['transfer-encoding'];
    delete forwardHeaders['accept-encoding'];

    // Strip proxy/CDN headers added by Coolify/Traefik/Cloudflare — upstream rejects them
    for (const key of Object.keys(forwardHeaders)) {
      if (key.startsWith('x-forwarded') || key.startsWith('x-real') || key.startsWith('cf-') || key === 'true-client-ip') {
        delete forwardHeaders[key];
      }
    }

    const options = {
      hostname: UPSTREAM_HOST,
      port: 443,
      path: upstreamPath,
      method: req.method,
      headers: {
        ...forwardHeaders,
        host: UPSTREAM_HOST,
        'content-length': body.length,
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad Gateway', message: err.message }));
    });

    if (body.length > 0) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

function serveStatic(req, res) {
  const parsedUrl = url.parse(req.url);
  let filePath = path.join(STATIC_DIR, parsedUrl.pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Cache headers for assets
      const headers = { 'Content-Type': contentType };
      if (parsedUrl.pathname.startsWith('/assets/')) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      }

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback: serve index.html
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(STATIC_DIR, 'index.html')).pipe(res);
    }
  });
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;

  // Check proxy routes
  for (const [prefix, upstreamPrefix] of Object.entries(PROXY_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      const upstreamPath = upstreamPrefix + pathname.slice(prefix.length);
      proxyRequest(req, res, upstreamPath);
      return;
    }
  }

  // Serve static files
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`OpenAcademy PWA server running on port ${PORT}`);
  console.log(`Proxying API requests to ${UPSTREAM_HOST}`);
});
