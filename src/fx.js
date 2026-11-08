// Partikel & Effekte (alle deterministisch in Sim-Zeit; Zufall aus festem Seed).
import * as THREE from 'three';
import { mulberry32, clamp, lerp, easeOutCubic } from './util.js';

function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

function starShape(outer = 1, inner = 0.45, n = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? inner : outer, a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  s.closePath(); return s;
}

const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
class Pool {
  constructor(scene, geo, mat, max) {
    this.max = max; this.mesh = new THREE.InstancedMesh(geo, mat, max); this.mesh.frustumCulled = false; this.mesh.castShadow = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.p = []; scene.add(this.mesh); this.dummy = new THREE.Object3D(); this.col = new THREE.Color(); this.colored = false;
    for (let i = 0; i < max; i++) { this.mesh.setMatrixAt(i, ZERO); }
  }
  add(p) { if (this.p.length < this.max) this.p.push(p); }
  step(dt, t) {
    const d = this.dummy;
    for (let i = this.p.length - 1; i >= 0; i--) { const q = this.p[i]; q.age += dt; if (q.age >= q.life) this.p.splice(i, 1); }
    let i = 0;
    for (const q of this.p) {
      q.v.y -= q.g * (this.gScale ?? 1) * dt; q.v.multiplyScalar(Math.exp(-q.drag * dt)); q.pos.addScaledVector(q.v, dt);
      if (q.floor !== undefined && q.pos.y < q.floor) { q.pos.y = q.floor; q.v.y *= -0.35; q.v.x *= 0.6; q.v.z *= 0.6; }
      const u = q.age / q.life, sc = q.size * (u < 0.1 ? u / 0.1 : 1) * (u > 0.7 ? (1 - u) / 0.3 : 1);
      d.position.copy(q.pos); d.rotation.set(q.rx + q.sx * q.age, q.ry + q.sy * q.age, q.rz); d.scale.setScalar(Math.max(0.0001, sc)); d.updateMatrix();
      this.mesh.setMatrixAt(i, d.matrix); this.mesh.setColorAt(i, this.col.set(q.color)); i++;
    }
    for (let k = i; k < this.max; k++) this.mesh.setMatrixAt(k, ZERO);
    this.mesh.instanceMatrix.needsUpdate = true; if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}

export class FX {
  constructor(scene, camera) {
    this.scene = scene; this.camera = camera; this.rng = mulberry32(99); this.t = 0;
    const brick = new THREE.BoxGeometry(1, 1, 1);
    this.bricks = new Pool(scene, brick, new THREE.MeshStandardMaterial({ roughness: 0.4 }), 600);
    const starGeo = new THREE.ExtrudeGeometry(starShape(), { depth: 0.25, bevelEnabled: false });
    starGeo.center();
    this.stars = new Pool(scene, starGeo, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 200);
    this.bricks._prev = 0; this.stars._prev = 0;
    this.confetti = new Pool(scene, new THREE.PlaneGeometry(1, 0.55), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), 500); this.confetti._prev = 0;

