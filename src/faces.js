// Roblox-artige Gesichter und Torso-Decals, zur Laufzeit per Canvas gezeichnet.
import * as THREE from 'three';

function tex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function eye(ctx, x, y, r, look = 0, white = true, lid = 0) {
  ctx.save();
  if (white) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + look, y + r * 0.1, r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + look - r * 0.15, y - r * 0.15, r * 0.17, 0, Math.PI * 2); ctx.fill();
  if (lid > 0) { ctx.fillStyle = ctx.__skin; ctx.fillRect(x - r * 1.3, y - r * 1.4, r * 2.6, r * (0.6 + lid * 1.6)); }
  ctx.restore();
}
function xEye(ctx, x, y, r) {
  ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = r * 0.45; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); ctx.restore();
}
function swirlEye(ctx, x, y, r) {
  ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = r * 0.28; ctx.beginPath();
  for (let a = 0; a < 12; a += 0.2) { const rr = (a / 12) * r * 1.2; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
  ctx.stroke(); ctx.restore();
}
function brow(ctx, x, y, w, ang, color, thick) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(-w / 2, -thick / 2, w, thick, thick / 2); ctx.fill(); ctx.restore();
}
function mouth(ctx, kind, x, y, w, col = '#111') {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w * 0.09; ctx.lineCap = 'round';
  if (kind === 'smile') { ctx.beginPath(); ctx.arc(x, y - w * 0.25, w * 0.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  else if (kind === 'smirk') { ctx.beginPath(); ctx.moveTo(x - w * .4, y + 4); ctx.quadraticCurveTo(x + w * .1, y + w * .12, x + w * .45, y - w * .12); ctx.stroke(); }
  else if (kind === 'grit') {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = w * 0.07;
    ctx.beginPath(); ctx.roundRect(x - w * .45, y - w * .12, w * .9, w * .26, w * .06); ctx.fill(); ctx.stroke();
    ctx.beginPath(); for (let i = 1; i < 5; i++) { ctx.moveTo(x - w * .45 + i * w * .18, y - w * .12); ctx.lineTo(x - w * .45 + i * w * .18, y + w * .14); } ctx.stroke();
  } else if (kind === 'open') {
    ctx.beginPath(); ctx.ellipse(x, y, w * .38, w * .32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.ellipse(x, y + w * .12, w * .24, w * .13, 0, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'shout') {
    ctx.beginPath(); ctx.roundRect(x - w * .5, y - w * .25, w, w * .6, w * .22); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(x - w * .42, y - w * .25, w * .84, w * .12);
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.ellipse(x, y + w * .22, w * .26, w * .12, 0, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'wavy') {
    ctx.beginPath(); ctx.moveTo(x - w * .45, y); for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(x - w * .45 + (i + .5) * w * .225, y + (i % 2 ? -1 : 1) * w * .12, x - w * .45 + (i + 1) * w * .225, y); ctx.stroke();
  } else if (kind === 'flat') { ctx.beginPath(); ctx.moveTo(x - w * .35, y); ctx.lineTo(x + w * .35, y); ctx.stroke(); }
  else if (kind === 'frown') { ctx.beginPath(); ctx.arc(x, y + w * .35, w * .4, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  ctx.restore();
}

const EXPR = ['neutral', 'grit', 'hurt', 'shock', 'shout', 'happy', 'dizzy', 'smug', 'closed', 'tired', 'resolve'];

/** Gibt {expr: CanvasTexture} fuer einen Charakter zurueck. style: 'newton'|'einstein'|'ref'|'host'|'fan' */
export function makeFaces(style, skin = '#f1c9a5', extra = {}) {
  const out = {};
  for (const e of EXPR) {
    const c = cv(256, 256), ctx = c.getContext('2d'); ctx.__skin = skin;
    const cx = 128, ey = 112, ex = 54;
    const browCol = style === 'einstein' ? '#f3f3f3' : style === 'newton' ? '#cfcfd8' : (extra.brow || '#3a2a1a');
    const thick = style === 'einstein' ? 22 : 12, bw = style === 'einstein' ? 62 : 52;
    const open = (a) => { eye(ctx, cx - ex, ey, 17, a); eye(ctx, cx + ex, ey, 17, a); };
    let bl = -0.1, br = 0.1, by = ey - 36;
    if (e === 'neutral') { open(0); mouth(ctx, style === 'einstein' ? 'smile' : 'flat', cx, 190, 56); if (style === 'newton') { bl = 0.18; br = -0.18; } }
    if (e === 'smug') { open(5); mouth(ctx, 'smirk', cx, 192, 62); bl = 0.25; br = -0.12; by -= 2; }
    if (e === 'grit') { open(4); mouth(ctx, 'grit', cx, 192, 66); bl = 0.42; br = -0.42; by += 4; }
    if (e === 'hurt') { xEye(ctx, cx - ex, ey, 15); xEye(ctx, cx + ex, ey, 15); mouth(ctx, 'open', cx, 196, 60); bl = -0.35; br = 0.35; by -= 6; }
    if (e === 'shock') { eye(ctx, cx - ex, ey, 24, 0); eye(ctx, cx + ex, ey, 24, 0); mouth(ctx, 'open', cx, 200, 44); bl = -0.2; br = 0.2; by -= 14; }
    if (e === 'shout') { open(0); mouth(ctx, 'shout', cx, 190, 76); bl = 0.4; br = -0.4; by += 2; }
    if (e === 'happy') { ctx.strokeStyle = '#111'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * ex, ey + 10, 17, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke(); } mouth(ctx, 'open', cx, 190, 64); bl = -0.1; br = 0.1; by -= 8; }
    if (e === 'closed') { ctx.strokeStyle = '#111'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sg * ex, ey - 4, 17, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke(); } mouth(ctx, 'open', cx, 198, 34); bl = -0.18; br = 0.18; by += 6; }
    if (e === 'tired') { eye(ctx, cx - ex, ey + 4, 17, 0); eye(ctx, cx + ex, ey + 4, 17, 0); ctx.fillStyle = skin; ctx.fillRect(cx - ex - 24, ey - 24, 48, 27); ctx.fillRect(cx + ex - 24, ey - 24, 48, 27); ctx.strokeStyle = '#111'; ctx.lineWidth = 6; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sg * ex - 18, ey + 2); ctx.lineTo(cx + sg * ex + 18, ey + 2); ctx.stroke(); } mouth(ctx, 'open', cx, 200, 42); ctx.fillStyle = '#6fc3ff'; ctx.beginPath(); ctx.ellipse(cx + 92, 80, 8, 13, 0.2, 0, Math.PI * 2); ctx.fill(); bl = -0.3; br = 0.3; by += 10; }
    if (e === 'resolve') { ctx.fillStyle = '#fff'; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sg * ex, ey + 2, 18, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx + sg * ex + 3, ey + 3, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; } mouth(ctx, 'flat', cx, 196, 52); ctx.fillStyle = '#6fc3ff'; ctx.beginPath(); ctx.ellipse(cx + 96, 96, 7, 12, 0.2, 0, Math.PI * 2); ctx.fill(); bl = 0.12; br = -0.12; by += 12; }
    if (e === 'dizzy') { swirlEye(ctx, cx - ex, ey, 17); swirlEye(ctx, cx + ex, ey, 17); mouth(ctx, 'wavy', cx, 196, 60); bl = -0.2; br = 0.25; by -= 4; }
    brow(ctx, cx - ex, by, bw, bl, browCol, thick);
    brow(ctx, cx + ex, by, bw, br, browCol, thick);
    if (style === 'einstein') { // grosser Schnauzbart ueber dem Mund
      ctx.fillStyle = '#eceff1'; ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, 158); ctx.bezierCurveTo(cx - 30, 142, cx - 92, 152, cx - 96, 186); ctx.bezierCurveTo(cx - 70, 176, cx - 36, 184, cx, 172);
      ctx.bezierCurveTo(cx + 36, 184, cx + 70, 176, cx + 96, 186); ctx.bezierCurveTo(cx + 92, 152, cx + 30, 142, cx, 158); ctx.fill(); ctx.stroke();
    }
    if (style === 'newton') { // Nasenschatten + Falten
      ctx.strokeStyle = 'rgba(120,70,40,.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx + 4, 124); ctx.lineTo(cx + 12, 156); ctx.lineTo(cx - 4, 160); ctx.stroke();
    }
    if (style === 'ref' || style === 'host') { ctx.fillStyle = 'rgba(0,0,0,0)'; }
    out[e] = tex(c);
  }
  return out;
}

export function torsoDecal(kind, c1 = '#fff', c2 = '#000') {
  const c = cv(256, 256), ctx = c.getContext('2d');
  if (kind === 'newton') {
    ctx.fillStyle = '#f5f1e6'; ctx.fillRect(0, 0, 256, 256);              // Hemd
    ctx.fillStyle = '#7a1424'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(90, 0); ctx.lineTo(128, 120); ctx.lineTo(166, 0); ctx.lineTo(256, 0); ctx.lineTo(256, 256); ctx.lineTo(0, 256); ctx.fill(); // Weste
    ctx.fillStyle = '#f5f1e6'; ctx.beginPath(); ctx.moveTo(92, 0); ctx.lineTo(164, 0); ctx.lineTo(128, 124); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#d9d2c0'; ctx.lineWidth = 3;                       // Spitzen-Jabot
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(128, 20 + i * 24, 40 - i * 7, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#e8b923'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(128, 150 + i * 36, 9, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#e8b923'; ctx.lineWidth = 6; ctx.strokeRect(6, 6, 244, 244);
  } else if (kind === 'einstein') {
    ctx.fillStyle = '#8f98a3'; ctx.fillRect(0, 0, 256, 256);              // Strickpulli
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3; for (let x = 8; x < 256; x += 14) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 76px "Lilita One", Arial'; ctx.textAlign = 'center'; ctx.shadowColor = '#1a3a8a'; ctx.shadowBlur = 8;
    ctx.fillText('E=mc²', 128, 140);
    ctx.shadowBlur = 0; ctx.fillStyle = '#ffd24a'; ctx.font = 'bold 30px "Lilita One", Arial'; ctx.fillText('RELATIV GUT', 128, 200);
  } else if (kind === 'ref') {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 256, 256); ctx.fillStyle = '#111';
    for (let y = 0; y < 256; y += 42) ctx.fillRect(0, y, 256, 21);
    ctx.fillStyle = '#c0161c'; ctx.beginPath(); ctx.moveTo(128, 12); ctx.lineTo(86, -4); ctx.lineTo(86, 40); ctx.fill(); ctx.beginPath(); ctx.moveTo(128, 12); ctx.lineTo(170, -4); ctx.lineTo(170, 40); ctx.fill();
  } else if (kind === 'host') {
    ctx.fillStyle = '#1b1f3a'; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(90, 0); ctx.lineTo(166, 0); ctx.lineTo(128, 130); ctx.fill();
    ctx.fillStyle = '#d4a017'; ctx.beginPath(); ctx.moveTo(128, 20); ctx.lineTo(110, 150); ctx.lineTo(128, 170); ctx.lineTo(146, 150); ctx.fill();
    ctx.fillStyle = '#ffd24a'; ctx.font = 'bold 26px "Lilita One", Arial'; ctx.textAlign = 'center'; ctx.fillText('AFC', 200, 230);
  } else {
    ctx.fillStyle = c1; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = c2; ctx.fillRect(0, 200, 256, 56);
  }
  return tex(c);
}
