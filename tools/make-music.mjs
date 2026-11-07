// Prozedurale Hintergrundmusik (eigene Synthese, keine Fremd-Samples/Lizenzen) aus out/<name>.audio.json -> out/<name>.music.wav
// Dramaturgie folgt den Ankern der Folge (cold / prov / fight / upper / land / bellEnd).
import fs from 'node:fs';
const SR = 44100;
const inFile = process.argv[2] || 'out/part1.audio.json';
const outFile = process.argv[3] || inFile.replace(/\.audio\.json$/, '.music.wav');
const info = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const A = info.anchors; const dur = info.duration + 1.0; const N = Math.ceil(dur * SR);
const out = new Float32Array(N);
let seed = 777; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
const BPM = 132, beat = 60 / BPM, bar = beat * 4;
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
// Intensitaet 0..4 ueber der Zeit (Ausgabezeit)
const I = (t) => {
  const g = (k, d) => (k in A ? A[k] : d);
  if (t < g('prov', 4.7) - 0.3) return 2.4;
  if (t < g('fight', 20) - 1.0) return 1.1;
  if (t < g('upper', 40) - 3.2) return 3.0;
  if (t < g('upper', 40) + 0.2) return 3.6;          // Aufladen -> Atomfaust
  if (t < g('land', 44)) return 3.4;
  if (t < g('land', 44) + 4.5) return 0.5;           // Auszaehlen: nur Herzschlag/Drohnen
  if (t < g('bellEnd', 54)) return 1.7;              // Newton steht auf: Spannung steigt
  return 0.8;
};
const add = (t0, len, fn, vol) => { const s = Math.floor(t0 * SR); for (let i = 0; i < len * SR && s + i < N; i++) out[s + i] += fn(i / SR) * vol; };
const lpState = { v: 0 };
const kick = (t, v = 1) => add(t, 0.3, (x) => Math.sin(2 * Math.PI * (48 + 120 * Math.exp(-x * 30)) * x) * Math.exp(-x * 9), 0.9 * v);
const snare = (t, v = 1) => { let l = 0; add(t, 0.25, (x) => { l += 0.5 * (rnd() - l); return (l * 1.6) * Math.exp(-x * 16) + Math.sin(2 * Math.PI * 190 * x) * Math.exp(-x * 22) * 0.5; }, 0.5 * v); };
const hat = (t, v = 1) => { let p = 0; add(t, 0.06, (x) => { const n = rnd(); const h = n - p; p = n; return h * Math.exp(-x * 60); }, 0.22 * v); };
const bass = (t, n, len, v = 1) => add(t, len, (x) => { const f = hz(n); const e = Math.min(1, x * 80) * Math.exp(-x * 2.2); return (Math.sin(2 * Math.PI * f * x) + 0.35 * Math.sin(4 * Math.PI * f * x)) * e; }, 0.55 * v);
const stab = (t, notes, len, v = 1) => add(t, len, (x) => { let s = 0; for (const n of notes) { const f = hz(n); s += Math.sign(Math.sin(2 * Math.PI * f * x)) * 0.12 + Math.sin(2 * Math.PI * f * 1.005 * x) * 0.12; } return s * Math.exp(-x * 7); }, 0.35 * v);
const arp = (t, n, v = 1) => add(t, 0.18, (x) => (Math.abs((x * hz(n)) % 1 * 4 - 2) - 1) * Math.exp(-x * 14), 0.22 * v);
const pad = (t, notes, len, v = 1) => add(t, len, (x) => { let s = 0; for (const n of notes) s += Math.sin(2 * Math.PI * hz(n) * x) + 0.5 * Math.sin(2 * Math.PI * hz(n) * 2.003 * x); return s * 0.08 * Math.min(1, x * 3) * Math.min(1, (len - x) * 3); }, v);
const riser = (t, len, v = 1) => { let l = 0; add(t, len, (x) => { const u = x / len; l += (0.02 + 0.6 * u * u) * (rnd() - l); return l * u * 1.8 + Math.sin(2 * Math.PI * (200 + 1800 * u * u) * x) * 0.15 * u; }, v); };
const crash = (t, v = 1) => { let p = 0; add(t, 1.6, (x) => { const n = rnd(); const h = n - p; p = n; return h * Math.exp(-x * 2.4); }, 0.35 * v); };

const prog = [[45, [57, 60, 64]], [41, [53, 57, 60]], [48, [55, 60, 64]], [43, [55, 59, 62]]];   // Am - F - C - G
const bars = Math.ceil(dur / bar);
for (let b = 0; b < bars; b++) {
  const t = b * bar, lvl = I(t + bar / 2); const [root, chord] = prog[b % 4];
  pad(t, chord.map((n) => n - 12), bar, lvl > 0.3 ? 0.9 : 1.3);
  for (let q = 0; q < 4; q++) {
    const tb = t + q * beat, li = I(tb);
    if (li >= 0.4 && li < 1.0) { if (q === 0) kick(tb, 0.55); }                         // Herzschlag
    if (li >= 1.0) { if (q % 2 === 0 || li >= 2) kick(tb, li >= 2 ? 1 : 0.6); }
    if (li >= 2.0 && q % 2 === 1) snare(tb, li >= 3 ? 1 : 0.7);
    if (li >= 1.0) { for (let e = 0; e < 2; e++) hat(tb + e * beat / 2, li >= 3 ? 1 : 0.6); }
    if (li >= 3.0) { for (let s = 0; s < 4; s++) if (s % 2) hat(tb + s * beat / 4, 0.6); }
    if (li >= 1.0) { for (let e = 0; e < 2; e++) bass(tb + e * beat / 2, root + (e && li >= 3 ? 12 : 0), beat / 2.2, li >= 3 ? 1 : 0.8); }
    if (li >= 3.0 && q % 2 === 1) stab(tb + beat / 2, chord, 0.25, 1);
    if (li >= 3.4) { for (let s = 0; s < 4; s++) arp(tb + s * beat / 4, chord[s % 3] + 12 * (s === 3 ? 1 : 0), 0.9); }
    if (li >= 1.0 && li < 2 && q === 0) arp(tb, chord[0] + 12, 0.7);
  }
}
if ('prov' in A) riser(A.prov - 0.9, 0.9, 0.6);                    // Uebergang Logo
if ('fight' in A) riser(A.fight - 1.9, 1.9, 0.9);                  // Aufbau zum Gong
if ('upper' in A) { riser(A.upper - 3.0, 3.0, 1.3); crash(A.upper, 1.3); }
if ('land' in A) crash(A.land, 0.8);
if ('bellEnd' in A) { crash(A.bellEnd, 1.0); kick(A.bellEnd, 1.2); }
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
const g = 0.6 / (peak || 1); const pcm = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) { const fade = Math.min(1, (N - i) / (SR * 1.5), i / (SR * 0.05)); pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * g * fade)) * 32767), i * 2); }
const hdr = Buffer.alloc(44); hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22); hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(outFile, Buffer.concat([hdr, pcm]));
console.log(`Musik: ${outFile} (${dur.toFixed(1)} s, ${BPM} BPM, Am-F-C-G)`);