    const soft = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    this.softTex = soft;
    this.puffs = []; this.puffPool = [];
    for (let i = 0; i < 90; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); this.puffPool.push(s); }
    // Comic-Sternexplosion
    const burstTex = canvasTex(256, 256, (g, w, h) => {
      const cx = w / 2, cy = h / 2; const pts = 14;
      const draw = (r1, r2, col) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < pts * 2; i++) { const r = i % 2 ? r1 : r2; const a = i / (pts * 2) * Math.PI * 2; i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill(); };
      draw(70, 125, '#ff3b1f'); draw(55, 100, '#ffd24a'); draw(35, 62, '#fff7c2');
    });
    this.burstTex = burstTex; this.bursts = []; this.burstPool = [];
    for (let i = 0; i < 8; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: burstTex, transparent: true, depthWrite: false, depthTest: false })); s.visible = false; s.renderOrder = 10; scene.add(s); this.burstPool.push(s); }
    // Schockwellen
    this.rings = []; this.ringPool = [];
    for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 56), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); this.ringPool.push(m); }
    // Dizzy-Sterne
    this.dizzy = [];
    this.starMat = new THREE.MeshBasicMaterial({ color: '#ffe14a' });
    this.sg = starGeo;
    // Formeln
    this.formulas = [];
    this.formulaTex = ['E=mc²', 'E', 'm', 'c²', '=', 'E=mc²'].map((s) => canvasTex(256, 128, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, w, h); g.font = 'bold 84px "Lilita One", Arial'; g.textAlign = 'center'; g.fillStyle = '#fff6b0'; g.shadowColor = '#ffb300'; g.shadowBlur = 24; g.fillText(s, w / 2, 90); }));
    // Aura
    this.aura = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), new THREE.MeshBasicMaterial({ color: '#ffd24a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }));
    this.aura.visible = false; scene.add(this.aura);
    this.aura2 = this.aura.clone(); this.aura2.material = this.aura.material.clone(); this.aura2.material.side = THREE.FrontSide; scene.add(this.aura2);
    this.auraLight = new THREE.PointLight('#ffd24a', 0, 8, 1.6); scene.add(this.auraLight);
    this.flashLight = new THREE.PointLight('#fff2c0', 0, 7, 1.6); scene.add(this.flashLight); this.flashT = -9; this.flashPos = new THREE.Vector3();
    this.auraState = { f: null, from: 0, to: 0, power: 0 };
    this.dust = [];
  }
  r(a = 0, b = 1) { return a + (b - a) * this.rng(); }
  rv(s = 1) { return new THREE.Vector3(this.r(-1, 1), this.r(-1, 1), this.r(-1, 1)).multiplyScalar(s); }

  bricksBurst(pos, n, { color = ['#ffd24a', '#ff7a1a', '#fff'], speed = 4, size = 0.08, up = 2, life = 1.0, dir = null, spread = 1, floor } = {}) {
    for (let i = 0; i < n; i++) {
      const v = this.rv(speed * spread); v.y = Math.abs(v.y) + up * this.r(0.3, 1);
      if (dir) v.addScaledVector(dir, speed * this.r(0.4, 1.1));
      const c = Array.isArray(color) ? color[Math.floor(this.r(0, color.length))] : color;
      this.bricks.add({ pos: pos.clone().add(this.rv(0.1)), v, g: 9.8, drag: 0.4, life: life * this.r(0.7, 1.2), age: 0, size: size * this.r(0.6, 1.5), rx: this.r(0, 6), ry: this.r(0, 6), rz: this.r(0, 6), sx: this.r(-14, 14), sy: this.r(-14, 14), color: c, floor });
    }
  }
  starsBurst(pos, n, { speed = 5, size = 0.16, life = 0.9, colors = ['#ffe14a', '#fff', '#ff9a3a'] } = {}) {
    for (let i = 0; i < n; i++) {
      const v = this.rv(speed); v.y += 1.5;
      this.stars.add({ pos: pos.clone(), v, g: 6, drag: 1.2, life: life * this.r(0.7, 1.3), age: 0, size: size * this.r(0.6, 1.4), rx: 0, ry: this.r(0, 6), rz: this.r(0, 6), sx: 0, sy: this.r(-6, 6), color: colors[Math.floor(this.r(0, colors.length))] });
    }
  }
  puff(pos, n = 6, { size = 0.5, color = '#d8d8e8', life = 0.9, rise = 0.8, spread = 1.4, opacity = 0.7 } = {}) {
    for (let i = 0; i < n; i++) {
      const s = this.puffPool.find((q) => !q.visible); if (!s) return;
      const v = this.rv(spread); v.y = Math.abs(v.y) * 0.4 + rise * 0.5;
      this.puffs.push({ s, pos: pos.clone().add(this.rv(0.1)), v, age: 0, life: life * this.r(0.8, 1.3), size: size * this.r(0.7, 1.4), color, opacity }); s.visible = true; s.material.color.set(color);
    }
  }
  burstSprite(pos, size = 1.4, life = 0.28) {
    const s = this.burstPool.find((q) => !q.visible); if (!s) return;
    this.bursts.push({ s, pos: pos.clone(), age: 0, life, size, rot: this.r(-0.4, 0.4) }); s.visible = true;
  }
  ring(pos, { maxR = 2, life = 0.45, color = '#ffffff', mode = 'cam', normal = null, width = 1, opacity = 0.9 } = {}) {
    const m = this.ringPool.find((q) => !q.visible); if (!m) return;
    m.material.color.set(color); m.visible = true;
    this.rings.push({ m, pos: pos.clone(), age: 0, life, maxR, mode, normal, opacity });
  }
  dizzyStars(fighter, from, to, n = 5) { this.dizzy.push({ f: fighter, from, to, n, meshes: Array.from({ length: n }, () => { const m = new THREE.Mesh(this.sg, this.starMat); m.scale.setScalar(0.07); this.scene.add(m); return m; }) }); }
  confettiBurst(pos, n = 160) {
    const cols = ['#ff4d4d', '#ffd24a', '#4da6ff', '#7dff8a', '#ff9ad5', '#ffffff'];
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(this.r(-4, 4), this.r(5, 11), this.r(-4, 4));
      this.confetti.add({ pos: pos.clone().add(new THREE.Vector3(this.r(-1.5, 1.5), this.r(0, 1), this.r(-1.5, 1.5))), v, g: 3.4, drag: 1.6, life: this.r(2.5, 4), age: 0, size: 0.13, rx: this.r(0, 6), ry: this.r(0, 6), rz: this.r(0, 6), sx: this.r(-9, 9), sy: this.r(-9, 9), color: cols[i % cols.length] });
    }
  }
  formulaOrbit(center, from, to) { this.formulas.push({ center, from, to, sprites: this.formulaTex.map((t, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(1.1, 0.55, 1); this.scene.add(s); return s; }) }); }
  setAura(fighter, from, to, power = 1) { this.auraState = { f: fighter, from, to, power }; }
  flash(pos, t) { this.flashT = t; this.flashPos.copy(pos); }

  step(dt, t) {
    this.t = t;
    this.bricks.gScale = this.stars.gScale = this.confetti.gScale = this.gScale ?? 1;
    this.bricks.step(dt, t); this.stars.step(dt, t); this.confetti.step(dt, t);
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i]; p.age += dt; const u = p.age / p.life;
      if (u >= 1) { p.s.visible = false; this.puffs.splice(i, 1); continue; }
      p.v.multiplyScalar(Math.exp(-2.2 * dt)); p.pos.addScaledVector(p.v, dt);
      p.s.position.copy(p.pos); p.s.scale.setScalar(p.size * (0.5 + easeOutCubic(u) * 1.2)); p.s.material.opacity = p.opacity * (1 - u) * Math.min(1, u * 8);
    }
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i]; b.age += dt; const u = b.age / b.life;
      if (u >= 1) { b.s.visible = false; this.bursts.splice(i, 1); continue; }
      b.s.position.copy(b.pos); const s = b.size * (0.3 + 0.9 * easeOutCubic(Math.min(1, u * 2.2))) * (1 - 0.35 * Math.max(0, u - 0.5) * 2);
      b.s.scale.set(s, s, 1); b.s.material.rotation = b.rot; b.s.material.opacity = 1 - Math.max(0, u - 0.6) / 0.4;
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i]; r.age += dt; const u = r.age / r.life;
      if (u >= 1) { r.m.visible = false; this.rings.splice(i, 1); continue; }
      const e = easeOutCubic(u); r.m.position.copy(r.pos); r.m.scale.setScalar(Math.max(0.01, r.maxR * e)); r.m.material.opacity = r.opacity * (1 - u);
      if (r.mode === 'cam') r.m.quaternion.copy(this.camera.quaternion); else { r.m.rotation.set(-Math.PI / 2, 0, 0); r.m.quaternion.setFromEuler(r.m.rotation); }
    }
    // Dizzy
    for (const d of this.dizzy) {
      const on = t >= d.from && t <= d.to; const fade = clamp(Math.min((t - d.from) / 0.15, (d.to - t) / 0.2));
      const h = d.f.headWorld;
      d.meshes.forEach((m, i) => { m.visible = on; const a = t * 6 + (i / d.n) * Math.PI * 2; m.position.set(h.x + Math.cos(a) * 0.38, h.y + 0.42 + Math.sin(a * 2) * 0.03, h.z + Math.sin(a) * 0.38); m.rotation.y = a; m.rotation.z = t * 5; m.scale.setScalar(0.07 * fade); });
    }
    // Formeln
    for (const F of this.formulas) {
      const on = t >= F.from && t <= F.to; const f = clamp(Math.min((t - F.from) / 0.3, (F.to - t) / 0.15));
      const c = F.center();
      F.sprites.forEach((s, i) => { s.visible = on; const a = t * 3.2 + (i / F.sprites.length) * Math.PI * 2; const rr = 1.15 + 0.15 * Math.sin(t * 5 + i); s.position.set(c.x + Math.cos(a) * rr, c.y + 0.4 + ((i / F.sprites.length) * 1.6 - 0.2) + Math.sin(t * 4 + i) * 0.1, c.z + Math.sin(a) * rr); s.material.opacity = f; });
    }
    // Aura
    const A = this.auraState;
    if (A.f && t >= A.from && t <= A.to) {
      const f = clamp(Math.min((t - A.from) / 0.35, (A.to - t) / 0.25));
      const c = A.f.chestWorld; this.aura.visible = this.aura2.visible = true;
      const pulse = 1 + 0.06 * Math.sin(t * 28);
      this.aura.position.copy(c); this.aura2.position.copy(c); this.aura.scale.set(0.9, 1.4, 0.9).multiplyScalar(f * pulse * (0.7 + 0.3 * A.power)); this.aura2.scale.copy(this.aura.scale).multiplyScalar(1.03);
      this.aura.material.opacity = 0.09 * f; this.aura2.material.opacity = 0.03 * f; this.auraLight.position.copy(c); this.auraLight.intensity = 9 * f * A.power;
    } else { this.aura.visible = this.aura2.visible = false; this.auraLight.intensity = 0; }
    // Treffer-Lichtblitz
    const fu = (t - this.flashT) / 0.16; this.flashLight.position.copy(this.flashPos); this.flashLight.intensity = fu >= 0 && fu < 1 ? 28 * (1 - fu) : 0;
  }
}
