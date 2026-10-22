'use strict';
const http = require('node:http'); const crypto = require('node:crypto');
function createServer({ apiKey = process.env.API_KEY, shot = require('./shot').screenshot } = {}) {
  return http.createServer(async (req, res) => { const u = new URL(req.url, 'http://x');
    const send = (c, b, t = 'application/json') => { res.writeHead(c, { 'content-type': t }); res.end(t === 'application/json' ? JSON.stringify(b) : b); };
    if (u.pathname === '/health') return send(200, { ok: true });
    if (req.method !== 'GET' || u.pathname !== '/screenshot') return send(404, { error: 'not_found' });
    if (apiKey) { const k = Buffer.from(String(req.headers['x-api-key'] || '')), e = Buffer.from(apiKey);
      if (k.length !== e.length || !crypto.timingSafeEqual(k, e)) return send(401, { error: 'unauthorized' }); }
    const target = u.searchParams.get('url'); if (!target) return send(400, { error: 'missing_url' });
    try { const png = await shot(target, { fullPage: u.searchParams.get('fullPage') === 'true' }); send(200, png, 'image/png'); }
    catch (e) { const m = e.message; send(/blocked|scheme|invalid|credentials/.test(m) ? 400 : 502, { error: m.split('\n')[0] }); } }); }
module.exports = { createServer };
