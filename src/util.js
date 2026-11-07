// Allgemeine Mathe-/Easing-Helfer (deterministisch, ohne Math.random).
import * as THREE from 'three';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInCubic = (t) => Math.pow(clamp(t), 3);
export const easeOutQuad = (t) => 1 - (1 - clamp(t)) * (1 - clamp(t));
export const easeInQuad = (t) => clamp(t) * clamp(t);
export const easeInOut = (t) => smooth(t);
export const easeOutBack = (t, s = 1.70158) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
export const easeOutElastic = (t) => {
  t = clamp(t); if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
};
/** Glocke: 0 -> 1 -> 0 ueber [a,b,c] */
export const bell = (t, a, b, c) => t < b ? smooth(seg(t, a, b)) : 1 - smooth(seg(t, b, c));

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stueckweise lineare Kurve [[t,v],...] */
export function curve(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const wrapAngle = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/** Federsystem 2. Ordnung (semi-implizit), fuer Treffer-Reaktionen. */
export class Spring {
  constructor(k = 120, c = 12, x = 0) { this.k = k; this.c = c; this.x = x; this.v = 0; this.target = 0; }
  kick(dv) { this.v += dv; }
  step(dt) {
    const n = Math.max(1, Math.ceil(dt / 0.004));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const a = -this.k * (this.x - this.target) - this.c * this.v;
      this.v += a * h; this.x += this.v * h;
    }
  }
}
