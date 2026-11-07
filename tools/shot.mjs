// Debug-Hilfe: Screenshot der Seite (mit optionalen URL-Parametern und JS-Setup).
// node tools/shot.mjs out.png "?w=540&h=960&choreo=0" "window.__world.camera.position.set(0,2,-5)"
import { createRequire } from 'node:module';
import { startServer } from './serve.mjs';
const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const [out, query = '?w=540&h=960', script = ''] = process.argv.slice(2);
const { server, port } = await startServer(0);
const browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/${query}${query.includes('render=1') ? '' : '&render=1'}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
if (script) { await page.evaluate(script); }
await page.evaluate(() => window.__world.render());
await page.screenshot({ path: out });
await browser.close(); server.close();
