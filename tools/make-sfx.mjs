// Synthetisiert Soundeffekte + Publikums-Atmo (KEINE Sprache!) aus out/<name>.audio.json -> out/<name>.sfx.wav
// Alles prozedural, keine fremden Samples, keine Lizenzfragen. Sprache kommt ausschliesslich von ElevenLabs.
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const inFile = process.argv[2] || 'out/test-fight.audio.json';
const outFile = process.argv[3] || inFile.replace(/\.audio\.json$/, '.sfx.wav');
const info = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const dur = info.duration + 1.0;
const N = Math.ceil(dur * SR);
const buf = new Float32Array(N);

let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
const add = (t, fn, len, vol = 1) => { const s = Math.floor(t * SR); for (let i = 0; i < len * SR && s + i < N; i++) buf[s + i] += fn(i / SR, i) * vol; };
class LP { constructor(f) { this.a = 1 - Math.exp(-2 * Math.PI * f / SR); this.y = 0; } p(x, f) { if (f) this.a = 1 - Math.exp(-2 * Math.PI * f / SR); this.y += this.a * (x - this.y); return this.y; } }
const sine = (f, t) => Math.sin(2 * Math.PI * f * t);

const S = {
  bell(t, v = 1) { const f0 = 540; for (const k of [0, 0.34]) add(t + k, (x) => { let s = 0; [[1, 1], [2.76, 0.55], [5.4, 0.35], [8.93, 0.2]].forEach(([m, a], i) => { s += a * sine(f0 * m, x) * Math.exp(-x * (1.6 + i * 1.4)); }); return s * 0.5; }, 2.2, v * 0.9); },
  bellKO(t, v = 1) { for (let i = 0; i < 3; i++) S.bell(t + 0.45 + i * 0.28, v * 0.6); },
  hit(t, v = 1) { const l = new LP(2200); add(t, (x) => l.p(rnd()) * Math.exp(-x * 38) * 1.2 + sine(140 * Math.exp(-x * 9) + 55, x) * Math.exp(-x * 17) * 1.1, 0.3, v * 0.75); },
  hit2(t, v = 1) { const l = new LP(1800); add(t, (x) => l.p(rnd()) * Math.exp(-x * 26) * 1.3 + sine(110 * Math.exp(-x * 7) + 45, x) * Math.exp(-x * 11) * 1.3, 0.45, v * 0.8); },
  bigHit(t, v = 1) { S.hit2(t, v); S.boom(t, v * 0.5); },
  boom(t, v = 1) { const l = new LP(900); add(t, (x) => sine(70 * Math.exp(-x * 2.2) + 30, x) * Math.exp(-x * 3.2) * 1.4 + l.p(rnd()) * Math.exp(-x * 5) * 0.7, 1.6, v * 0.75); },
  thud(t, v = 1) { const l = new LP(500); add(t, (x) => sine(85 * Math.exp(-x * 6) + 38, x) * Math.exp(-x * 7) * 1.4 + l.p(rnd()) * Math.exp(-x * 14) * 0.9, 0.8, v * 0.7); },
  whoosh(t, v = 1) { const l1 = new LP(500), l2 = new LP(500); add(t - 0.05, (x) => { const c = 500 + 2600 * Math.sin(Math.PI * Math.min(1, x / 0.26)); const n = rnd(); return (l1.p(n, c * 1.4) - l2.p(n, c * 0.5)) * Math.sin(Math.PI * Math.min(1, x / 0.26)) * 2.2; }, 0.3, v * 0.55); },
  swoosh(t, v = 1) { add(t, (x) => sine(1500 - 1100 * Math.min(1, x / 1.05) ** 1.2, x) * 0.25 * Math.min(1, x * 6) * (0.4 + 0.6 * Math.min(1, x / 1.05)), 1.1, v * 0.4); },
  bonk(t, v = 1) { S.hit2(t, v * 0.6); add(t, (x) => (sine(620, x) * 0.6 + sine(1010, x) * 0.35) * Math.exp(-x * 22), 0.4, v * 0.8); add(t + 0.05, (x) => sine(520 * Math.exp(-x * 2.4) + 120, x) * Math.exp(-x * 4) * Math.min(1, x * 40), 0.9, v * 0.5); },
  hum(t, v = 1) { add(t, (x) => (sine(110 + 160 * x, x) + 0.4 * sine(220 + 320 * x, x)) * 0.18 * Math.min(1, x * 4) * (1 - Math.min(1, x / 1.4) * 0.3), 1.4, v * 0.6); },
  charge(t, v = 1) { add(t, (x) => { const f = 90 * Math.pow(10, Math.min(1, x / 1.0)); return (sine(f, x) + 0.5 * sine(f * 2.01, x) + 0.25 * sine(f * 3, x)) * 0.17 * (0.5 + 0.5 * sine(18 + 20 * x, x)) * Math.min(1, x * 5); }, 1.15, v * 0.8); },
  count(t, v = 1) { const l = new LP(3000); add(t, (x) => l.p(rnd()) * Math.exp(-x * 70) * 1.2 + sine(900, x) * Math.exp(-x * 40) * 0.4, 0.15, v * 0.4); },
  block(t, v = 1) { const l = new LP(3500); add(t, 0.3, (x) => (sine(310, x) * 0.5 + sine(870, x) * 0.3) * Math.exp(-x * 26) + l.p(rnd()) * Math.exp(-x * 45) * 0.8, 0.3, v * 0.6); },
  tap(t, v = 1) { const l = new LP(5000); add(t, 0.12, (x) => l.p(rnd()) * Math.exp(-x * 70) + sine(900 * Math.exp(-x * 20) + 300, x) * Math.exp(-x * 40) * 0.6, 0.12, v * 0.5); },
  boing(t, v = 1) { add(t, 0.6, (x) => sine(220 + 260 * Math.sin(x * 18) * Math.exp(-x * 4) + 120 * Math.exp(-x * 6), x) * Math.exp(-x * 5), 0.6, v * 0.35); },
  growl(t, v = 1) { const l = new LP(260); add(t, 1.2, (x) => (sine(70 + 12 * sine(8, x), x) * 0.8 + l.p(rnd()) * 1.5) * Math.sin(Math.PI * Math.min(1, x / 1.2)), 1.2, v * 0.5); },
  bell2(t, v = 1) { S.bell(t + 0.4, v * 0.8); },
  click(t, v = 1) { add(t, 0.12, (x) => (sine(2400, x) + 0.5 * sine(3700, x)) * Math.exp(-x * 90), 0.12, v * 0.9); add(t, 0.2, (x) => sine(900, x) * Math.exp(-x * 35), 0.2, v * 0.4); },
  tick(t, v = 1) { add(t, 0.08, (x) => sine(1400, x) * Math.exp(-x * 60), 0.08, v * 0.5); },
  heart(t, v = 1) { for (const k of [0, 0.2]) add(t + k, 0.25, (x) => sine(58, x) * Math.exp(-x * 14), 0.25, v * 1.1); },
  slip(t, v = 1) { add(t, 0.45, (x) => sine(900 + 1500 * x * x - 400 * x, x) * Math.min(1, x * 40) * Math.exp(-x * 5), 0.45, v * 0.3); add(t + 0.35, 0.5, (x) => sine(300 * Math.exp(-x * 3) + 90, x) * Math.exp(-x * 4), 0.5, v * 0.5); },
  riser(t, v = 1) { const l = new LP(2000); add(t - 0.3, 0.8, (x) => { const u = x / 0.8; return l.p(rnd()) * u * u * 1.4 + sine(300 + 1500 * u * u, x) * 0.2 * u; }, 0.8, v * 0.5); },
  slowdown(t, v = 1) { add(t, 0.9, (x) => (sine(900 * Math.exp(-x * 2.6) + 60, x) + 0.5 * sine(1800 * Math.exp(-x * 2.6) + 120, x)) * Math.exp(-x * 2) * 0.5, 0.9, v * 0.6); },
  poof(t, v = 1) { const l = new LP(1200); add(t, 0.5, (x) => l.p(rnd()) * Math.exp(-x * 8) * 1.2, 0.5, v * 0.5); },
  crash(t, v = 1) { let p = 0; add(t, 1.8, (x) => { const n = rnd(); const h = n - p; p = n; return h * Math.exp(-x * 2.2) + sine(120 * Math.exp(-x), x) * Math.exp(-x * 3); }, 1.8, v * 0.5); },
  gravity(t, v = 1) { const l = new LP(600); add(t, 3.5, (x) => { const u = Math.min(1, x / 2); return (sine(40 + 30 * u, x) * 0.8 + l.p(rnd()) * 0.6) * Math.min(1, x * 3) * (1 - 0.5 * u) + sine(520 + 700 * u, x) * 0.12 * u * (0.5 + 0.5 * sine(5, x)); }, 3.5, v * 0.55); },
  crowd() {}, cheer() {}, laugh() {}, music() {}, mute() {},
};

