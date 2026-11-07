// Rendert den Testkampf deterministisch Frame fuer Frame (Playwright + Chromium/SwiftShader) zu MP4.
// Nutzung:
//   node tools/render.mjs --out out/test-fight.mp4 [--fps 30] [--w 1080 --h 1920] [--audio out/sfx.wav]
//   node tools/render.mjs --contact 1,2.5,3 --out out/contact [--w 540 --h 960]    (Einzelbilder zum Pruefen)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { startServer } from './serve.mjs';

const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]); return a; }, []));
const W = Number(args.w || 1080), H = Number(args.h || 1920), FPS = Number(args.fps || 30);
const out = args.out || 'out/test-fight.mp4';

const { server, port } = await startServer(0);
const browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => { const t = m.text(); if (!t.startsWith('[vite]')) console.log('[page]', t); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/?render=1&w=${W}&h=${H}&ep=${args.ep || 'test-fight'}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });

if (args.contact) {
  const times = String(args.contact).split(',').map(Number);
  fs.mkdirSync(out, { recursive: true });
  let t = 0; const dt = 1 / FPS;
  for (const target of times) {
    while (t < target - 1e-6) { await page.evaluate((d) => window.__fight.advance(d), dt); t += dt; }
    await page.evaluate(() => window.__world.render());
    const sim = await page.evaluate(() => window.__fight.simT);
    await page.screenshot({ path: path.join(out, `t${target.toFixed(2)}_s${sim.toFixed(2)}.png`) });
    console.log('frame', target);
  }
} else {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const silent = out.replace(/\.mp4$/, '.silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const dt = 1 / FPS; let n = 0; const t0 = Date.now();
  while (true) {
    const done = await page.evaluate((d) => { window.__fight.advance(d); window.__world.render(); return window.__fight.done; }, dt);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    n++; if (n % 30 === 0) console.log(`frame ${n} (t=${(n / FPS).toFixed(1)}s, ${((Date.now() - t0) / 1000 / n).toFixed(2)}s/frame)`);
    if (done || n > FPS * 40) break;
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  const info = await page.evaluate(() => window.__fight.exportAudio());
  fs.writeFileSync(out.replace(/\.mp4$/, '.audio.json'), JSON.stringify(info, null, 2));
  console.log(`fertig: ${silent} (${n} Frames, ${(n / FPS).toFixed(2)} s)`);
}
await browser.close(); server.close();
