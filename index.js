'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'prep');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.md': 'text/plain' };
const csp = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net/gh/A-Decent-Agency/DBuskRadio@1fe9ed0c2afc61552328fdda10d0f199bc3eaee9/; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://decentbusking.onrender.com; frame-src 'none'; media-src blob: https://decentbusking.onrender.com; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

function handler(req, res) {
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end('Preparation only: operations disabled.');
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Invalid path'); }
  if (pathname.includes('\0')) { res.writeHead(400); return res.end('Invalid path'); }
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(req.method === 'HEAD' ? '' : JSON.stringify({ mode: 'preparation-only', providerAccess: false, wagering: false }));
  }
  const relative = pathname === '/' || pathname === '/index.html' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !types[path.extname(file)] || pathname.includes('\\') || relative.split('/').some(part => part.startsWith('.'))) {
    res.writeHead(410); return res.end('Historical runtime unavailable. Visit / for preparation.');
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(410); return res.end('Historical runtime unavailable. Visit / for preparation.'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] + (/\.(html|js|mjs|css|json|md)$/.test(file) ? '; charset=utf-8' : '') });
    res.end(req.method === 'HEAD' ? '' : data);
  });
}
function createServer() { return http.createServer(handler); }
module.exports = { handler, createServer };
if (require.main === module) require('./server').start();
