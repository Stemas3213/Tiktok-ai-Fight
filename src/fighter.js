// Fighter: Rig + Zustand (Federn, Fussplanting, IK). Alle Pose-Eingaben laufen ueber das Param-Objekt P.
import * as THREE from 'three';
import { buildHumanoid, DIM, LOOKS } from './humanoid.js';
import { solveLimb } from './ik.js';
import { Spring, clamp, lerp, wrapAngle, smooth } from './util.js';

const GUARD = { L: new THREE.Vector3(0.3, 0.8, 0.44), R: new THREE.Vector3(-0.3, 0.84, 0.36) };   // L = Fuehrhand (lokales +X)
const ANKLE_H = 0.12;
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion();
const _e = new THREE.Euler();

export function newPose() {
  return {
    off: new THREE.Vector3(),            // Koerper-Offset in Blickrichtungs-Koordinaten (x rechts, y hoch, z vor)
    hipsDrop: 0, bodyPitch: 0, bodyRoll: 0, bodyYaw: 0,
    torsoPitch: 0, torsoTwist: 0, torsoRoll: 0, headPitch: 0, headYaw: 0, headRoll: 0,
    hand: { L: { w: 0, pos: new THREE.Vector3(), roll: 0 }, R: { w: 0, pos: new THREE.Vector3(), roll: 0 } },
    world: { L: { w: 0, pos: new THREE.Vector3() }, R: { w: 0, pos: new THREE.Vector3() } },   // Welt-Ziele (Treffer)
    fk: null,                            // {L:{hip,knee},R:{hip,knee}} -> Beine ohne IK
    face: null, hipsY: null, stance: 1, bounce: 1, guardW: 1, hairPuff: 0, flash: 0, y: 0, yawOverride: null,
  };
}

export class Fighter {
  constructor(key, lookName, { pos = [0, 0], yaw = 0, bobPhase = 0 } = {}) {
    this.key = key;
    this.rig = buildHumanoid(LOOKS[lookName]());
    this.root = this.rig.root;
    this.pos = new THREE.Vector3(pos[0], 0, pos[1]);
    this.target = this.pos.clone();
    this.vel = new THREE.Vector3();
    this.yaw = yaw; this.bobPhase = bobPhase;
    this.opp = null;
    this.springs = {
      headPitch: new Spring(150, 11), headYaw: new Spring(150, 11), torsoPitch: new Spring(110, 9),
      torsoTwist: new Spring(120, 10), torsoRoll: new Spring(110, 9), drop: new Spring(180, 14), arms: new Spring(90, 7),
    };
    this.hurtUntil = -1; this.expr = 'neutral'; this.time = 0;
    this.feet = {
      L: { pos: new THREE.Vector3(), from: new THREE.Vector3(), to: new THREE.Vector3(), stepping: false, t: 0, dur: 0.2 },
      R: { pos: new THREE.Vector3(), from: new THREE.Vector3(), to: new THREE.Vector3(), stepping: false, t: 0, dur: 0.2 },
    };
    this.feetInit = false;
    this.actions = [];      // {fn(u, P, f), t0, dur}
    this.smoothTime = 0.22;
    this.airborne = false;
    this.P = newPose();
    this.hairBase = this.rig.hairNodes;
    this.gloveFlash = 0;
    this.stepScale = 1;
    this.blade = -0.42; this.guard = GUARD; this.bounceAmp = 1;
  }

