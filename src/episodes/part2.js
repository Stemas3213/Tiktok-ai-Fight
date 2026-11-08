// AI FIGHT CLUB - Part 2: Runde 2. Spannung durch Wendungen: Einstein dominiert -> Apfel-Ausrutscher -> Newton dominiert -> Newtons Wiege / Einsteins Zeitdilatation -> Newton am Boden -> Aufstehen -> Zusammenprall -> Schwerkraft faellt aus (Cliffhanger).
import { strike, slip, duck, block, lookUp, dazed, laugh, callApple, charge, victory, taunt, stare, flight, shrug, wave, pointAt, gloveBang, angry, showboat, getUp, cower, kneel, balance, panic, diveElbow, floatPose } from '../moves.js';
import { clamp, lerp, smooth, easeOutCubic, easeInQuad, seg } from '../util.js';

export async function build(ctx) {
  const { updaters, extra, music, mute, initHp, nh, eh, midP, lv, sm, frame, THREE, V3, N, E, ref, fx, overlay, arena, S, st, at, act, sfx, slow, impact, shake, excite, hitstop, setHp, hp, project, horiz, apple, appleShadow, appleVel, APPLE, glow, W, H } = ctx;
  const A = {}; const cuts = []; const cut = (t, fn) => cuts.push({ t, fn });
  document.getElementById('roundTxt').textContent = 'RUNDE 2';
  initHp(50, 60);

  // ---------- Helfer ----------
  const place = (f, x, z, yaw) => { f.pos.set(x, 0, z); f.target.copy(f.pos); f.vel.set(0, 0, 0); f.yaw = yaw; f.feetInit = false; for (const k in f.springs) { f.springs[k].x = 0; f.springs[k].v = 0; } f.hurtUntil = -1; };
  const closeIn = (t, att, def, dist = 1.4, sT = 0.25) => at(t, () => { const d = horiz(def.pos, att.pos); att.target.set(def.pos.x + d.x * dist, 0, def.pos.z + d.z * dist); att.smoothTime = sT; });
  const orbit = (who, a0, a1, u, r, h, fov, dy = 0) => { const a = lerp(a0, a1, u) * Math.PI / 180; return { pos: V3(who.pos.x + Math.sin(a) * r, h, who.pos.z + Math.cos(a) * r), look: who.headWorld.add(V3(0, dy, 0)), fov }; };
  const whoosh = (t, v = 0.8) => at(t, () => sfx('whoosh', v));
  const ropeWob = (side, amp) => arena.wobbleSide(side, amp, st.outT);
  const hit = (t, from, to, o) => impact({ t, from, to, ...o });
  const strikeAt = (f, t, o) => { const s = strike(o); act(f, t, s); at(t + 0.05, () => sfx('whoosh', 0.7)); return { t, tHit: t + s.tHit, s }; };

  // Apfel liegt seit Runde 1 auf dem Ring (Chekhov's Apple)
  apple.visible = true; apple.userData.rest = true; apple.position.set(1.25, 0.34, 0.12); apple.rotation.set(0.4, 0.9, 0.2);
  appleShadow.material.opacity = 0.5; appleShadow.position.set(1.25, 0.02, 0.12); appleShadow.scale.setScalar(0.6);

  place(N, -1.0, 0, Math.PI / 2); place(E, 1.0, 0, -Math.PI / 2); place(ref, 0.3, -1.5, 0);

  // ===================== OPEN: Runde 2 beginnt mitten im Kampf =====================
  A.open = 0;
  at(0.15, () => { sfx('bell', 1); arena.bell.userData.ring = st.simT; excite(0.7); overlay.flash(0.4); overlay.pop('RUNDE 2', { x: 540, y: 760 }, { size: 190, fill: '#ffd24a', life: 1.0, rot: -4 }); music(3.2); });
  at(0.2, () => sfx('crowd', 1));
  // Newton stuermt wild los, Einstein weicht aus und kontert mit 4 Treffern
  const wild = strikeAt(N, 0.4, { hand: 'R', kind: 'hook', hit: false, tA: 0.2, tS: 0.12, tH: 0.05, tR: 0.3, lunge: 0.4, twist: 1.2, back: 0.35 });
  act(E, 0.5, slip(1, 0.55, 0.4));
  const c1 = strikeAt(E, 0.95, { hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 });
  hit(c1.tHit, E, N, { power: 0.9, label: 'PAFF!', dmg: 5, who: 'N', size: 140 });
  const c2 = strikeAt(E, 1.25, { hand: 'R', kind: 'cross', hit: true, tA: 0.11, tS: 0.09, lunge: 0.32, twist: 0.8 });
  hit(c2.tHit, E, N, { power: 1.3, label: 'BUMM!', fill: '#ff7a3a', dmg: 7, who: 'N', size: 175 });
  const c3 = strikeAt(E, 1.6, { hand: 'L', kind: 'hook', hit: true, tA: 0.14, tS: 0.1, lunge: 0.3, twist: 0.9 });
  hit(c3.tHit, E, N, { power: 1.5, label: 'KRACH!', fill: '#ffd24a', dmg: 8, who: 'N', size: 190 });
  const c4 = strikeAt(E, 2.05, { hand: 'R', kind: 'upper', hit: true, tA: 0.16, tS: 0.1, tH: 0.12, tR: 0.4, lunge: 0.35, twist: 0.5, back: 0.2 });
  hit(c4.tHit, E, N, { power: 2.0, label: 'KABUMM!', fill: '#ff4d4d', dmg: 10, who: 'N', size: 215, big: true });
  slow(c4.tHit - 0.05, c4.tHit + 0.5, 0.3, 0.05);
  at(c3.tHit + 0.1, () => { N.target.set(-2.1, 0, 0); N.smoothTime = 0.4; });
  at(c4.tHit + 0.05, () => { N.target.set(-2.75, 0, 0.1); N.smoothTime = 0.45; ropeWob(2, 0.2); });
  act(N, c4.tHit + 0.6, kneel(2.6));
  cut(0, () => frame(-6, 1.7, 40, { minD: 5.0, margin: 1.0, lookY: 1.35 }));
  cut(0.9, (u) => frame(18 - 12 * u, 1.75, 36, { minD: 4.6, margin: 0.8, lookY: 1.4 }));
  cut(c4.tHit - 0.45, (u) => orbit(N, 8, -8, u, 4.6, 1.6, 38, -0.1));
  cut(c4.tHit + 0.9, (u) => frame(4, 2.0, 44, { minD: 6, margin: 1.2, lookY: 1.2 }));

  // ===================== SMUG: Einstein genießt, Newton hat Angst =====================
  const SM = c4.tHit + 1.1; A.smug = SM;
  at(SM, () => { music(1.5); E.target.set(0.4, 0, 0.5); E.smoothTime = 0.7; });
  act(E, SM - 0.2, showboat(1.8)); act(E, SM + 1.8, shrug(1.8)); act(E, SM + 3.8, wave(1.4));
  act(N, SM + 0.9, cower(3.2)); at(SM + 1.0, () => { N.defaultExpr = 'neutral'; });
  const eyeApple = SM + 3.2;
  cut(SM, (u) => ({ pos: lv(E.pos.clone().add(V3(-2.5, 0, 3.0)), E.pos.clone().add(V3(-2.1, 0, 2.7)), u).setY(1.65), look: eh().add(V3(0, -0.1, 0)), fov: 32 }));
  cut(SM + 1.8, (u) => ({ pos: lv(N.pos.clone().add(V3(2.1, 0, 2.6)), N.pos.clone().add(V3(1.8, 0, 2.3)), u).setY(1.2), look: nh().add(V3(0, -0.2, 0)), fov: 32 }));
  cut(eyeApple, (u) => ({ pos: lv(V3(2.2, 1.0, 1.8), V3(1.9, 0.8, 1.5), u), look: V3(1.25, 0.4, 0.12), fov: 30 }));      // Insert: der Apfel
  cut(eyeApple + 1.0, (u) => frame(10, 1.9, 42, { minD: 5.2, margin: 1.2, lookY: 1.25 }));

  // ===================== FINISH: Stille -> Einstein stuermt -> Apfel =====================
  const FI = SM + 5.8; A.finish = FI;
  at(FI - 0.3, () => { E.target.set(2.25, 0, 0.1); E.smoothTime = 0.45; N.defaultExpr = 'grit'; });
  act(E, FI, charge(1.1)); at(FI, () => { sfx('charge', 0.8); music(0.8); });
  fx.setAura(E, FI, FI + 1.4, 0.7);
  at(FI + 0.7, () => { mute(1.3, 0.12); sfx('heart', 1); });
  at(FI + 1.15, () => sfx('heart', 1));
  at(FI + 0.5, () => { N.rate = 1; });
  act(N, FI + 0.5, { dur: 1.5, fn(u, P) { P.face = 'shock'; P.headPitch += 0.25; } });
  const DASH = FI + 1.7; const SLIP = DASH + 0.19; A.slip = SLIP;
  at(DASH, () => { E.target.set(-0.3, 0, 0.1); E.smoothTime = 0.1; sfx('whoosh', 1); sfx('riser', 0.8); music(3.6); });
  act(E, DASH, strike({ hand: 'R', kind: 'cross', hit: true, tA: 0.25, tS: 0.1, lunge: 0.2, twist: 0.6 }));
  at(SLIP, () => {
    const p = E.pos.clone(); apple.userData.rest = false; apple.userData.bounce = true; apple.userData.t0 = SLIP; appleVel.set(-1.6, 3.4, 0.4); apple.position.set(1.25, 0.34, 0.12);
    act(E, SLIP, flight(SLIP, { from: [p.x, p.z], v: [-2.2, 0.05, 3.3], spins: 0, hold: 1.9 }));
    sfx('slip', 1); shake(0.12); overlay.pop('OOOPS!', { x: 540, y: 700 }, { size: 190, fill: '#ffe14a', rot: -6, life: 0.9 }); overlay.flash(0.2); excite(0.5);
    fx.puff(p.clone().add(V3(0, 0.2, 0)), 4, { size: 0.4, color: '#ffffff', life: 0.6 });
  });
  at(SLIP + 0.85, () => { const p = E.pos.clone(); p.y = 0.2; fx.puff(p, 8, { size: 0.7, color: '#cfd3ff', life: 0.9 }); fx.starsBurst(E.headWorld, 8, { speed: 3, size: 0.14 }); shake(0.15); hitstop(0.07); sfx('thud', 1); setHp('E', Math.max(0, hp.E - 10)); overlay.pop('PLUMPS!', { x: 540, y: 960 }, { size: 170, fill: '#cfd3ff', rot: 6, life: 0.8 }); });
  slow(SLIP - 0.05, SLIP + 0.5, 0.45, 0.06);
  act(N, SLIP + 0.1, { dur: 1.6, fn(u, P) { const b = smooth(seg(u, 0, 0.2)); P.face = u < 0.8 ? 'shock' : 'happy'; P.guardW = 1 - 0.5 * b; P.torsoPitch += -0.1 * b; } });
  fx.dizzyStars(E, SLIP + 0.9, SLIP + 2.6);
  cut(FI - 0.3, (u) => ({ pos: lv(N.pos.clone().add(V3(1.8, 0, 2.4)), N.pos.clone().add(V3(1.5, 0, 2.0)), u).setY(1.5), look: nh().add(V3(0, -0.1, 0)), fov: 30 }));
  cut(FI + 0.7, (u) => ({ pos: lv(N.pos.clone().add(V3(1.2, 0, 1.6)), N.pos.clone().add(V3(1.0, 0, 1.3)), u).setY(1.7), look: nh().add(V3(0.3, -0.05, 0)), fov: 24 }));       // Newtons Augen in der Stille
  cut(DASH - 0.2, (u) => frame(-8, 1.6, 40, { minD: 5.4, margin: 1.0, lookY: 1.3 }));
  cut(SLIP + 0.3, (u) => orbit(E, -4, 4, u, 4.8, 1.2, 40, -0.4));
  cut(SLIP + 1.7, (u) => frame(8, 1.9, 42, { minD: 5.2, margin: 1.2, lookY: 1.25 }));

  // ===================== TURN: Newton dreht den Spiess um =====================
  const TU = SLIP + 2.3; A.turn = TU;
  at(TU - 0.9, () => { music(3.4); N.defaultExpr = 'smug'; });
  act(N, SLIP + 1.7, laugh(1.1));
  act(E, SLIP + 2.0, getUp(1.7));
  at(SLIP + 2.0 + 1.7, () => { E.airborne = false; E.target.copy(E.pos); E.pos.y = 0; E.feetInit = false; E.smoothTime = 0.25; });
  closeIn(TU - 0.1, N, E, 1.35, 0.25);
  const n1 = strikeAt(N, TU + 0.55, { hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 });
  hit(n1.tHit, N, E, { power: 1.0, label: 'PAFF!', dmg: 6, who: 'E', size: 150 });
  const n2 = strikeAt(N, TU + 0.95, { hand: 'R', kind: 'hook', hit: true, tA: 0.15, tS: 0.11, lunge: 0.3, twist: 0.95 });
  hit(n2.tHit, N, E, { power: 1.4, label: 'KLATSCH!', fill: '#ff4d6d', dmg: 8, who: 'E', size: 175 });
  at(n2.tHit + 0.1, () => { E.target.set(2.4, 0, 0.15); E.smoothTime = 0.35; });
  const n3 = strikeAt(N, TU + 1.5, { hand: 'L', kind: 'cross', hit: true, tA: 0.11, tS: 0.09, lunge: 0.3, twist: 0.8 });
  hit(n3.tHit, N, E, { power: 1.5, label: 'WUMM!', fill: '#ff7a3a', dmg: 9, who: 'E', size: 180 }); at(n3.tHit, () => ropeWob(3, 0.12));
  closeIn(TU + 1.7, N, E, 1.3, 0.2);
  const n4 = strikeAt(N, TU + 2.1, { hand: 'R', kind: 'upper', hit: true, tA: 0.16, tS: 0.1, lunge: 0.3, twist: 0.5, back: 0.2 });
  hit(n4.tHit, N, E, { power: 1.9, label: 'RUMMS!', fill: '#ffb347', dmg: 11, who: 'E', size: 200, big: true }); at(n4.tHit, () => ropeWob(3, 0.22));
  slow(n4.tHit - 0.05, n4.tHit + 0.4, 0.4, 0.05);
  act(E, n4.tHit + 0.5, cower(3.0));
  at(TU + 3.0, () => { N.target.set(-0.4, 0, 0.1); N.smoothTime = 0.7; });
  act(N, TU + 3.2, taunt(1.2)); act(N, TU + 4.5, laugh(1.5));
  cut(TU - 0.9, (u) => orbit(E, 4, -4, u, 4.8, 1.2, 40, -0.7));
  cut(TU + 0.35, (u) => frame(-24 + 8 * u, 1.7, 36, { minD: 4.8, margin: 0.9, lookY: 1.4 }));
  cut(TU + 1.9, (u) => frame(14 - 6 * u, 1.65, 36, { minD: 4.7, margin: 0.85, lookY: 1.4 }));
  cut(n4.tHit + 0.35, (u) => ({ pos: lv(E.pos.clone().add(V3(-2.2, 0, 2.6)), E.pos.clone().add(V3(-1.9, 0, 2.3)), u).setY(1.6), look: eh().add(V3(0, -0.15, 0)), fov: 30 }));
  cut(TU + 4.2, (u) => frame(6, 2.0, 44, { minD: 5.8, margin: 1.2, lookY: 1.25 }));

  // ===================== CRADLE: Newtons Wiege =====================
  const CR = TU + 6.6; A.cradle = CR;
  const cradle = new THREE.Group(); cradle.visible = false; scene_add(cradle);
  function scene_add(o) { world_scene().add(o); } function world_scene() { return ctx.scene; }
  const X0 = 0.1, LS = 2.0, R = 0.26, SP = 0.55, TOP = 2.6, AMP = 36 * Math.PI / 180;
  const steel = new THREE.MeshStandardMaterial({ color: '#d5dbe8', metalness: 0.35, roughness: 0.18 }), dark = new THREE.MeshStandardMaterial({ color: '#e8b923', metalness: 0.5, roughness: 0.3, emissive: '#6b4a00', emissiveIntensity: 0.5 });
  for (const sx of [-1, 1]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, TOP + 0.1, 10), dark); post.position.set(X0 + sx * 1.75, (TOP + 0.1) / 2, 0); post.castShadow = true; cradle.add(post); const foot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 1.0), dark); foot.position.set(X0 + sx * 1.75, 0.04, 0); cradle.add(foot); }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 0.14), dark); bar.position.set(X0, TOP + 0.05, 0); cradle.add(bar);
  const piv = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group(); g.position.set(X0 + (i - 2) * SP, TOP, 0); cradle.add(g);
    const sm_ = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#aab4d8', emissiveIntensity: 0.6 });
    for (const sz of [-1, 1]) { const ln = Math.hypot(LS, 0.24), str = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, ln, 6), sm_); str.position.set(0, -LS / 2, sz * 0.12); str.rotation.x = -sz * Math.atan(0.24 / LS) / 1; g.add(str); }
    const ball = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 18), steel); ball.position.y = -LS; ball.castShadow = true; g.add(ball); piv.push(g);
  }
  const cs = { clock: 0, rate: 1, tr: null, lastP: -2, dropT0: CR, held: true, ang: [0, 0, 0, 0, 0] };
  const TQ = 0.38, TH = 0.76;
  const angleOf = (i, c) => {
    if (cs.tr === null || c < cs.tr) return i === 0 ? -AMP : 0;
    const tau = c - cs.tr;
    if (tau < TQ) return i === 0 ? -AMP * Math.cos(Math.PI / 2 * tau / TQ) : 0;
    const t2 = tau - TQ, p = Math.floor(t2 / TH), u = (t2 - p * TH) / TH, amp = AMP * Math.pow(0.88, p) * Math.sin(Math.PI * u);
    if (p % 2 === 0) return i === 4 ? amp : 0; return i === 0 ? -amp : 0;
  };
  const ballWorld = (i) => { const a = cs.ang[i]; return V3(X0 + (i - 2) * SP + LS * Math.sin(a), TOP - LS * Math.cos(a), 0).add(cradle.position); };
  updaters.push((t, h) => {
    if (!cradle.visible) return;
    const dropU = clamp((t - cs.dropT0) / 0.55); cradle.position.y = dropU < 1 ? 9 * (1 - easeInQuad(dropU)) : 0;
    if (dropU >= 1 && !cs.landed) { cs.landed = true; fx.puff(V3(X0, 0.2, 0), 10, { size: 0.9, color: '#d5d8ee', life: 1.0, spread: 3 }); fx.ring(V3(X0, 0.05, 0), { mode: 'ground', maxR: 3.2, life: 0.6, color: '#ffffff' }); shake(0.2); sfx('thud', 1); ropeWob(0, 0.05); }
    cs.clock += h * cs.rate;
    for (let i = 0; i < 5; i++) { const a = angleOf(i, cs.clock); cs.ang[i] = a; piv[i].rotation.z = a; }
    if (cs.tr !== null && cs.clock >= cs.tr) { const t2 = cs.clock - cs.tr - TQ; const p = t2 < 0 ? -1 : Math.floor(t2 / TH); if (p !== cs.lastP) { cs.lastP = p; sfx('click', 0.9); } }
  });
  at(CR, () => { cradle.visible = true; cradle.position.y = 9; sfx('swoosh', 0.9); music(2.2); });
  act(N, CR + 0.15, callApple(1.5)); at(CR + 0.35, () => { N.target.set(-2.5, 0, 0); N.smoothTime = 0.5; });
  act(E, CR + 1.0, { dur: 1.3, fn(u, P) { P.face = 'shock'; P.guardW = 0.6; } });
  at(CR + 0.6, () => { E.target.set(2.7, 0, 0.1); E.smoothTime = 0.5; });
  // Newton greift die erste Kugel und zieht sie zurueck
  const GRAB = CR + 1.75, REL = CR + 2.9; cs.relT = REL;
  act(N, GRAB, { dur: REL - GRAB + 0.3, fn(u, P, f) { const w = smooth(seg(u, 0, 0.25)) * (1 - smooth(seg(u, REL - GRAB, REL - GRAB + 0.3))); const h = P.hand.R; h.w = w; h.fn = (out) => { out.copy(f.rig.torso.worldToLocal(ballWorld(0).add(V3(-0.2, 0.05, 0)))); }; P.torsoTwist += 0.4 * w; P.torsoPitch += 0.1 * w; P.face = 'shout'; } });
  at(REL, () => { cs.tr = cs.clock; sfx('swoosh', 0.8); });
  cut(CR - 0.5, () => ({ pos: V3(0.2, 3.2, 6.6), look: V3(0.1, 1.2, 0), fov: 52 }));
  cut(CR + 0.9, (u) => ({ pos: lv(V3(-0.6, 1.9, 5.8), V3(-1.0, 1.7, 5.4), u), look: V3(-1.3, 1.1, 0), fov: 46 }));
  cut(GRAB + 0.4, (u) => ({ pos: lv(V3(1.2, 1.7, 5.8), V3(1.0, 1.6, 5.4), u), look: V3(1.1, 1.1, 0), fov: 50 }));
  cut(REL - 0.3, () => ({ pos: V3(0.2, 2.2, 6.0), look: V3(0.1, 1.1, 0), fov: 54 }));

  // ===================== BULLET TIME: Einsteins Zeitdilatation =====================
  const BU = REL + 0.12; A.bullet = BU;
  const bt = { on: false };
  const BUL = 4.4, RES = BU + BUL; A.resume = RES;
  at(BU, () => { bt.on = true; N.rate = 0.12; ref.rate = 0.12; cs.rate = 0.12; mute(BUL, 0.12); sfx('slowdown', 1); music(0.3); overlay.flash(0.25); });
  for (let k = 0; k < 8; k++) at(BU + 0.3 + k * 0.5, () => sfx('tick', 0.7));
  updaters.push((t, h) => { const k = bt.on ? smooth(clamp((t - BU) / 0.3)) : 1 - smooth(clamp((t - RES) / 0.25)); if (!bt.on && t < BU) return; extra.sat = 0.55 * k; extra.tint = [-0.18 * k, -0.04 * k, 0.28 * k]; extra.vig = 0.25 * k; extra.ca = 0.004 * k; });
  at(RES, () => { bt.on = false; });
  act(E, BU + 0.1, stare(0.5));
  at(BU + 0.5, () => { E.smoothTime = 0.22; E.target.set(1.2, 0, 0.95); });
  at(BU + 0.9, () => { E.target.set(-0.8, 0, 0.95); E.smoothTime = 0.18; });
  at(BU + 1.5, () => { E.target.set(-1.5, 0, 0.6); E.smoothTime = 0.15; });
  at(BU + 0.4, () => { N.defaultExpr = 'shock'; });
  act(N, BU + 0.3, { dur: BUL, fn(u, P) { P.face = 'shock'; P.guardW = 0.3; P.headRoll += 0.1; } });
  const b1 = strikeAt(E, BU + 2.0, { hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 });
  const b2 = strikeAt(E, BU + 2.4, { hand: 'R', kind: 'cross', hit: true, tA: 0.11, tS: 0.09, lunge: 0.3, twist: 0.8 });
  const b3 = strikeAt(E, BU + 2.8, { hand: 'L', kind: 'hook', hit: true, tA: 0.14, tS: 0.1, lunge: 0.3, twist: 0.9 });
  act(E, BU + 3.3, { dur: 1.1, fn(u, P) { P.face = 'happy'; const h = P.hand.R; h.w = smooth(seg(u, 0, 0.2)); h.pos.set(-0.25, 0.9 + 0.1 * Math.sin(u * 16), 0.35); const l = P.hand.L; l.w = h.w; l.pos.set(0.2, 0.7, 0.35); P.torsoPitch += -0.1; } });   // pustet auf die Handschuhe
  closeIn(BU + 1.8, E, N, 1.3, 0.15);
  at(RES, () => {
    N.rate = 1; ref.rate = 1; cs.rate = 1; N.defaultExpr = 'grit';
    const dir = horiz(E.pos, N.pos);
    for (let i = 0; i < 3; i++) { N.hit(dir, 1.5, 'head', RES + i * 0.05); }
    const p = N.headWorld; fx.burstSprite(p, 2.8, 0.34); fx.starsBurst(p, 30, { speed: 7, size: 0.22 }); fx.bricksBurst(p, 40, { color: ['#7fd6ff', '#fff', '#ffd24a'], speed: 6, size: 0.1, up: 3 });
    fx.ring(p, { maxR: 3.4, life: 0.55, color: '#9fe3ff' }); fx.ring(p, { maxR: 2.4, life: 0.4, color: '#ffffff' }); fx.flash(p, RES);
    shake(0.34); st.fovPunch = 14; hitstop(0.16); overlay.flash(0.95); overlay.speedLines(1.0); sfx('boom', 1.3); excite(0.9); setHp('N', Math.max(0, hp.N - 24));
    overlay.pop('BAMM-BAMM-BAMM!', { x: 540, y: 700 }, { size: 150, fill: '#9fe3ff', rot: -6, life: 1.1 }); music(3.8);
    act(N, RES, flight(RES, { from: [N.pos.x, N.pos.z], v: [-0.8, 0, 5.2], spins: 1, hold: 4.6 }));
  });
  slow(RES, RES + 0.6, 0.35, 0.04);
  const DN = RES + 1.2 + 5.2 / 9.8 * 2 - 0.5; A.down = DN;
  at(DN - 0.2, () => { cradle.visible = false; fx.puff(V3(X0, 1.2, 0), 14, { size: 1.0, color: '#e9ecff', life: 1.0, spread: 3 }); sfx('poof', 0.8); });
  at(DN, () => { const p = N.pos.clone(); p.y = 0.2; fx.puff(p, 10, { size: 0.8, color: '#cfd3ff', life: 1.0, spread: 2.5 }); fx.ring(N.pos.clone().add(V3(0, 0.05, 0)), { mode: 'ground', maxR: 2.6, life: 0.7, color: '#fff' }); ropeWob(2, 0.2); shake(0.2); sfx('thud', 1.1); excite(0.6); const sp = project(p); overlay.pop('WUMMS!', { x: clamp(sp.x, 220, 860), y: clamp(sp.y - 140, 420, 1300) }, { size: 170, fill: '#cfd3ff', rot: 7, life: 0.8 }); music(0.5); });
  act(E, RES + 0.3, victory(1.6)); at(RES + 0.35, () => { E.target.set(0.2, 0, 0.3); E.smoothTime = 0.7; });
  const cnt = DN + 0.3; ['1', '2', '3'].forEach((n, i) => at(cnt + i * 0.8, () => { const sp = project(N.pos.clone().add(V3(0, 1.3, 0))); overlay.pop(n, { x: clamp(sp.x, 200, 880), y: clamp(sp.y - 120, 420, 1300) }, { size: 190, fill: i === 2 ? '#ff4d4d' : '#fff', rot: i * 5 - 6, life: 0.6 }); sfx('count', 0.6); }));
  act(ref, cnt, { dur: 2.6, fn(u, P) { const h = P.hand.R; h.w = 1; const beat = (u / 0.8) % 1; h.pos.set(-0.28, 0.55 + 0.55 * Math.sin(Math.PI * Math.min(1, beat * 1.2)), 0.35); P.torsoPitch += 0.15; P.face = 'shout'; } });
  at(DN, () => { ref.target.set(-1.4, 0, -0.95); ref.smoothTime = 0.3; });
  cut(BU - 0.1, (u) => ({ pos: V3(0.2, 1.9, 6.0), look: V3(0.1, 1.1, 0), fov: 54 }));
  cut(BU + 0.9, (u) => ({ pos: lv(E.pos.clone().add(V3(2.2, 0, 3.4)), E.pos.clone().add(V3(0.8, 0, 3.0)), u).setY(1.3), look: eh().add(V3(-0.6, -0.1, 0)), fov: 36 }));
  cut(BU + 1.9, (u) => frame(-12 + 16 * u, 1.55, 36, { minD: 4.5, margin: 0.9, lookY: 1.4 }));
  cut(BU + 3.2, (u) => ({ pos: lv(E.pos.clone().add(V3(-1.6, 0, 2.4)), E.pos.clone().add(V3(-1.4, 0, 2.2)), u).setY(1.55), look: eh().add(V3(0, -0.1, 0)), fov: 28 }));
  cut(RES - 0.45, (u) => frame(-4, 1.6, 38, { minD: 4.6, margin: 1.0, lookY: 1.4 }));
  cut(RES + 0.55, (u) => { const n = N.headWorld; return { pos: V3(lerp(-0.6, -1.6, sm(u)), 0.9 + 0.7 * sm(u), 5.7), look: V3(n.x, Math.max(n.y, 0.5) * 0.9 + 0.3, 0), fov: 52 }; });
  cut(DN - 0.15, (u) => ({ pos: lv(N.pos.clone().add(V3(1.6, 2.6, 4.6)), N.pos.clone().add(V3(1.2, 2.4, 4.2)), u), look: N.pos.clone().add(V3(0, 0.3, 0)), fov: 52 }));

  // ===================== RISE: Newton steht auf, Einstein bekommt Angst =====================
  const RI = DN + 2.6; A.rise = RI;
  const guD = 2.2; act(N, RI, getUp(guD)); at(RI + guD, () => { N.airborne = false; N.target.copy(N.pos); N.pos.y = 0; N.feetInit = false; N.smoothTime = 0.3; N.defaultExpr = 'grit'; music(1.8); sfx('crowd', 1); excite(0.6); const sp = project(N.headWorld); overlay.pop('NOCH NICHT!', { x: 540, y: clamp(sp.y - 260, 420, 1000) }, { size: 130, fill: '#ff6a6a', rot: -5, life: 1.0 }); });
  act(E, RI + 0.8, stare(2.0)); act(E, RI + 1.4, panic(1.0));
  act(N, RI + guD, { dur: 3, fn(u, P) { P.face = 'grit'; P.torsoRoll += 0.05 * Math.sin(u * 7) * Math.exp(-u); } });
  cut(DN + 0.6, (u) => ({ pos: lv(N.pos.clone().add(V3(1.6, 2.6, 4.6)), N.pos.clone().add(V3(1.2, 2.4, 4.2)), u), look: N.pos.clone().add(V3(0, 0.3, 0)), fov: 52 }));
  cut(RI - 0.1, (u) => ({ pos: lv(N.pos.clone().add(V3(2.2, 1.4, 3.8)), N.pos.clone().add(V3(1.8, 1.7, 3.5)), u), look: N.pos.clone().add(V3(0, 0.8, 0)), fov: 40 }));
  cut(RI + 1.5, (u) => ({ pos: lv(E.pos.clone().add(V3(-2.4, 0, 2.8)), E.pos.clone().add(V3(-2.1, 0, 2.5)), u).setY(2.2), look: eh().add(V3(0, -0.2, 0)), fov: 30 }));

  // ===================== CLIMB + CLASH =====================
  const CL = RI + guD + 0.5; A.climb = CL;
  const ropeX = 3.0, ropeY = 1.18;
  at(CL, () => { E.target.set(ropeX - 0.1, 0, 0); E.smoothTime = 0.5; N.target.set(-0.5, 0, 0); N.smoothTime = 0.6; music(2.4); });
  act(E, CL + 0.8, balance(2.8));
  updaters.push((t, h) => { if (t >= CL + 0.8 && t < CL + 1.6) { const k = smooth((t - CL - 0.8) / 0.8); E.pos.y = ropeY * k; E.target.y = ropeY * k; E.pos.x = lerp(E.pos.x, ropeX, 0.15); E.target.x = ropeX; } else if (t >= CL + 1.6 && t < LEAP) { E.pos.y = ropeY; E.target.y = ropeY; } });
  const LEAP = CL + 3.3, CLASH = LEAP + 0.95; A.clash = CLASH;
  act(N, CL + 0.9, { dur: 2.4, fn(u, P) { const b = smooth(seg(u, 0, 0.3)); P.flash = Math.max(P.flash, 0.5 * b + 0.15 * Math.sin(u * 30) * b); P.hipsDrop += 0.2 * b; P.torsoPitch += 0.15 * b; P.face = 'grit'; P.stance = 1.3; P.bounce = 0; for (const sd of ['L', 'R']) { const h = P.hand[sd]; h.w = b; h.pos.set(sd === 'L' ? 0.3 : -0.3, 0.35, 0.2); } P.hairPuff = Math.max(P.hairPuff, 0.5 * b); } });
  at(CL + 1.2, () => { sfx('hum', 0.9); });
  at(LEAP - 1.2, () => { mute(1.2, 0.15); sfx('heart', 1); music(0.2); });
  at(LEAP - 0.6, () => sfx('heart', 1));
  fx.setAura(E, CLASH - 1.6, CLASH + 0.1, 0.8);
  // Einstein springt: ballistischer Bogen vom Seil
  act(E, LEAP, diveElbow(1.0, 'R'));
  at(LEAP, () => { E.airborne = true; sfx('whoosh', 1); sfx('riser', 1); music(3.8); });
  const T_J = CLASH - LEAP, x0 = ropeX, y0 = ropeY, x1 = 0.85, y1 = 1.05, vy = (y1 - y0 + 0.5 * 9.8 * T_J * T_J) / T_J;
  updaters.push((t, h) => { if (t >= LEAP && t <= CLASH + 0.02) { const u = t - LEAP; E.pos.x = lerp(x0, x1, u / T_J); E.pos.z = 0.05; E.pos.y = y0 + vy * u - 0.5 * 9.8 * u * u; E.target.copy(E.pos); E.vel.set(0, 0, 0); } });
  const cl = strikeAt(N, CLASH - 0.36, { hand: 'R', kind: 'upper', hit: true, tA: 0.2, tS: 0.1, tH: 0.2, tR: 0.5, lunge: 0.45, twist: 0.5, back: 0.2 });
  at(CLASH, () => {
    const p = V3((E.pos.x + N.pos.x) / 2 + 0.3, 1.9, 0);
    fx.burstSprite(p, 3.4, 0.4); fx.starsBurst(p, 40, { speed: 8, size: 0.26 }); fx.bricksBurst(p, 60, { color: ['#ffd24a', '#9fe3ff', '#fff', '#ff6a6a'], speed: 7.5, size: 0.12, up: 2 });
    fx.ring(p, { maxR: 4.5, life: 0.8, color: '#ffffff' }); fx.ring(p, { maxR: 3.2, life: 0.6, color: '#ffd24a' }); fx.ring(p, { maxR: 2.4, life: 0.5, color: '#9fe3ff' }); fx.flash(p, CLASH);
    shake(0.4); st.fovPunch = 16; hitstop(0.35); overlay.flash(1.0); overlay.speedLines(1.0); sfx('boom', 1.4); sfx('crash', 1.3); excite(1.2); mute(1.0, 0.05);
    setHp('N', Math.max(0, hp.N - 8)); setHp('E', Math.max(0, hp.E - 8)); N.hit(V3(-1, 0, 0), 1.4, 'head', CLASH); E.hurtUntil = CLASH + 0.8;
  });
  slow(CLASH - 0.1, CLASH + 0.9, 0.28, 0.05);
  cut(CL - 0.1, () => frame(0, 2.0, 46, { minD: 6.2, margin: 1.4, lookY: 1.4 }));
  cut(CL + 1.0, (u) => ({ pos: lv(V3(2.0, 0.9, 4.0), V3(1.6, 1.1, 3.6), u), look: V3(ropeX - 0.2, 1.6, 0), fov: 36 }));
  cut(CL + 2.0, (u) => ({ pos: lv(N.pos.clone().add(V3(1.2, 0, 1.6)), N.pos.clone().add(V3(1.0, 0, 1.3)), u).setY(1.7), look: nh().add(V3(0.3, -0.05, 0)), fov: 24 }));
  cut(LEAP - 0.1, (u) => frame(0, 1.8, 46, { minD: 6.4, margin: 1.4, lookY: 1.5 }));
  cut(CLASH - 0.4, (u) => ({ pos: V3(0.9, 1.7, 3.6), look: V3(0.9, 1.7, 0), fov: 36 }));

  // ===================== ZERO-G: Die Schwerkraft faellt aus =====================
  const ZE = CLASH + 0.5; A.zero = ZE;
  at(ZE, () => { music(0.25); N.defaultExpr = 'shock'; E.defaultExpr = 'shock'; sfx('gravity', 1.2); });
  at(ZE + 0.3, () => { mute(0.1); });
  updaters.push((t, h) => { extra.zg = smooth(clamp((t - ZE) / 2.5)); if (t >= ZE) { extra.tint = [-0.08 * extra.zg, -0.1 * extra.zg, 0.22 * extra.zg]; extra.sat = -0.1 * extra.zg; extra.vig = 0.15 * extra.zg; if (extra.zg > 0.01 && apple.visible) { appleVel.y = Math.max(appleVel.y, 0); apple.position.y += 0.9 * extra.zg * h; apple.rotation.x += 0.7 * h; apple.rotation.y += 0.5 * h; } } });
  act(N, ZE - 0.1, floatPose(9, 0)); act(E, ZE - 0.1, floatPose(9, 2.1));
  at(ZE + 0.2, () => { E.airborne = true; N.airborne = true; });
  at(ZE + 0.4, () => { for (let k = 0; k < 4; k++) fx.confettiBurst(V3(0, 2.2 + k * 0.4, 0), 40); });
  for (let k = 0; k < 6; k++) at(ZE + 1.0 + k * 1.1, () => { fx.starsBurst(V3(-1.5 + 0.6 * k, 1.5 + 0.3 * k, 0), 4, { speed: 1.2, size: 0.12, colors: ['#9fe3ff', '#ffffff', '#c9a6ff'] }); });
  slow(ZE, ZE + 2.4, 0.5, 0.2);
  cut(CLASH + 0.1, (u) => ({ pos: V3(0.9, 1.9, 4.2), look: V3(0.9, 1.9, 0), fov: 40 }));
  cut(ZE + 0.2, (u) => frame(-8 + 26 * u, 1.8 + 0.8 * u, 48, { minD: 6.4, margin: 2.0, lookY: 2.0 + 0.5 * u }));
  cut(ZE + 3.0, (u) => ({ pos: lv(V3(-3.0, 3.2, 5.4), V3(-2.0, 4.2, 5.8), u), look: V3(0, 4.0 + 0.4 * u, 0), fov: 58 }));

  A.end = ZE + 10.2; const END = A.end;
  const sorted = cuts.sort((a, b) => a.t - b.t);
  const shots = sorted.map((c, i) => ({ t0: c.t, t1: sorted[i + 1] ? sorted[i + 1].t : 999, fn: c.fn }));
  return {
    shots, T: {}, anchors: A, end: () => END,
    endcard: (simT) => { const t = simT - (ZE + 2.2); return t >= 0 ? { a: clamp(t / 0.5), s: 0.85 + 0.15 * easeOutCubic(clamp(t / 0.6)), html: '<div style="font-size:150px;color:#fff">RUNDE 3</div><div style="margin-top:4px;font-size:96px;color:#9fe3ff">SCHWERELOS?</div>' } : null; },
  };
}
