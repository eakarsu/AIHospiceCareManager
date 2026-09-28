const fs = require('fs');
const http = require('http');
const path = require('path');

const buildRoot = path.resolve(__dirname, '..', 'build');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const backendPort = Number(process.env.BACKEND_PORT || 3001);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    const proxyRequest = http.request({
      hostname: '127.0.0.1',
      port: backendPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${backendPort}` },
    }, (proxyResponse) => {
      res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(res);
    });
    proxyRequest.on('error', () => {
      res.statusCode = 502;
      res.end('Backend unavailable');
    });
    req.pipe(proxyRequest);
    return;
  }
  const requestedPath = path.resolve(buildRoot, `.${pathname}`);
  const safePath = requestedPath.startsWith(`${buildRoot}${path.sep}`) ? requestedPath : buildRoot;
  const filePath = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(buildRoot, 'index.html');

  res.setHeader('Content-Type', mimeTypes[path.extname(filePath)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(filePath)
    .on('error', () => {
      res.statusCode = 500;
      res.end('Unable to serve application');
    })
    .pipe(res);
}).listen(port, host, () => {
  console.log(`Hospice Care UI running on http://${host}:${port}`);
});