const muteWin = info.events.filter((e) => e.kind === 'mute');
const gainAt = (t) => { let g = 1; for (const m of muteWin) { const a = m.t, b = m.t + m.dur, fi = m.fadeIn ?? 0.05; if (t >= a && t < b) g = Math.min(g, Math.min(1, (t - a) / fi) < 1 ? 1 - Math.min(1, (t - a) / fi) : 0); if (t >= b && t < b + 0.12) g = Math.min(g, (t - b) / 0.12); } return g; };
const SILENT_OK = new Set(['heart', 'tick', 'click']);
for (const e of info.events) { const f = S[e.kind]; if (!f) continue; if (!SILENT_OK.has(e.kind) && gainAt(e.t + 0.01) < 0.5) continue; f(e.t, e.vol ?? 1); }

// Publikums-Atmo: gefiltertes Rauschen mit Huellkurve aus den Events
const swell = (t) => { let v = 0.045; for (const e of info.events) { const dt = t - e.t; if (dt < 0) continue; if (e.kind === 'cheer') v += 0.16 * Math.min(1, dt * 2) * Math.exp(-dt * 0.5); else if (e.kind === 'crowd') v += 0.1 * Math.exp(-dt * 0.9); else if (['hit', 'hit2', 'bigHit', 'bonk', 'boom', 'thud'].includes(e.kind)) v += 0.05 * (e.vol ?? 1) * Math.exp(-dt * 2.2); } return v; };
const a = new LP(900), b = new LP(180);
for (let i = 0; i < N; i++) { const t = i / SR; const n = rnd(); buf[i] += (a.p(n) - b.p(n)) * swell(t) * 3.2 * (0.85 + 0.15 * Math.sin(t * 5.3)) * gainAt(t); }

// Normalisieren (Headroom fuer die Sprache: Peak -6 dBFS) + Fade
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.5 / (peak || 1);
const pcm = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) { let s = buf[i] * g; const fade = Math.min(1, (N - i) / (SR * 0.3)); s = Math.max(-1, Math.min(1, s * fade)); pcm.writeInt16LE(Math.round(s * 32767), i * 2); }
const hdr = Buffer.alloc(44); hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22); hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, Buffer.concat([hdr, pcm]));
console.log(`SFX: ${outFile} (${dur.toFixed(1)} s, ${info.events.length} Events, Peak vorher ${peak.toFixed(2)})`);
