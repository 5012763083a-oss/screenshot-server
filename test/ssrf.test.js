'use strict';
const test = require('node:test'); const assert = require('node:assert'); const { isBlockedIp, resolveSafe } = require('../lib/ssrf'); const { createServer } = require('../lib/server');
test('blocked ranges', () => { for (const ip of ['127.0.0.1','10.1.2.3','172.16.0.1','192.168.1.1','169.254.169.254','0.0.0.0','100.64.0.1','::1','fe80::1','fd00::1','::ffff:127.0.0.1']) assert.ok(isBlockedIp(ip), ip);
  for (const ip of ['93.184.216.34','8.8.8.8','2606:4700::1111']) assert.ok(!isBlockedIp(ip), ip); });
test('resolveSafe pins and blocks', async () => { const fake = ip => async () => [{ address: ip }];
  assert.strictEqual((await resolveSafe('https://example.com/', fake('93.184.216.34'))).ip, '93.184.216.34');
  await assert.rejects(resolveSafe('http://evil.test/', fake('169.254.169.254')), /blocked/);
  await assert.rejects(resolveSafe('http://127.0.0.1/'), /blocked/); await assert.rejects(resolveSafe('file:///etc/passwd'), /scheme/); });
async function call(srv, path, headers = {}) { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const { port } = srv.address();
  try { const r = await fetch(`http://127.0.0.1:${port}${path}`, { headers }); return [r.status, r.headers.get('content-type')]; } finally { srv.close(); } }
test('server: api key + routing', async () => { const shot = async () => Buffer.from('png');
  assert.strictEqual((await call(createServer({ apiKey: 'k', shot }), '/screenshot?url=https://a.com'))[0], 401);
  assert.deepStrictEqual(await call(createServer({ apiKey: 'k', shot }), '/screenshot?url=https://a.com', { 'x-api-key': 'k' }), [200, 'image/png']);
  assert.strictEqual((await call(createServer({ apiKey: '', shot }), '/screenshot'))[0], 400);
  assert.strictEqual((await call(createServer({ apiKey: '' }), '/screenshot?url=http://127.0.0.1/'))[0], 400); });
test('live screenshot (needs network + browser)', { skip: !process.env.LIVE_TESTS && 'set LIVE_TESTS=1; box DNS returns 198.18.x fake IPs' }, async () => {
  const b = await require('../lib/shot').screenshot('https://example.com'); assert.ok(b.length > 1000); });
