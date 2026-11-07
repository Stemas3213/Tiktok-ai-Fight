// Paralleles, deterministisches Rendern einer Folge in 1080x1920/30fps: mehrere Chromium-Worker rendern disjunkte Frame-Bereiche.
//   node tools/render-parallel.mjs --ep part1 --out out/part1 [--w 1080 --h 1920 --fps 30 --workers 4] [--from N --to M]
// Jeder Worker simuliert die Frames davor ohne Rendern (schnell) -> identisches Ergebnis wie ein einzelner Lauf.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { startServer } from './serve.mjs';

const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1]]); return a; }, []));
const EP = args.ep || 'part1', OUT = args.out || `out/${EP}`, W = Number(args.w || 1080), H = Number(args.h || 1920), FPS = Number(args.fps || 30), WORKERS = Number(args.workers || 4);
const FR = `${OUT}.frames`; fs.mkdirSync(FR, { recursive: true });
const { server, port } = await startServer(0);
const launch = () => playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const open = async (browser, w, h) => {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/?render=1&w=${w}&h=${h}&ep=${EP}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
  return page;
};

// 1) Probe: Gesamtzahl der Frames + Audio-Metadaten
const pb = await launch(); const pp = await open(pb, 270, 480);
const probe = await pp.evaluate((fps) => { const f = window.__fight; let n = 0; while (!f.done && n < fps * 180) { f.advance(1 / fps); n++; } return { frames: n, audio: f.exportAudio() }; }, FPS);
await pb.close();
fs.writeFileSync(`${OUT}.audio.json`, JSON.stringify(probe.audio, null, 2));
const total = probe.frames; const from = Number(args.from || 0), to = Math.min(total, Number(args.to || total));
console.log(`Frames gesamt: ${total} (${(total / FPS).toFixed(2)} s); rendere ${from}..${to - 1} mit ${WORKERS} Workern @ ${W}x${H}`);

// 2) Worker
const todo = []; for (let i = from; i < to; i++) if (!fs.existsSync(`${FR}/f${String(i).padStart(5, '0')}.jpg`)) todo.push(i);
const chunk = Math.ceil((to - from) / WORKERS); let done = 0; const t0 = Date.now();
const worker = async (wi) => {
  const a = from + wi * chunk, b = Math.min(to, a + chunk); if (a >= b) return;
  const br = await launch(); const page = await open(br, W, H);
  await page.evaluate(({ n, fps }) => { for (let i = 0; i < n; i++) window.__fight.advance(1 / fps); }, { n: a, fps: FPS });
  for (let i = a; i < b; i++) {
    const file = `${FR}/f${String(i).padStart(5, '0')}.jpg`;
    await page.evaluate((fps) => { window.__fight.advance(1 / fps); }, FPS);
    if (fs.existsSync(file)) continue;
    await page.evaluate(() => window.__world.render());
    fs.writeFileSync(file, await page.screenshot({ type: 'jpeg', quality: 96 }));
    done++; if (done % 20 === 0) console.log(`  ${done}/${todo.length} Frames, ${((Date.now() - t0) / 1000 / done).toFixed(2)} s/Frame (gesamt), ETA ${(((Date.now() - t0) / done) * (todo.length - done) / 60000).toFixed(1)} min`);
  }
  await br.close();
};
await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
server.close();

// 3) Kodieren (nur wenn alle Frames da sind)
const missing = []; for (let i = 0; i < total; i++) if (!fs.existsSync(`${FR}/f${String(i).padStart(5, '0')}.jpg`)) missing.push(i);
if (missing.length) { console.log(`Noch ${missing.length} Frames offen - Kodierung uebersprungen.`); process.exit(0); }
await new Promise((res, rej) => { const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${FR}/f%05d.jpg`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}.silent.mp4`], { stdio: 'inherit' }); ff.on('close', (c) => c ? rej(new Error('ffmpeg ' + c)) : res()); });
console.log(`fertig: ${OUT}.silent.mp4`);
