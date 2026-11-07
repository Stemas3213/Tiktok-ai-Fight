// Aktions-Bibliothek: jede Aktion ist {dur, fn(u, P, f)}; fn setzt Pose-Parameter fuer die Fighter-Pose.
import * as THREE from 'three';
import { clamp, lerp, smooth, easeOutCubic, easeInQuad, bell, seg } from './util.js';

const _a = new THREE.Vector3(), _b = new THREE.Vector3();
const lerpV = (a, b, t, out) => out.set(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));

function ext(u, tA, tS, tH, tR, back = 0.35) {
  if (u < tA) return -back * smooth(u / tA);
  if (u < tA + tS) return lerp(-back, 1, easeOutCubic((u - tA) / tS));
  if (u < tA + tS + tH) return 1;
  return 1 - smooth((u - tA - tS - tH) / tR);
}

/** Richtung vom Angreifer zum Gegner (horizontal) */
function toward(f, out = new THREE.Vector3()) { out.subVectors(f.opp.pos, f.pos); out.y = 0; return out.normalize(); }

/**
 * Schlag. kind: 'jab' | 'cross' | 'hook' | 'upper'. hit=false -> verfehlt (vorbei am Kopf).
 * Gibt {dur, tHit, fn} zurueck.
 */
export function strike(o = {}) {
  o = { hand: 'L', kind: 'jab', tA: 0.1, tS: 0.08, tH: 0.05, tR: 0.22, back: 0.35, hit: true, lunge: 0.24, twist: 0.55, aim: 'head', face: null, ...o };
  const side = o.hand === 'L' ? 1 : -1;
  const dur = o.tA + o.tS + o.tH + o.tR;
  return {
    dur, tHit: o.tA + o.tS,
    fn(u, P, f) {
      const e = ext(u, o.tA, o.tS, o.tH, o.tR, o.back), ep = Math.max(e, 0);
      const h = P.hand[o.hand]; h.w = 1; h.roll = side * 1.1 * ep;
      h.fn = (out) => {
        const opp = f.opp, fa = toward(f, _a), l = f.leftAxis();
        const head = o.aim === 'body' ? opp.chestWorld : opp.headWorld;
        const guard = f.guard[o.hand];
        let world;
        if (o.kind === 'hook') {
          const k = clamp((e + o.back) / (1 + o.back));
          const th = lerp(-0.7, o.hit ? 0.95 : 1.55, k), r = 0.42;
          world = _b.copy(head).addScaledVector(l, side * r * Math.cos(th)).addScaledVector(fa, -r * Math.sin(th));
          world.y -= 0.04;
        } else if (o.kind === 'upper') {
          const chin = opp.chinWorld; const k = clamp((e + o.back) / (1 + o.back));
          const start = _b.copy(chin).addScaledVector(fa, -0.22).addScaledVector(l, side * 0.1); start.y -= 0.75;
          const end = _a.copy(chin).addScaledVector(fa, -0.3).addScaledVector(l, o.hit ? 0 : side * 0.5); end.y += o.hit ? 0.1 : 0.35;
          world = lerpV(start, end, easeOutCubic(k), new THREE.Vector3()); world.y += Math.sin(k * Math.PI) * 0.1;
        } else {
          world = _b.copy(head).addScaledVector(fa, o.hit ? -0.36 : -0.26);
          if (!o.hit) world.addScaledVector(l, -side * 0.42).add(_a.set(0, 0.06, 0));
        }
        const tl = f.rig.torso.worldToLocal(world.clone());
        if (e < 0) out.copy(guard).add(_a.set(0, 0.02 * e, e * 0.28)); else lerpV(guard, tl, e, out);
      };
      const tw = (o.hand === 'L' ? -1 : 1) * o.twist;
      P.torsoTwist += tw * (e >= 0 ? ep : e * 0.45);
      P.bodyYaw += (o.hand === 'L' ? -1 : 1) * 0.12 * ep;
      P.off.z += o.lunge * ep; P.torsoPitch += (o.kind === 'upper' ? -0.18 : 0.14) * ep;
      if (o.kind === 'upper') { P.hipsDrop += 0.3 * (u < o.tA ? smooth(u / o.tA) : 1 - smooth((u - o.tA) / o.tS)); }
      if (o.kind === 'hook') { P.hipsDrop += 0.05 * ep; P.torsoRoll += side * 0.12 * ep; }
      if (e > 0.25 && o.face !== false) P.face = o.face || 'shout';
    },
  };
}

