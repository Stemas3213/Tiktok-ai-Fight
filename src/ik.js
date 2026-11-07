// Zwei-Knochen-IK (Arme & Beine) fuer die Blockfiguren.
import * as THREE from 'three';
import { clamp } from './util.js';

const _d = new THREE.Vector3(), _perp = new THREE.Vector3(), _E = new THREE.Vector3();
const _m = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
const AXY = new THREE.Vector3(0, 1, 0);

/** Quaternion, bei dem die lokale -Y-Achse entlang dir zeigt und lokale +Z grob zu hint. */
function qLimb(dir, hint, roll, out) {
  _y.copy(dir).multiplyScalar(-1);
  _z.copy(hint).addScaledVector(_y, -hint.dot(_y));
  if (_z.lengthSq() < 1e-8) _z.set(0, 0, 1).addScaledVector(_y, -_y.z);
  if (_z.lengthSq() < 1e-8) _z.set(1, 0, 0);
  _z.normalize();
  _x.crossVectors(_y, _z).normalize();
  _m.makeBasis(_x, _y, _z);
  out.setFromRotationMatrix(_m);
  if (roll) out.multiply(_qb.setFromAxisAngle(AXY, roll));
  return out;
}

/**
 * Loest Schulter->Ziel im Eltern-Raum. upper/lower sind Object3D (Kinder von parent bzw. upper).
 * S: Gelenk-Anker (Eltern-Raum), T: Ziel (Eltern-Raum), pole: Richtung in die das Knie/der Ellbogen zeigt.
 * Gibt die tatsaechliche Hand-/Knoechelposition (Eltern-Raum) zurueck.
 */
export function solveLimb(upper, lower, S, T, pole, L1, L2, roll = 0, out = new THREE.Vector3()) {
  _d.subVectors(T, S);
  const len = _d.length() || 1e-6;
  const dist = clamp(len, Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-4);
  _d.multiplyScalar(1 / len);
  const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
  const a = Math.acos(cosA);
  _perp.copy(pole).addScaledVector(_d, -pole.dot(_d));
  if (_perp.lengthSq() < 1e-8) _perp.set(0, 0, 1).addScaledVector(_d, -_d.z);
  _perp.normalize();
  _E.copy(S).addScaledVector(_d, L1 * Math.cos(a)).addScaledVector(_perp, L1 * Math.sin(a));
  out.copy(S).addScaledVector(_d, dist);

  const dirU = _y.subVectors(_E, S).normalize().clone();
  const hint = _perp.clone();
  const qU = new THREE.Quaternion();
  qLimb(dirU, hint, roll * 0.5, qU);
  upper.position.copy(S);
  upper.quaternion.copy(qU);

  const dirF = new THREE.Vector3().subVectors(out, _E).normalize();
  const qF = new THREE.Quaternion();
  qLimb(dirF, hint, roll, qF);
  lower.quaternion.copy(qU).invert().multiply(qF);
  return out;
}
