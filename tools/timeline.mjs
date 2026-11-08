// Schnelle Zeitplan-Pruefung ohne Rendern: simuliert die Folge und zeigt Dialog-Ausgabezeiten, Ueberlappungen, Gesamtdauer.
//   node tools/timeline.mjs --ep part1
import { createRequire } from 'node:module';
import { startServer } from './serve.mjs';
const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1]]); return a; }, []));
const { server, port } = await startServer(0);
const browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 270, height: 480 } });
page.on('console', (m) => console.log('[page]', m.text())); page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/?render=1&w=270&h=480&ep=${args.ep || 'part1'}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const info = await page.evaluate(() => { const f = window.__fight; let n = 0; while (!f.done && n < 30 * 120) { f.advance(1 / 30); n++; } return f.exportAudio(); });
const durs = {};
if (args.json) { (await import('node:fs')).writeFileSync(args.json, JSON.stringify(info, null, 2)); }
let prevEnd = 0;
for (const c of info.cues.sort((a, b) => a.outStart - b.outStart)) {
  const end = c.outStart + c.estDur; const dl = c.outStart - c.wanted; const flag = (c.outStart < prevEnd - 0.01 ? '  <-- UEBERLAPPT' : '') + (dl > 0.4 ? `  (verzoegert um ${dl.toFixed(1)} s)` : '');
  console.log(`${c.id.padEnd(8)} ${c.speaker} ${c.outStart.toFixed(2).padStart(6)} -> ${end.toFixed(2).padStart(6)}  ${c.text}${flag}`); prevEnd = Math.max(prevEnd, end);
}
console.log('Anker (Ausgabezeit):', JSON.stringify(Object.fromEntries(Object.entries(info.anchors).map(([k, v]) => [k, +v.toFixed(1)]))));
console.log('Gesamtdauer:', info.duration.toFixed(2), 's');
if (args.events) for (const e of info.events) console.log(e.t.toFixed(2), e.kind);
await browser.close(); server.close();