export function slip(sign = 1, dur = 0.5, amt = 0.34) {   // sign +1: nach links (lokales +X)
  return { dur, fn(u, P) { const b = bell(u, 0, dur * 0.4, dur); P.off.x += sign * amt * b; P.torsoRoll += -sign * 0.32 * b; P.headRoll += sign * 0.1 * b; P.hipsDrop += 0.1 * b; P.torsoPitch += 0.1 * b; P.face = 'shock'; } };
}
export function duck(dur = 0.5, amt = 0.32) { return { dur, fn(u, P) { const b = bell(u, 0, dur * 0.35, dur); P.hipsDrop += amt * b; P.torsoPitch += 0.28 * b; } }; }
export function block(dur = 0.6) {
  return { dur, fn(u, P, f) { const b = bell(u, 0, 0.12, dur) ; for (const s of ['L', 'R']) { const h = P.hand[s]; h.w = b; h.pos.set(s === 'L' ? 0.2 : -0.2, 0.92, 0.36); } P.torsoPitch += 0.18 * b; P.hipsDrop += 0.08 * b; } };
}
export function lookUp(dur = 0.8, amt = 0.55) { return { dur, fn(u, P) { const b = bell(u, 0, 0.25, dur); P.headPitch += -amt * b; P.face = 'shock'; P.guardW = 1 - 0.7 * b; } }; }
export function dazed(dur = 1.0) {
  return { dur, fn(u, P, f) {
    const b = bell(u, 0, 0.12, dur); const w = Math.sin(u * 9);
    P.hipsDrop += 0.14 * b + 0.04 * Math.abs(w) * b; P.torsoRoll += 0.2 * w * b; P.headRoll += 0.25 * Math.sin(u * 7 + 1) * b; P.torsoPitch += 0.12 * b; P.off.x += 0.12 * w * b;
    P.face = 'dizzy'; P.guardW = 1 - 0.85 * b; P.bounce = 0;
  } };
}
export function laugh(dur = 1.0) {
  return { dur, fn(u, P, f) {
    const b = bell(u, 0, 0.1, dur); const s = Math.sin(u * 22);
    P.torsoPitch += (-0.2 + 0.08 * s) * b; P.headPitch += -0.25 * b; P.hipsDrop += 0.03 * Math.abs(s) * b;
    for (const sd of ['L', 'R']) { const h = P.hand[sd]; h.w = b; h.pos.set(sd === 'L' ? 0.5 : -0.5, 0.38, 0.1); }
    P.face = 'happy'; P.guardW = 1;
  } };
}
export function callApple(dur = 1.4) {
  return { dur, fn(u, P, f) {
    const b = bell(u, 0, 0.35, dur - 0.2); const pt = easeOutCubic(seg(u, 0.05, 0.4));
    const h = P.hand.R; h.w = pt * b; h.pos.set(-0.12, 1.32 + 0.03 * Math.sin(u * 14), 0.12); h.roll = 0;
    const hl = P.hand.L; hl.w = b; hl.pos.set(0.45, 0.38, 0.08);
    P.torsoPitch += -0.15 * b; P.torsoTwist += 0.35 * b; P.headPitch += -0.3 * b; P.face = u < 0.4 ? 'smug' : 'shout'; P.hipsDrop += 0.06 * Math.sin(u * 12) * b;
  } };
}
export function charge(dur = 1.0) {
  return { dur, fn(u, P, f) {
    const b = smooth(u / (dur * 0.45)); const fade = 1 - smooth(seg(u, dur * 0.85, dur));
    const sh = Math.sin(u * 70) * 0.012 * b;
    P.hipsDrop += 0.3 * b * fade; P.torsoPitch += 0.2 * b * fade; P.off.x += sh; P.off.z += sh * 0.5;
    for (const sd of ['L', 'R']) { const h = P.hand[sd]; h.w = b * fade; h.pos.set(sd === 'L' ? 0.3 : -0.3, 0.32, 0.12); }
    P.hairPuff = Math.max(P.hairPuff, b * 1.0); P.flash = Math.max(P.flash, 0.35 * b + 0.15 * Math.sin(u * 40) * b); P.face = 'shout'; P.stance = 1.35; P.bounce = 0;
  } };
}
export function victory(dur = 2.0) {
  return { dur, fn(u, P, f) {
    const b = smooth(u / 0.25); const j = Math.abs(Math.sin(u * 6)) * 0.12 * b;
    P.y += j;
    for (const sd of ['L', 'R']) { const h = P.hand[sd]; h.w = b; h.pos.set(sd === 'L' ? 0.35 : -0.35, 1.28 + 0.06 * Math.sin(u * 12 + (sd === 'L' ? 0 : 1)), 0.08); }
    P.torsoPitch += -0.18 * b; P.headPitch += -0.2 * b; P.face = 'shout'; P.hairPuff = Math.max(P.hairPuff, 0.5 * b); P.guardW = 1; P.hipsDrop -= 0.02 * b;
  } };
}
export function warmup(dur = 1.0, phase = 0) {
  return { dur, fn(u, P) {
    const s = Math.sin(u * 8 + phase), s2 = Math.sin(u * 8 + phase + 2.4);
    P.hand.L.w = 1; P.hand.L.pos.set(0.3, 0.8, 0.44 + 0.2 * Math.max(0, s));
    P.hand.R.w = 1; P.hand.R.pos.set(-0.3, 0.84, 0.36 + 0.2 * Math.max(0, s2));
    P.torsoTwist += -0.12 * Math.max(0, s) + 0.14 * Math.max(0, s2); P.face = 'grit';
  } };
}
export function taunt(dur = 0.8) {   // Newton: "komm her"
  return { dur, fn(u, P) { const b = bell(u, 0, 0.15, dur); const h = P.hand.L; h.w = b; h.pos.set(0.3, 0.85 + 0.05 * Math.sin(u * 16), 0.55 + 0.1 * Math.sin(u * 16)); P.face = 'smug'; P.torsoPitch += -0.1 * b; } };
}
export function stare(dur = 1.0) { return { dur, fn(u, P) { P.face = 'shock'; P.guardW = 0.55; P.headPitch += -0.1; } }; }

