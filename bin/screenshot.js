#!/usr/bin/env node
'use strict';
const a = process.argv.slice(2);
if (a[0] === 'serve') { const host = process.env.HOST || '127.0.0.1', port = +(process.env.PORT || 3000);
  require('../lib/server').createServer().listen(port, host, () => console.log(`listening on http://${host}:${port}`)); }
else if (a[0]) { require('../lib/shot').screenshot(a[0], { fullPage: a.includes('--full') }).then(b => require('node:fs').writeFileSync(a[a.indexOf('-o') + 1] && a.includes('-o') ? a[a.indexOf('-o') + 1] : 'screenshot.png', b)).catch(e => { console.error(e.message); process.exit(1); }); }
else { console.log('Usage: screenshot <url> [-o out.png] [--full] | screenshot serve   (env: HOST=127.0.0.1 PORT=3000 API_KEY=)'); process.exit(1); }