  get headWorld() { const v = new THREE.Vector3(); this.rig.head.updateWorldMatrix(true, false); return this.rig.head.localToWorld(v.set(0, DIM.head * 0.5, 0)); }
  get chestWorld() { const v = new THREE.Vector3(); this.rig.torso.updateWorldMatrix(true, false); return this.rig.torso.localToWorld(v.set(0, 0.35, 0)); }
  get chinWorld() { const v = new THREE.Vector3(); this.rig.head.updateWorldMatrix(true, false); return this.rig.head.localToWorld(v.set(0, DIM.head * 0.15, 0.1)); }
  fwd() { return new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
  leftAxis() { return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)); }   // lokale +X (= linke Seite der Figur) in Welt
  toWorld(lx, lz, out = new THREE.Vector3()) { return out.set(this.pos.x + Math.cos(this.yaw) * lx + Math.sin(this.yaw) * lz, 0, this.pos.z - Math.sin(this.yaw) * lx + Math.cos(this.yaw) * lz); }

  /** Haupt-Update. dt = Sim-Zeit. */
  update(dt, t) {
    this.time = t;
    const P = this.P = newPose();
    // Aktionen sammeln
    for (const a of this.actions) {
      const u = t - a.t0;
      if (u >= 0 && u <= a.dur + 1e-6) a.fn(u, P, this, a);
    }
    this.actions = this.actions.filter((a) => t - a.t0 <= a.dur + 0.5);

    // Basisbewegung (kritisch gedaempft Richtung target)
    if (!this.airborne) {
      const st = this.smoothTime, w = 2 / st, x = w * dt, ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const ch = _v.subVectors(this.pos, this.target);
      const tmp = _w.copy(this.vel).addScaledVector(ch, w).multiplyScalar(dt);
      this.vel.addScaledVector(tmp, -w).multiplyScalar(ex);
      this.pos.copy(this.target).add(ch.add(tmp).multiplyScalar(ex));
    }
    // Blickrichtung
    if (this.opp && P.yawOverride === null) {
      const d = _v.subVectors(this.opp.pos, this.pos);
      const want = Math.atan2(d.x, d.z);
      const diff = wrapAngle(want - this.yaw);
      this.yaw += diff * (1 - Math.exp(-dt * 9));
    } else if (P.yawOverride !== null) this.yaw = P.yawOverride;

    for (const k in this.springs) this.springs[k].step(dt);
    this.applyPose(P, dt, t);
  }

  applyPose(P, dt, t) {
    const R = this.rig, S = this.springs;
    const bob = Math.sin((t * 2 * Math.PI * 1.55) + this.bobPhase) * 0.5 + 0.5;
    const bobY = 0.035 * (bob - 0.5) * 2 * P.bounce * this.bounceAmp;
    const standH = 0.99;
    R.root.position.set(this.pos.x, this.pos.y + P.y, this.pos.z);
    R.root.rotation.set(0, this.yaw, 0);

    const drop = P.hipsDrop + S.drop.x;
    R.body.rotation.order = 'YXZ';
    R.body.position.set(P.off.x, (P.hipsY !== null ? P.hipsY : standH + bobY - 0.03) + P.off.y - drop, P.off.z);
    R.body.rotation.set(P.bodyPitch, this.blade + P.bodyYaw, P.bodyRoll);
    R.torso.rotation.order = 'YXZ';
    const twist = P.torsoTwist + S.torsoTwist.x;
    R.torso.rotation.set(P.torsoPitch + S.torsoPitch.x + 0.05 * Math.sin(t * 2 * Math.PI * 1.55 + this.bobPhase), twist + 0.04 * Math.sin(t * 3.1 + this.bobPhase), P.torsoRoll + S.torsoRoll.x);
    R.neck.rotation.order = 'YXZ';
    // Kopf schaut zum Gegner: Gegenrotation zur Koerper-/Torso-Drehung
    const bladed = this.blade + P.bodyYaw + twist;
    R.head.rotation.order = 'YXZ';
    R.head.rotation.set(P.headPitch + S.headPitch.x + 0.05, P.headYaw + S.headYaw.x - bladed * 0.9, P.headRoll);
    R.head.position.y = 0.06;
    // Gesichtsausdruck
    let expr = P.face || this.defaultExpr || 'grit';
    if (t < this.hurtUntil && P.face !== 'dizzy') expr = 'hurt';
    if (expr !== this.expr) { R.faceMat.map = R.faces[expr]; R.faceMat.needsUpdate = true; this.expr = expr; }
    // Haar-Wackeln
    const hv = Math.abs(S.headPitch.v) * 0.04 + P.hairPuff;
    for (const g of this.hairBase) {
      if (!g.userData.base) continue;
      g.rotation.x = g.userData.base.x + Math.sin(t * 9 + g.userData.ph) * 0.04 + hv * Math.sin(g.userData.ph + t * 14) * 0.5 + P.hairPuff * g.userData.base.x * 0.8;
      g.rotation.z = g.userData.base.z + Math.cos(t * 8 + g.userData.ph) * 0.04 + hv * Math.cos(g.userData.ph + t * 12) * 0.5 + P.hairPuff * g.userData.base.z * 0.8;
      const sc = 1 + P.hairPuff * 0.9; g.scale.set(1, sc, 1);
    }
    // Flash (Treffer/Aura-Emissive)
    const fl = clamp(P.flash + this.gloveFlash);
    for (const m of [R.skinMat]) { m.emissive.setRGB(fl * 0.9, fl * 0.35, fl * 0.25); }
    R.root.updateMatrixWorld(true);

    // Beine
    if (P.fk) this.legsFK(P);
    else this.legsIK(P, dt);
    R.root.updateMatrixWorld(true);

    // Arme (IK)
    for (const side of ['L', 'R']) {
      const A = R.arms[side];
      const g = _v.copy(this.guard[side]);
      g.y += 0.02 * Math.sin(t * 2 * Math.PI * 1.55 + this.bobPhase + (side === 'L' ? 0 : 1.2));
      const flail = S.arms.x;
      const tgt = new THREE.Vector3().copy(g);
      const gw = P.guardW;
      if (gw < 1) tgt.lerpVectors(new THREE.Vector3(side === 'L' ? -0.35 : 0.35, 0.1, 0.15), g, gw);
      const h = P.hand[side];
      if (h.fn) h.fn(h.pos);
      if (h.w > 0) tgt.lerp(h.pos, h.w);
      const wd = P.world[side];
      if (wd.w > 0) { const l = R.torso.worldToLocal(_w.copy(wd.pos)); tgt.lerp(l, wd.w); }
      if (flail !== 0) { tgt.x += A.side * flail * 0.5; tgt.y += flail * 0.35; tgt.z -= flail * 0.4; }
      tgt.sub(A.anchor.position);
      solveLimb(A.upper, A.fore, new THREE.Vector3(), tgt, A.pole, DIM.L1a, DIM.L2a, h.roll * h.w + (A.side) * 0.2);
    }
  }

  legsFK(P) {
    for (const s of ['L', 'R']) {
      const Lg = this.rig.legs[s], f = P.fk[s];
      Lg.upper.position.set(0, 0, 0);
      Lg.upper.quaternion.setFromEuler(_e.set(f.hip, 0, f.splay || 0));
      Lg.lower.quaternion.setFromEuler(_e.set(f.knee, 0, 0));
      Lg.foot.updateWorldMatrix(true, false);
      // Fuss an Knoechel setzen
      Lg.lower.updateWorldMatrix(true, false);
      const ank = Lg.lower.localToWorld(new THREE.Vector3(0, -DIM.L2l, 0));
      this.rig.root.worldToLocal(ank);
      Lg.foot.position.copy(ank).add(new THREE.Vector3(0, -ANKLE_H, 0));
      Lg.foot.quaternion.setFromEuler(_e.set(f.hip * -0.4 + f.knee * 0.3 + (f.toe || 0), 0, 0));
      this.feetInit = false;
    }
  }

  legsIK(P, dt) {
    const R = this.rig;
    if (!this.feetInit) {
      for (const s of ['L', 'R']) { this.feetDesired(s, P, this.feet[s].pos); this.feet[s].pos.y = 0; this.feet[s].stepping = false; }
      this.feetInit = true;
    }
    const other = { L: 'R', R: 'L' };
    for (const s of ['L', 'R']) {
      const F = this.feet[s];
      const want = this.feetDesired(s, P, new THREE.Vector3());
      if (F.stepping) {
        F.t += dt / F.dur;
        const u = clamp(F.t);
        F.pos.lerpVectors(F.from, F.to, smooth(u)); F.pos.y = Math.sin(Math.PI * u) * 0.16;
        if (F.t >= 1) { F.stepping = false; F.pos.copy(F.to); F.pos.y = 0; }
      } else {
        const d = Math.hypot(want.x - F.pos.x, want.z - F.pos.z);
        const thr = 0.26 * this.stepScale;
        if (d > thr && !this.feet[other[s]].stepping) {
          F.stepping = true; F.t = 0; F.from.copy(F.pos); F.to.copy(want);
          F.to.addScaledVector(this.vel, 0.12);
          F.dur = clamp(0.13 + d * 0.12, 0.13, 0.26);
        }
      }
    }
    for (const s of ['L', 'R']) {
      const F = this.feet[s], Lg = R.legs[s];
      // Weltposition -> Root-lokal -> Body-lokal
      const ankW = _v.copy(F.pos); ankW.y += ANKLE_H;
      const local = R.body.worldToLocal(ankW.clone()).sub(Lg.anchor.position);
      solveLimb(Lg.upper, Lg.lower, new THREE.Vector3(), local, Lg.pole, DIM.L1l, DIM.L2l, 0);
      // Fuss ausrichten (Welt-Yaw = Root-Yaw)
      Lg.foot.position.copy(R.root.worldToLocal(new THREE.Vector3(F.pos.x, F.pos.y, F.pos.z)));
      const lift = F.stepping ? Math.sin(Math.PI * clamp(F.t)) : 0;
      Lg.foot.quaternion.setFromEuler(_e.set(lift * 0.35, (s === 'L' ? -1 : 1) * 0.12, 0));
    }
  }

  feetDesired(s, P, out) {
    const stance = P.stance;
    const lead = s === 'L';
    // Linker Fuss vorn, rechter hinten (Rechtsauslage) - Positionen relativ zur Basis
    const along = lead ? 0.32 : -0.30, side = lead ? 0.17 : -0.2;
    this.toWorld(side * (1 + (stance - 1) * 1.3), along * stance, out);
    return out;
  }

  /** Treffer-Impuls. dir = Welt-Richtung, in die der Schlag den Getroffenen drueckt; amount 0..2 */
  hit(dir, amount = 1, kind = 'head', t = this.time) {
    const S = this.springs;
    const front = dir.dot(this.fwd()) < 0 ? 1 : -1;       // Schlag kam von vorn?
    const lat = dir.dot(this.leftAxis());
    if (kind === 'head') {
      S.headPitch.kick(-9 * amount * front);
      S.headYaw.kick(lat * 10 * amount);
      S.torsoPitch.kick(-3.2 * amount * front);
      S.torsoTwist.kick(lat * 4 * amount);
    } else {
      S.torsoPitch.kick(6 * amount * front);              // zusammenklappen
      S.headPitch.kick(4 * amount * front);
      S.drop.kick(-1.6 * amount);
    }
    S.torsoRoll.kick(lat * 3 * amount);
    S.arms.kick(-12 * amount);
    this.hurtUntil = t + 0.45 + 0.2 * amount;
    this.target.addScaledVector(dir, 0.22 * amount);
    this.pos.addScaledVector(dir, 0.1 * amount);
    this.vel.addScaledVector(dir, 1.8 * amount);
  }
}