/** Flug (Ballistik) + Landen + K.O.-Pose. params: {from:[x,z], v:[vx,vz,vy], g} */
export function flight(t0, p) {
  const g = p.g || 9.8, Tf = 2 * p.v[2] / g, spins = p.spins ?? 1;
  const pitchEnd = -(Math.PI / 2 + spins * 2 * Math.PI);
  const total = Tf + 3.5;
  return {
    dur: total, Tf,
    fn(u, P, f) {
      f.airborne = true;
      if (u < Tf) {
        const y = p.v[2] * u - 0.5 * g * u * u;
        f.pos.x = p.from[0] + p.v[0] * u; f.pos.z = p.from[1] + p.v[1] * u; f.pos.y = 0; f.target.copy(f.pos);
        P.y = Math.max(0, y);
        const k = smooth(u / Tf);
        P.bodyPitch = pitchEnd * k; P.bodyRoll = 0.25 * Math.sin(u * 5);
        P.hipsY = 0.99; P.face = 'hurt';
        const sw = Math.sin(u * 11);
        P.fk = { L: { hip: -0.9 + 0.5 * sw, knee: 1.0 }, R: { hip: -0.2 - 0.5 * sw, knee: 0.5 + 0.4 * Math.cos(u * 9) } };
        for (const s of ['L', 'R']) { const h = P.hand[s], sd = s === 'L' ? 1 : -1; h.w = 1; h.pos.set(sd * (0.7 + 0.25 * Math.sin(u * 9 + sd)), 0.75 + 0.35 * Math.cos(u * 7 + sd), -0.1 + 0.25 * Math.sin(u * 6)); }
        P.headPitch += -0.4;
      } else {
        const w = u - Tf;
        // Aufprall: federn
        const bounce = Math.exp(-w * 5) * Math.abs(Math.sin(w * 9)) * 0.22;
        P.y = bounce; P.bodyPitch = pitchEnd; P.hipsY = lerp(0.62, 0.2, smooth(w / 0.12));
        P.face = w < 1.4 ? 'dizzy' : 'hurt';
        const tw = Math.sin(w * 4) * Math.exp(-w * 0.8);
        P.fk = { L: { hip: 0.12 + 0.1 * tw, knee: 0.08, splay: 0.12, toe: 0.1 }, R: { hip: -0.05 - 0.1 * tw, knee: 0.15, splay: -0.12, toe: 0.1 } };
        for (const s of ['L', 'R']) { const h = P.hand[s], sd = s === 'L' ? 1 : -1; h.w = 1; h.pos.set(sd * (0.78 + 0.08 * Math.sin(w * 3)), 0.12 + 0.12 * Math.sin(w * 2 + sd), -0.12); }
        P.headPitch += 0.25; P.torsoPitch += 0; P.bounce = 0;
        P.lyingKick = tw;
      }
    },
  };
}
