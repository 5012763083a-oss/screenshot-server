# screenshot-server

Self-hosted website screenshots with Playwright: a CLI and a tiny HTTP server.

```sh
npm install
npx screenshot https://example.com -o out.png --full
npx screenshot serve            # http://127.0.0.1:3000
curl 'http://127.0.0.1:3000/screenshot?url=https://example.com&fullPage=true' -o shot.png
```

- Binds **127.0.0.1** by default. Set `HOST=0.0.0.0` to expose it, and then set `API_KEY` too (clients send `x-api-key`).
- **SSRF protection:** only http/https; the hostname is resolved once and rejected if any address is private, loopback, link-local (incl. 169.254.169.254 metadata), CGNAT, multicast or reserved. The browser is pinned to that IP, and every subresource/redirect to another host is re-checked.
- `GET /health` returns `{ "ok": true }`.

Free webhook debugging guides: https://5012763083a-oss.github.io/webhook-fixes/

## Test

`npm test` (live browser test runs with `LIVE_TESTS=1`).

MIT © webhookfixes
