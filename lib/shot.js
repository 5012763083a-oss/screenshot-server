'use strict';
const { resolveSafe } = require('./ssrf');
// Pin the resolved IP via Chromium host-resolver rules so the browser can't re-resolve to another address;
// every other request (subresources, redirects) is re-checked and aborted if it targets a blocked IP.
async function screenshot(target, { fullPage = false, width = 1280, height = 800, timeout = 20000, lookup } = {}) {
  const { url, host, ip } = await resolveSafe(target, lookup);
  const { chromium } = require('playwright');
  const pinned = ip.includes(':') ? `[${ip}]` : ip;
  const browser = await chromium.launch({ args: [`--host-resolver-rules=MAP ${host} ${pinned}, EXCLUDE localhost`] });
  try { const page = await browser.newPage({ viewport: { width, height } });
    await page.route('**/*', async route => { const u = route.request().url();
      if (u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
      try { const h = new URL(u).hostname; if (h !== host) await resolveSafe(u, lookup); return route.continue(); } catch { return route.abort('blockedbyclient'); } });
    await page.goto(url.href, { waitUntil: 'load', timeout });
    return await page.screenshot({ fullPage, type: 'png' });
  } finally { await browser.close(); } }
module.exports = { screenshot };
