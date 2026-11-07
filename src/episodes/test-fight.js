// Episode "test-fight": der urspruengliche 14,7-s-Testkampf (Regressionstest der Engine).
import { strike, slip, duck, block, lookUp, dazed, laugh, callApple, charge, victory, warmup, taunt, stare, flight } from '../moves.js';
import { clamp, lerp, smooth, easeOutCubic, bell, seg } from '../util.js';

export async function build(ctx) {
  const { nh, eh, midP, lv, sm, frame, THREE, V3, N, E, ref, fx, overlay, arena, S, st, at, act, sfx, slow, impact, shake, excite, hitstop, setHp, hp, project, horiz, apple, appleVel, APPLE, W, H } = ctx;
  let appleHeadY = 2.1, appleX = 0, appleZ = 0, appleDone = false;
  const T = { bell: 0.9, jabMiss: 1.95, counter: 2.45, cross: 2.78, hook: 3.9, call: 4.9, lookUp: 5.5, charge: 7.2, dash: 8.0, upper: 8.2, land: 0, end: 11.9 };
  APPLE.spawn = 5.15; APPLE.hit = 6.2; APPLE.y0 = 8.6;
  slow(2.95, 3.25, 0.35, 0.05); slow(7.5, 8.1, 0.65, 0.12); slow(8.38, 8.8, 0.4, 0.04);
  // ===================== CHOREOGRAFIE =====================
  // Intro: Aufwaermen, Glocke, Schiedsrichter
  act(N, 0.2, warmup(0.9, 0)); act(E, 0.25, warmup(0.9, 1.9));
  act(ref, T.bell + 0.1, {
    dur: 0.55, fn(u, P) { const b = smooth(u / 0.2) * (1 - smooth(seg(u, 0.35, 0.55))); const h = P.hand.R; h.w = b; h.pos.set(-0.25 + 0.3 * smooth(u / 0.25), 1.0 - 0.55 * smooth(u / 0.25), 0.35 + 0.2 * smooth(u / 0.25)); P.face = 'shout'; P.torsoPitch += 0.1 * b; },
  });
  at(T.bell, () => { sfx('bell', 1); arena.bell.userData.ring = st.simT; excite(0.35); overlay.flash(0.25); });
  at(T.bell + 0.1, () => { sfx('crowd', 0.8); });
  at(1.0, () => { N.target.set(-1.0, 0, 0); E.target.set(1.0, 0, 0); N.smoothTime = 0.45; E.smoothTime = 0.45; });
  at(1.95, () => { N.smoothTime = 0.22; E.smoothTime = 0.22; });

  // Newton Jab (verfehlt), Einstein weicht aus
  const jab1 = strike({ hand: 'L', kind: 'jab', hit: false }); act(N, T.jabMiss, jab1);
  act(E, T.jabMiss + 0.02, slip(1, 0.55, 0.38));
  at(T.jabMiss + 0.05, () => sfx('whoosh', 0.7));
  at(T.jabMiss + jab1.tHit, () => { fx.puff(N.chestWorld.add(V3(0, 0.4, 0)).addScaledVector(N.fwd(), 0.9), 2, { size: 0.3, color: '#fff', life: 0.4 }); });
  at(2.15, () => { N.target.set(-1.1, 0, 0); });

  // Einstein Konter: Jab + Kreuz
  const jab2 = strike({ hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 }); act(E, T.counter, jab2);
  at(T.counter + 0.04, () => sfx('whoosh', 0.7));
  impact({ t: T.counter + jab2.tHit, from: E, to: N, power: 0.8, label: 'PAFF!', dmg: 6, who: 'N', size: 140 });
  const cross = strike({ hand: 'R', kind: 'cross', hit: true, tA: 0.12, tS: 0.09, lunge: 0.32, twist: 0.8 }); act(E, T.cross, cross);
  at(T.cross + 0.04, () => sfx('whoosh', 0.9));
  impact({ t: T.cross + cross.tHit, from: E, to: N, power: 1.5, label: 'BUMM!', fill: '#ff7a3a', dmg: 11, who: 'N', size: 180 });
  at(T.cross + cross.tHit, () => { N.target.set(-1.7, 0, 0); N.smoothTime = 0.5; arena.wobbleSide(2, 0.03, st.outT); });
  at(3.8, () => { N.smoothTime = 0.22; N.target.set(-1.2, 0, 0); E.target.set(0.9, 0, 0); });

  // Newton Haken trifft
  const hook = strike({ hand: 'R', kind: 'hook', hit: true, tA: 0.17, tS: 0.12, lunge: 0.3, twist: 0.95, back: 0.3 }); act(N, T.hook, hook);
  at(T.hook + 0.12, () => sfx('whoosh', 0.9));
  act(E, T.hook + 0.02, { dur: 0.3, fn(u, P) { P.face = 'shock'; } });
  impact({ t: T.hook + hook.tHit, from: N, to: E, power: 1.3, label: 'KLATSCH!', fill: '#ff4d6d', dmg: 18, who: 'E', size: 170 });
  at(T.hook + hook.tHit, () => { E.target.set(1.5, 0, 0); E.smoothTime = 0.45; });
  at(4.7, () => { E.smoothTime = 0.25; E.target.set(1.15, 0, 0); N.target.set(-2.0, 0, 0); N.smoothTime = 0.4; });

  // Newton ruft den Apfel
  act(N, T.call, callApple(1.45));
  at(T.call + 0.1, () => { sfx('hum', 0.8); excite(0.1); });
  at(APPLE.spawn, () => { apple.visible = true; sfx('swoosh', 0.7); });
  act(E, T.lookUp, lookUp(0.95, 0.6));
  at(APPLE.hit, () => {
    apple.visible = false; appleDone = true;
    const hd = E.headWorld;
    E.springs.drop.kick(-5.5); E.springs.torsoPitch.kick(6); E.springs.headPitch.kick(9); E.springs.arms.kick(-10);
    E.hurtUntil = APPLE.hit + 0.9;
    fx.burstSprite(hd.clone().add(V3(0, 0.3, 0.1)), 1.8, 0.3);
    fx.starsBurst(hd.clone().add(V3(0, 0.3, 0)), 14, { speed: 4.5, size: 0.2 });
    fx.bricksBurst(hd.clone().add(V3(0, 0.3, 0)), 26, { color: ['#e0141e', '#ff6a5a', '#fff2e0', '#35b24a'], speed: 4.5, size: 0.1, up: 2.5, spread: 1.2 });
    fx.puff(hd, 5, { size: 0.5, color: '#fff', life: 0.6 }); fx.ring(hd, { maxR: 2.0, life: 0.45, color: '#ffd24a' }); fx.flash(hd, APPLE.hit);
    shake(0.14); st.fovPunch = 8; hitstop(0.09);
    const sp = project(hd); overlay.pop('BONK!', { x: clamp(sp.x, 200, 880), y: clamp(sp.y - 150, 380, 1400) }, { size: 210, fill: '#ff4d4d', rot: -9, life: 0.9 });
    overlay.flash(0.45); overlay.speedLines(0.55); sfx('bonk', 1.1); excite(0.5); setHp('E', Math.max(0, hp.E - 24));
    // abprallender Apfel
    apple.visible = true; appleVel.set(1.8, 3.2, 1.4); appleDone = false; apple.userData.bounce = true; apple.userData.t0 = APPLE.hit;
    appleX = hd.x; appleHeadY = hd.y + 0.28; appleZ = hd.z; apple.position.set(appleX, appleHeadY, appleZ);
  });
  act(E, APPLE.hit + 0.02, dazed(1.0));
  fx.dizzyStars(E, APPLE.hit + 0.1, APPLE.hit + 1.15);
  act(N, APPLE.hit + 0.05, laugh(1.0));
  at(APPLE.hit + 0.2, () => { sfx('laugh', 0.0); });

  // Einstein: E=mc^2 Aufladung -> Uppercut
  act(E, T.charge, charge(0.95));
  act(N, T.charge + 0.15, stare(1.0));
  at(T.charge, () => { sfx('charge', 1); N.target.set(-1.3, 0, 0); N.smoothTime = 0.8; excite(0.3); });
  fx.setAura(E, T.charge, T.charge + 1.55, 1);
  fx.formulaOrbit(() => E.chestWorld, T.charge + 0.1, T.charge + 1.4);
  at(T.dash, () => { E.target.set(-0.05, 0, 0); E.smoothTime = 0.11; sfx('whoosh', 1); fx.puff(E.pos.clone().add(V3(0, 0.15, 0)), 5, { size: 0.5, color: '#ffe9a8', life: 0.5 }); });
  const upper = strike({ hand: 'R', kind: 'upper', hit: true, tA: 0.2, tS: 0.1, tH: 0.18, tR: 0.5, lunge: 0.35, twist: 0.5, back: 0.2 });
  act(E, T.upper, upper);
  const VY = 6.6;
  const tUp = T.upper + upper.tHit;
  at(tUp, () => {
    // Treffer
    const dir = horiz(E.pos, N.pos); N.hit(dir, 1.6, 'head', tUp);
    const p = N.headWorld;
    fx.burstSprite(p, 2.6, 0.34); fx.starsBurst(p, 26, { speed: 7, size: 0.24 });
    fx.bricksBurst(p, 40, { color: ['#ffd24a', '#fff', '#ffa31a'], speed: 6.5, size: 0.11, up: 3 });
    fx.ring(p, { maxR: 3.2, life: 0.55, color: '#ffe066' }); fx.ring(p, { maxR: 2.2, life: 0.4, color: '#ffffff' });
    fx.ring(N.pos.clone().add(V3(0, 0.05, 0)), { mode: 'ground', maxR: 3.4, life: 0.7, color: '#ffd24a' });
    fx.flash(p, tUp); fx.puff(p, 8, { size: 0.7, color: '#fff7d0', life: 0.8 });
    shake(0.3); st.fovPunch = 12; hitstop(0.14);
    const sp = project(p); overlay.pop('E = mc²!!', { x: 540, y: clamp(sp.y - 280, 420, 1100) }, { size: 250, fill: '#ffe14a', rot: -7, life: 1.15, stroke: 12 });
    overlay.flash(0.9); overlay.speedLines(0.95); sfx('boom', 1.3); excite(0.9); setHp('N', 0);
    arena.wobbleSide(2, 0.12, st.outT); arena.wobbleSide(0, 0.04, st.outT); arena.wobbleSide(1, 0.04, st.outT);
    // Newton fliegt
    act(N, tUp, flight(tUp, { from: [N.pos.x, N.pos.z], v: [-0.55, 0, VY], spins: 1 }));
    st.landT = tUp + 2 * VY / 9.8;
  });
  // Landung (Zeitpunkt aus Flug berechnet: 8.2+0.3+1.51)
  const landT = (T.upper + upper.tHit) + 2 * VY / 9.8; T.land = landT;
  at(landT, () => {
    const p = N.pos.clone(); p.y = 0.2;
    fx.puff(p, 12, { size: 0.9, color: '#cfd3ff', life: 1.1, spread: 2.8, rise: 0.6 });
    fx.ring(N.pos.clone().add(V3(0, 0.05, 0)), { mode: 'ground', maxR: 2.6, life: 0.7, color: '#ffffff' });
    fx.bricksBurst(p, 16, { color: ['#fff', '#cfd3ff'], speed: 3.2, size: 0.08, up: 2 });
    fx.starsBurst(N.headWorld, 8, { speed: 3, size: 0.14 });
    arena.wobbleSide(2, 0.22, st.outT); shake(0.2); hitstop(0.06); sfx('thud', 1.2); excite(0.5); overlay.flash(0.25);
    const sp = project(p); overlay.pop('WUMMS!', { x: clamp(sp.x, 220, 860), y: clamp(sp.y - 140, 420, 1300) }, { size: 170, fill: '#cfd3ff', rot: 7, life: 0.8 });
  });
  fx.dizzyStars(N, landT + 0.2, landT + 2.4);

  // Schiedsrichter-Zaehlung + K.O.
  const countStart = landT + 0.3;
  at(landT + 0.1, () => { ref.target.set(-0.7, 0, -0.95); ref.smoothTime = 0.3; });
  act(ref, countStart, {
    dur: 1.4, fn(u, P) { const h = P.hand.R; h.w = 1; const beat = (u / 0.4) % 1; h.pos.set(-0.28, 0.55 + 0.55 * Math.sin(Math.PI * Math.min(1, beat * 1.2)), 0.35); P.torsoPitch += 0.15; P.face = 'shout'; },
  });
  ['1', '2', '3'].forEach((n, i) => at(countStart + 0.2 + i * 0.4, () => {
    const sp = project(N.pos.clone().add(V3(0, 1.2, 0))); overlay.pop(n, { x: clamp(sp.x, 200, 880), y: clamp(sp.y - 120, 420, 1300) }, { size: 190, fill: i === 2 ? '#ff4d4d' : '#ffffff', rot: i * 5 - 5, life: 0.5 }); sfx('count', 0.6); }));
  const koT = countStart + 0.2 + 2 * 0.4 + 0.3; T.ko = koT; T.end = koT + 0.85;
  at(koT, () => {
    sfx('bell', 1); arena.bell.userData.ring = st.simT; sfx('bellKO', 1);
    overlay.pop('K.O.!', { x: 540, y: 620 }, { size: 360, fill: '#ff3b2f', rot: -6, life: 1.1, stroke: 16 }); overlay.flash(0.5); overlay.speedLines(0.6); shake(0.08); excite(1.0);
    fx.confettiBurst(V3(0.3, 3.2, 0), 220); sfx('cheer', 1.1);
  });
  act(E, landT + 0.5, victory(2.4));
  at(landT + 0.4, () => { E.target.set(0.0, 0, 0.4); E.smoothTime = 0.7; E.opp = ref; });
  at(T.end - 0.4, () => {});

  // ===================== KAMERA =====================
  const ots = (behind, target, dist, h, lat, lookH = 1.55) => {
    const d = horiz(behind.pos, target.pos); const l = V3(-d.z, 0, d.x);
    const pos = behind.pos.clone().addScaledVector(d, -dist).addScaledVector(l, lat); pos.y = h;
    const look = target.pos.clone().addScaledVector(d, -0.1); look.y = lookH;
    return { pos, look };
  };
  const shots = [
    { t0: 0, t1: 1.0, fn: (u) => ({ pos: lv(V3(-9.5, 6.8, 11.5), V3(-4.2, 3.0, 8.6), sm(u)), look: lv(V3(0, 2.2, 0), V3(0, 1.5, 0), sm(u)), fov: lerp(50, 44, sm(u)) }) },
    { t0: 1.0, t1: 1.45, fn: (u) => ({ pos: lv(N.pos.clone().add(V3(1.7, 0, 2.8)), N.pos.clone().add(V3(1.4, 0, 2.5)), u).setY(1.6), look: nh().add(V3(0.2, -0.05, 0)), fov: 30 }) },
    { t0: 1.45, t1: 1.95, fn: (u) => ({ pos: lv(E.pos.clone().add(V3(-1.7, 0, 2.8)), E.pos.clone().add(V3(-1.4, 0, 2.5)), u).setY(1.6), look: eh().add(V3(-0.2, -0.05, 0)), fov: 30 }) },
    { t0: 1.95, t1: 2.45, fn: (u) => frame(4 - 4 * u, 2.1, 42, { margin: 1.1, minD: 7.0 - 0.6 * u, lookY: 1.25 }) },
    { t0: 2.45, t1: 3.5, fn: (u) => frame(38 - 10 * u, 1.75, 36, { margin: 0.95, minD: 4.6 - 0.4 * u, lookY: 1.4 }) },
    { t0: 3.5, t1: 3.9, fn: (u) => frame(-12 + 6 * u, 1.7, 42, { margin: 1.1, minD: 5.5, lookY: 1.25 }) },
    { t0: 3.9, t1: 4.6, fn: (u) => frame(-40 + 8 * u, 1.75, 36, { margin: 1.0, minD: 4.6 - 0.4 * u, lookY: 1.4 }) },
    { t0: 4.6, t1: 5.15, fn: (u) => ({ pos: lv(N.pos.clone().add(V3(3.0, 0.5, 3.4)), N.pos.clone().add(V3(2.6, 0.7, 3.0)), u), look: nh().add(V3(0, 0.5, 0)), fov: 40 }) },
    { t0: 5.15, t1: 6.12, fn: (u) => { const hd = eh(); const ap = apple.position.clone(); return { pos: E.pos.clone().add(V3(2.6, 1.0, 3.2)), look: lv(ap, hd, smooth(Math.pow(u, 3))), fov: 48 - 12 * smooth(u) }; } },
    { t0: 6.12, t1: 6.5, fn: (u) => ({ pos: lv(E.pos.clone().add(V3(-2.0, 1.9, 2.4)), E.pos.clone().add(V3(-1.7, 1.85, 2.2)), u), look: eh().add(V3(0, 0.0, 0)), fov: 27 }) },
    { t0: 6.5, t1: 6.95, fn: (u) => ({ pos: lv(V3(1.4, 1.0, -1.6), V3(1.1, 1.0, -2.0), u), look: V3(0, 0.45, -5.75), fov: 34 }) },
    { t0: 6.95, t1: 7.5, fn: (u) => frame(0, 2.1, 46, { margin: 1.3, minD: 7.8 - 0.5 * u, lookY: 1.25 }) },
    { t0: 7.5, t1: 8.12, fn: (u) => { const a = lerp(0.9, 0.2, sm(u)); const c = E.chestWorld; return { pos: V3(c.x - Math.sin(a) * 3.4, 0.8 + 0.5 * u, c.z + Math.cos(a) * 3.4), look: c.add(V3(0, 0.25, 0)), fov: 44 }; } },
    { t0: 8.12, t1: 8.62, fn: (u) => frame(-4, 1.5, 42, { margin: 1.1, minD: 5.6 - 0.4 * u, lookY: 1.4 }) },
    { t0: 8.62, t1: 9.73, fn: (u) => { const n = N.headWorld; return { pos: V3(lerp(-0.2, -1.2, sm(u)), 0.7 + 0.8 * sm(u), 5.7), look: V3(n.x, Math.max(n.y, 0.5) * 0.9 + 0.3, 0), fov: 52 }; } },
    { t0: 9.73, t1: 10.4, fn: (u) => ({ pos: lv(V3(-4.6, 3.8, 4.8), V3(-4.0, 3.2, 4.4), u), look: V3(-2.1, 0.4, 0), fov: 46 }) },
    { t0: 10.4, t1: 11.3, fn: (u) => ({ pos: lv(V3(-0.8, 1.9, 5.2), V3(-1.1, 1.7, 4.7), u), look: V3(-1.6, 0.7, -0.4), fov: 46 }) },
    { t0: 11.3, t1: 99, fn: (u) => ({ pos: lv(E.pos.clone().add(V3(-2.4, 0.5, 3.6)), E.pos.clone().add(V3(-3.0, 1.4, 4.9)), sm(clamp(u * 0.7))), look: eh().add(V3(0, 0.25 * (1 - u), 0)), fov: lerp(40, 46, clamp(u)) }) },
  ];
  return { shots, T, end: () => T.end, endcard: (simT) => { const endT = simT - (T.end - 0.9); return simT >= T.end - 0.9 ? { a: clamp(endT / 0.5), s: 0.9 + 0.1 * easeOutCubic(clamp(endT / 0.6)), html: '<div>EINSTEIN GEWINNT!</div><div style="font-size:44px;color:#fff;margin-top:12px">AI FIGHT CLUB · Folge 0</div>' } : null; } };
}
