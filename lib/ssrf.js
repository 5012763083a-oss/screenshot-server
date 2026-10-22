'use strict';
const dns = require('node:dns').promises; const net = require('node:net');
function v4Blocked(ip) { const p = ip.split('.').map(Number); const [a, b] = p;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)) || a >= 224 || (a === 192 && b === 0 && p[2] === 0); }
function isBlockedIp(ip) { if (net.isIPv4(ip)) return v4Blocked(ip); if (!net.isIPv6(ip)) return true; const s = ip.toLowerCase();
  const m = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); if (m) return v4Blocked(m[1]);
  return s === '::' || s === '::1' || /^f[cd]/.test(s) || /^fe[89ab]/.test(s) || /^ff/.test(s); }
// Resolve once; return the pinned IP or throw.
async function resolveSafe(urlStr, lookup = dns.lookup) { let u; try { u = new URL(urlStr); } catch { throw new Error('invalid_url'); }
  if (!/^https?:$/.test(u.protocol)) throw new Error('scheme_not_allowed'); if (u.username || u.password) throw new Error('credentials_not_allowed');
  const host = u.hostname.replace(/^\[|\]$/g, ''); const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => { throw new Error('dns_failed'); });
  if (!addrs.length) throw new Error('dns_failed'); for (const x of addrs) if (isBlockedIp(x.address)) throw new Error('blocked_address');
  return { url: u, host, ip: addrs[0].address }; }
module.exports = { isBlockedIp, resolveSafe };
