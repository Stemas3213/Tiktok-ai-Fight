// Schiedsrichter (Fighter-Unterklasse) und Kommentator (sitzend am Tisch).
import * as THREE from 'three';
import { Fighter } from './fighter.js';
import { buildHumanoid, LOOKS, DIM } from './humanoid.js';
import { solveLimb } from './ik.js';
import { clamp, smooth } from './util.js';

export class Referee extends Fighter {
  constructor(opts) {
    super('ref', 'referee', opts);
    this.blade = -0.15; this.bounceAmp = 0.5; this.defaultExpr = 'neutral';
    this.guard = { L: new THREE.Vector3(0.36, 0.42, 0.2), R: new THREE.Vector3(-0.36, 0.42, 0.2) };
    this.smoothTime = 0.35; this.stepScale = 0.9;
    this.lookAtFn = null;
  }
}

export class Commentator {
  constructor(deskPos) {
    this.rig = buildHumanoid(LOOKS.host());
    this.root = this.rig.root; this.root.position.set(deskPos.x, deskPos.y, deskPos.z); this.root.rotation.y = 0;
    this.speaking = () => false; this.excite = () => 0; this.lookAt = () => new THREE.Vector3(0, 1, 0);
    this.expr = 'neutral';
  }
  update(t) {
    const R = this.rig, sp = this.speaking(t), ex = this.excite(t);
    const seatY = 0.62;
    R.body.position.set(0, seatY + 0.02 * Math.sin(t * 3) + ex * 0.06 * Math.abs(Math.sin(t * 9)), 0);
    R.body.rotation.set(0, 0, 0);
    R.torso.rotation.set(0.12 + ex * 0.1 + (sp ? 0.03 * Math.sin(t * 7) : 0), 0.08 * Math.sin(t * 1.3), 0);
    // Kopf schaut zum Kampf
    this.root.updateMatrixWorld(true);
    const target = this.lookAt(t); const hp = R.head.getWorldPosition(new THREE.Vector3());
    const dx = target.x - hp.x, dz = target.z - hp.z, dy = target.y - hp.y;
    const yaw = Math.atan2(dx, dz) - this.root.rotation.y;
    R.head.rotation.order = 'YXZ'; R.head.rotation.set(-Math.atan2(dy, Math.hypot(dx, dz)) * 0.6 + (sp ? 0.05 * Math.sin(t * 9) : 0), clamp(yaw, -0.9, 0.9) * 0.85 + (sp ? 0.1 * Math.sin(t * 5) : 0), 0);
    // Mundbewegung
    let expr = sp ? (Math.sin(t * 16) > 0 ? 'shout' : 'neutral') : (ex > 0.6 ? 'shock' : 'smug');
    if (expr !== this.expr) { R.faceMat.map = R.faces[expr]; R.faceMat.needsUpdate = true; this.expr = expr; }
    // Beine sitzend (FK)
    for (const s of ['L', 'R']) {
      const Lg = R.legs[s];
      Lg.upper.position.set(0, 0, 0); Lg.upper.rotation.set(-1.45, 0, 0); Lg.lower.rotation.set(1.5, 0, 0);
      Lg.foot.position.set(Lg.side * 0.16, 0, 0.7); Lg.foot.rotation.set(0, 0, 0);
    }
    R.root.updateMatrixWorld(true);
    // Arme: Mikro / Gesten
    for (const s of ['L', 'R']) {
      const A = R.arms[s];
      let tgt;
      if (s === 'R') tgt = new THREE.Vector3(-0.15, 0.78 + (sp ? 0.05 * Math.sin(t * 6) : 0), 0.5);                // Hand am Kopfhoerer/Mikro
      else tgt = sp || ex > 0.3 ? new THREE.Vector3(0.45 + 0.1 * Math.sin(t * 5), 0.7 + 0.2 * Math.abs(Math.sin(t * 4.2)) + ex * 0.4, 0.45) : new THREE.Vector3(0.35, 0.25, 0.55);
      tgt.sub(A.anchor.position);
      solveLimb(A.upper, A.fore, new THREE.Vector3(), tgt, A.pole, DIM.L1a, DIM.L2a, 0);
    }
  }
}
