// DOM-Overlay (HUD, Untertitel, Comic-Texte, Speedlines, Blitz) - komplett zeitgesteuert, kein CSS-Timing.
import { clamp, easeOutBack, easeOutCubic, lerp } from './util.js';

export class Overlay {
  constructor(world) {
    this.w = world; this.layer = document.getElementById('fxlayer'); this.pops = [];
    this.el = {
      hpL: document.getElementById('hpL'), hpR: document.getElementById('hpR'), lagL: document.getElementById('lagL'), lagR: document.getElementById('lagR'),
      cap: document.getElementById('caption'), flash: document.getElementById('flash'), lines: document.getElementById('lines'), vig: document.getElementById('vig'), end: document.getElementById('endcard'), round: document.getElementById('roundTxt'),
    };
    this.hp = { L: 1, R: 1 }; this.hpShown = { L: 1, R: 1 }; this.lag = { L: 1, R: 1 };
    this.flashV = 0; this.linesV = 0;
  }
  pop(text, screen, { color = '#fff', fill = '#ffd24a', size = 150, life = 0.7, rot = -8, stroke = 10, delay = 0, t0 } = {}) {
    const el = document.createElement('div'); el.className = 'pop'; el.textContent = text;
    el.style.fontSize = size + 'px'; el.style.color = fill; el.style.webkitTextStroke = stroke + 'px #000'; el.style.opacity = '0';
    this.layer.appendChild(el);
    const hw = text.length * size * 0.3 + 40; const x = Math.min(1080 - hw, Math.max(hw, screen.x));
    this.pops.push({ el, x, y: screen.y, life, rot, t0, size });
  }
  project(v) {
    const c = this.w.camera, p = v.clone().project(c);
    return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 };
  }
  setHealth(side, v) { this.hp[side] = clamp(v); }
  flash(a = 0.6) { this.flashV = Math.max(this.flashV, a); }
  speedLines(a = 0.8) { this.linesV = Math.max(this.linesV, a); }
  /** outT: Ausgabezeit; dtOut: Ausgabe-Delta */
  update(outT, dtOut, caption, endcard) {
    const k = 1 - Math.exp(-dtOut * 10);
    for (const s of ['L', 'R']) {
      this.hpShown[s] += (this.hp[s] - this.hpShown[s]) * k;
      if (this.lag[s] > this.hp[s]) this.lag[s] = Math.max(this.hp[s], this.lag[s] - dtOut * 0.25); else this.lag[s] = this.hp[s];
    }
    this.el.hpL.style.transform = `scaleX(${this.hpShown.L})`; this.el.lagL.style.transform = `scaleX(${this.lag.L})`;
    this.el.hpR.style.transform = `scaleX(${this.hpShown.R})`; this.el.lagR.style.transform = `scaleX(${this.lag.R})`;
    this.flashV *= Math.exp(-dtOut * 14); this.linesV *= Math.exp(-dtOut * 7);
    this.el.flash.style.opacity = this.flashV.toFixed(3); this.el.lines.style.opacity = this.linesV.toFixed(3);
    // Pops
    for (let i = this.pops.length - 1; i >= 0; i--) {
      const p = this.pops[i]; if (p.t0 === undefined) p.t0 = outT; const u = (outT - p.t0) / p.life;
      if (u >= 1) { p.el.remove(); this.pops.splice(i, 1); continue; }
      const sc = easeOutBack(clamp(u * 5)) * (1 + 0.12 * u) * (u > 0.75 ? 1 - (u - 0.75) / 0.25 : 1);
      p.el.style.opacity = '1';
      p.el.style.transform = `translate(${p.x}px, ${p.y - u * 50}px) translate(-50%, -50%) rotate(${p.rot}deg) scale(${sc.toFixed(3)})`;
    }
    // Untertitel
    if (caption) { this.el.cap.innerHTML = `<span class="sp" style="color:${caption.color}">${caption.speaker}</span>${caption.text}`; this.el.cap.style.opacity = '1'; } else { this.el.cap.style.opacity = '0'; }
    if (endcard) { this.el.end.style.opacity = String(endcard.a); this.el.end.innerHTML = endcard.html; this.el.end.style.transform = `scale(${endcard.s})`; } else this.el.end.style.opacity = '0';
  }
}
