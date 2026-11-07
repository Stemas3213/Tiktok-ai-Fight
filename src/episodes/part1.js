// AI FIGHT CLUB - Part 1: Runde 1 (Newton vs. Einstein). Zeiten in Sim-Sekunden; Anker (cold/prov/fight/upper/land/bellEnd) werden vom Drehbuch (script.json) referenziert.
import { strike, slip, duck, block, lookUp, dazed, laugh, callApple, charge, victory, taunt, stare, flight, shrug, wave, pointAt, gloveBang, angry, spinOut, showboat, getUp } from '../moves.js';
import { clamp, lerp, smooth, easeOutCubic, seg } from '../util.js';

export async function build(ctx) {
  const { glow, nh, eh, midP, lv, sm, frame, THREE, V3, N, E, ref, fx, overlay, arena, S, st, at, act, sfx, slow, impact, shake, excite, hitstop, setHp, hp, project, horiz, apple, appleVel, APPLE, W, H } = ctx;
  const A = {}; const cuts = []; const cut = (t, fn) => cuts.push({ t, fn });
  const T1 = 2.4, F = T1 + 16.6;
  A.cold = 0; A.prov = T1; A.fight = F;

  // ---------- Helfer ----------
  const place = (f, x, z, yaw) => { f.pos.set(x, 0, z); f.target.copy(f.pos); f.vel.set(0, 0, 0); f.yaw = yaw; f.feetInit = false; for (const k in f.springs) { f.springs[k].x = 0; f.springs[k].v = 0; } f.hurtUntil = -1; };
  const closeIn = (t, att, def, dist = 1.4, sT = 0.25) => at(t, () => { const d = horiz(def.pos, att.pos); att.target.set(def.pos.x + d.x * dist, 0, def.pos.z + d.z * dist); att.smoothTime = sT; });
  const orbit = (who, a0, a1, u, r, h, fov, dy = 0) => { const a = lerp(a0, a1, u) * Math.PI / 180; return { pos: V3(who.pos.x + Math.sin(a) * r, h, who.pos.z + Math.cos(a) * r), look: who.headWorld.add(V3(0, dy, 0)), fov }; };
  const whoosh = (t, v = 0.8) => at(t, () => sfx('whoosh', v));
  const ropeWob = (side, amp) => arena.wobbleSide(side, amp, st.outT);
  const steam = (f, t) => at(t, () => fx.puff(f.headWorld.clone().add(V3(0, 0.35, 0)), 3, { size: 0.35, color: '#ffd0d0', life: 0.8, rise: 1.6, spread: 0.6 }));

  // ===================== COLD OPEN (Hook) =====================
  place(N, -0.95, 0, Math.PI / 2); place(E, 0.95, 0, -Math.PI / 2); place(ref, 0.2, -1.4, 0);
  const hook0 = strike({ hand: 'R', kind: 'hook', hit: true, tA: 0.17, tS: 0.12, lunge: 0.3, twist: 0.95, back: 0.3 }); act(N, 0.3, hook0);
  whoosh(0.4, 0.9);
  const t0hit = 0.3 + hook0.tHit;
  impact({ t: t0hit, from: N, to: E, power: 2.0, label: 'KLATSCH!', fill: '#ff4d6d', size: 210, big: true, dmg: 12, who: 'E' });
  at(t0hit + 0.02, () => { fx.bricksBurst(E.headWorld, 18, { color: ['#bfe9ff', '#ffffff'], speed: 2.8, size: 0.05, up: 1.5, life: 1.5 }); sfx('crowd', 0.9); });
  act(E, t0hit, { dur: 1.6, fn(u, P) { P.hairPuff = Math.max(P.hairPuff, 0.9 * Math.exp(-u * 1.6)); } });
  slow(0.6, 1.5, 0.3, 0.05);
  // Uebergang: weisser Blitz + Logo, Figuren werden in die Ecken gesetzt
  at(T1 - 0.2, () => { overlay.flash(1.0); sfx('swoosh', 0.9); overlay.pop('AI FIGHT CLUB', { x: 540, y: 760 }, { size: 175, fill: '#ffd24a', life: 1.5, rot: -4 }); overlay.pop('RUNDE 1', { x: 540, y: 930 }, { size: 210, fill: '#ffffff', life: 1.5, rot: 3 }); });
  at(T1, () => {
    place(N, -2.75, 0, Math.PI / 2); place(E, 2.75, 0, -Math.PI / 2); place(ref, 0.2, -1.4, 0);
    hp.N = hp.E = 100; for (const s of ['L', 'R']) { overlay.hp[s] = 1; overlay.hpShown[s] = 1; overlay.lag[s] = 1; }
  });
  cut(0, () => frame(-12, 1.3, 40, { minD: 5.2, margin: 1.0, lookY: 1.35 }));
  cut(0.3, (u) => frame(-28 + 6 * u, 1.7, 34, { minD: 4.3, margin: 0.8, lookY: 1.45 }));
  cut(0.62, (u) => orbit(E, 18, -32, u, 4.4, 1.8, 36, -0.1));
  cut(1.5, () => frame(5, 2.0, 44, { minD: 6, margin: 1.2 }));

  // ===================== PROVOKATIONEN =====================
  const P_ = (x) => T1 + x;
  act(N, P_(0.5), gloveBang(1.5)); act(N, P_(2.1), pointAt('R', 1.9)); act(N, P_(4.2), taunt(1.4)); act(N, P_(5.8), pointAt('L', 1.7));
  act(E, P_(1.0), wave(1.4)); act(E, P_(3.4), shrug(1.8)); act(E, P_(5.6), shrug(1.6));
  act(E, P_(8.3), shrug(4.2));
  act(N, P_(8.9), angry(3.8));
  for (let i = 0; i < 8; i++) steam(N, P_(9.4 + i * 0.4));
  at(P_(9.4), () => sfx('growl', 0.6));
  at(P_(12.6), () => { N.target.set(-1.0, 0, 0); E.target.set(1.0, 0, 0); N.smoothTime = 0.9; E.smoothTime = 0.9; ref.target.set(0, 0, -0.9); });
  act(N, P_(15.0), gloveBang(0.9)); act(E, P_(15.0), gloveBang(0.9));
  cut(P_(0.0), (u) => ({ pos: lv(V3(-3.5, 3.2, 7.0), V3(-2.4, 2.3, 6.4), u), look: V3(0, 1.3, 0), fov: 48 }));
  cut(P_(0.5), (u) => ({ pos: lv(N.pos.clone().add(V3(2.4, 0, 2.7)), N.pos.clone().add(V3(2.0, 0, 2.3)), u).setY(1.5), look: nh().add(V3(0.3, -0.4, 0)), fov: 34 }));
  cut(P_(4.0), (u) => ({ pos: lv(E.pos.clone().add(V3(-2.8, 0, 3.2)), E.pos.clone().add(V3(-2.4, 0, 2.9)), u).setY(1.4), look: eh().add(V3(-0.3, -0.4, 0)), fov: 34 }));
  cut(P_(5.6), (u) => ({ pos: lv(N.pos.clone().add(V3(1.9, 0, 2.5)), N.pos.clone().add(V3(1.5, 0, 2.1)), u).setY(1.75), look: nh(), fov: 28 }));
  cut(P_(8.0), (u) => ({ pos: lv(E.pos.clone().add(V3(-2.5, 0, 3.2)), E.pos.clone().add(V3(-2.1, 0, 2.8)), u).setY(1.6), look: eh().add(V3(0, -0.2, 0)), fov: 30 }));
  cut(P_(10.5), (u) => ({ pos: lv(N.pos.clone().add(V3(1.9, 0, 2.6)), N.pos.clone().add(V3(1.6, 0, 2.2)), u).setY(1.7), look: nh().add(V3(0, 0.05, 0)), fov: 30 }));
  cut(P_(12.6), (u) => frame(0, 1.5 + 0.2 * u, 46, { minD: 5.2, margin: 1.2, lookY: 1.35 }));
  cut(P_(14.9), (u) => frame(-10, 1.5, 36, { margin: 0.8, minD: 4.2 - 0.2 * u, lookY: 1.45 }));

  // ===================== RUNDE 1 =====================
  at(F - 0.5, () => { sfx('bell', 1); arena.bell.userData.ring = st.simT; excite(0.6); overlay.flash(0.3); N.smoothTime = 0.22; E.smoothTime = 0.22; overlay.pop('RUNDE 1', { x: 540, y: 760 }, { size: 170, fill: '#ffd24a', life: 1.0, rot: -4 }); });
  at(F - 0.4, () => sfx('crowd', 0.9));
  act(ref, F - 0.4, { dur: 0.55, fn(u, P) { const b = smooth(u / 0.2) * (1 - smooth(seg(u, 0.35, 0.55))); const h = P.hand.R; h.w = b; h.pos.set(-0.25 + 0.3 * smooth(u / 0.25), 1.0 - 0.55 * smooth(u / 0.25), 0.35 + 0.2 * smooth(u / 0.25)); P.face = 'shout'; P.torsoPitch += 0.1 * b; } });
  cut(F - 0.6, () => frame(3, 2.0, 44, { minD: 6, margin: 1.2 }));

  // --- Kombo 1: Newton greift an. Jab (Ausweichen), Kreuz (Ducken), Haken (Treffer)
  closeIn(F + 0.75, N, E, 1.45, 0.3);
  const j1 = strike({ hand: 'L', kind: 'jab', hit: false }); act(N, F + 1.0, j1); act(E, F + 1.0, slip(1, 0.55, 0.38)); whoosh(F + 1.05);
  const c1 = strike({ hand: 'R', kind: 'cross', hit: false, tA: 0.12, tS: 0.09, lunge: 0.32, twist: 0.8 }); act(N, F + 1.5, c1); act(E, F + 1.45, duck(0.6, 0.42)); whoosh(F + 1.55, 0.9);
  const h1 = strike({ hand: 'L', kind: 'hook', hit: true, tA: 0.17, tS: 0.12, lunge: 0.3, twist: 0.95, back: 0.3 }); act(N, F + 2.1, h1); whoosh(F + 2.2, 0.9);
  impact({ t: F + 2.1 + h1.tHit, from: N, to: E, power: 1.3, label: 'KLATSCH!', fill: '#ff4d6d', dmg: 10, who: 'E', size: 170 });
  at(F + 2.45, () => { E.target.add(V3(0.35, 0, 0.1)); });
  cut(F + 0.9, (u) => frame(25 - 10 * u, 1.8, 38, { margin: 0.9, minD: 5.0, lookY: 1.4 }));
  cut(F + 2.15, (u) => frame(-22 + 6 * u, 1.7, 36, { margin: 0.9, minD: 4.8, lookY: 1.45 }));

  // --- Konter: Einstein Jab, Kreuz, Haken
  closeIn(F + 3.0, E, N, 1.4, 0.25);
  const ej = strike({ hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 }); act(E, F + 3.2, ej); whoosh(F + 3.24, 0.7);
  impact({ t: F + 3.2 + ej.tHit, from: E, to: N, power: 0.9, label: 'PAFF!', dmg: 5, who: 'N', size: 140 });
  const ex = strike({ hand: 'R', kind: 'cross', hit: true, tA: 0.12, tS: 0.09, lunge: 0.32, twist: 0.8 }); act(E, F + 3.55, ex); whoosh(F + 3.6);
  impact({ t: F + 3.55 + ex.tHit, from: E, to: N, power: 1.5, label: 'BUMM!', fill: '#ff7a3a', dmg: 9, who: 'N', size: 180 });
  const eh2 = strike({ hand: 'L', kind: 'hook', hit: true, tA: 0.15, tS: 0.11, lunge: 0.3, twist: 0.9 }); act(E, F + 4.05, eh2); whoosh(F + 4.1);
  impact({ t: F + 4.05 + eh2.tHit, from: E, to: N, power: 1.8, label: 'KRACH!', fill: '#ffd24a', dmg: 11, who: 'N', size: 200 });
  slow(F + 4.22, F + 4.62, 0.35, 0.05);
  at(F + 4.35, () => { N.target.set(-1.9, 0, 0.1); N.smoothTime = 0.5; });
  cut(F + 3.0, (u) => frame(22 - 12 * u, 1.75, 36, { margin: 0.9, minD: 4.8, lookY: 1.4 }));
  cut(F + 4.0, (u) => orbit(N, -30, 15, u, 4.5, 1.8, 36, -0.1));

  // --- Newton greift an, Einstein blockt (Klonk), dann sitzt das Kreuz
  closeIn(F + 4.95, N, E, 1.4, 0.3); at(F + 4.9, () => { N.smoothTime = 0.25; });
  act(E, F + 4.95, block(1.0));
  const nb1 = strike({ hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 }); act(N, F + 5.1, nb1); whoosh(F + 5.14, 0.7);
  impact({ t: F + 5.1 + nb1.tHit, from: N, to: E, block: true, label: 'KLONK!' });
  const nb2 = strike({ hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 }); act(N, F + 5.45, nb2); whoosh(F + 5.49, 0.7);
  impact({ t: F + 5.45 + nb2.tHit, from: N, to: E, block: true, label: 'KLONK!' });
  const nb3 = strike({ hand: 'R', kind: 'cross', hit: true, tA: 0.12, tS: 0.09, lunge: 0.32, twist: 0.8 }); act(N, F + 5.82, nb3); whoosh(F + 5.88);
  impact({ t: F + 5.82 + nb3.tHit, from: N, to: E, power: 1.3, label: 'WUMM!', fill: '#ff7a3a', dmg: 8, who: 'E', size: 170 });
  cut(F + 4.9, (u) => frame(-14 + 8 * u, 1.7, 38, { margin: 0.9, minD: 5.0, lookY: 1.4 }));

  // --- Newton haut daneben, dreht sich, Einstein macht den Ali-Shuffle und tippt ihn an
  at(F + 6.7, () => { N.target.set(-0.9, 0, 0); E.target.set(0.8, 0, 0); N.smoothTime = 0.3; E.smoothTime = 0.3; });
  const hay = strike({ hand: 'R', kind: 'hook', hit: false, tA: 0.25, tS: 0.14, tH: 0.1, tR: 0.3, lunge: 0.4, twist: 1.4, back: 0.4 }); act(N, F + 7.0, hay); whoosh(F + 7.25, 1.0);
  act(E, F + 7.1, duck(0.75, 0.5)); act(N, F + 7.5, spinOut(0.9));
  at(F + 7.6, () => { fx.starsBurst(N.headWorld, 5, { speed: 2.5, size: 0.1 }); sfx('boing', 0.8); });
  act(E, F + 8.0, showboat(1.5));
  closeIn(F + 8.1, E, N, 1.25, 0.2);
  const tap = strike({ hand: 'L', kind: 'jab', hit: true, tA: 0.1, tS: 0.08, lunge: 0.15, twist: 0.3, face: 'happy' }); act(E, F + 8.55, tap);
  impact({ t: F + 8.55 + tap.tHit, from: E, to: N, tiny: true, label: 'PIEP!', dmg: 2, who: 'N' });
  act(N, F + 8.95, angry(1.2)); for (let i = 0; i < 3; i++) steam(N, F + 9.0 + i * 0.3);
  cut(F + 6.5, (u) => frame(10, 1.9, 42, { margin: 1.1, minD: 5.5, lookY: 1.3 }));
  cut(F + 8.0, (u) => frame(32 - 10 * u, 1.7, 38, { margin: 0.9, minD: 5.0, lookY: 1.4 }));
  cut(F + 9.0, (u) => ({ pos: lv(N.pos.clone().add(V3(2.8, 0.5, 3.4)), N.pos.clone().add(V3(2.5, 0.7, 3.0)), u), look: nh().add(V3(0, 0.5, 0)), fov: 40 }));

  // --- Apfel-Spezialattacke
  const callT = F + 9.2; const bonkT = F + 11.4;
  at(callT - 0.3, () => { N.target.set(-2.0, 0, 0); N.smoothTime = 0.4; });
  act(N, callT, callApple(1.5)); at(callT + 0.1, () => { sfx('hum', 0.8); excite(0.1); });
  APPLE.spawn = callT + 0.3; APPLE.hit = bonkT; APPLE.y0 = 8.6;
  at(APPLE.spawn, () => { apple.visible = true; sfx('swoosh', 0.7); });
  act(E, callT + 0.7, lookUp(1.0, 0.6));
  at(bonkT, () => {
    apple.visible = false; const hd = E.headWorld;
    E.springs.drop.kick(-5.5); E.springs.torsoPitch.kick(6); E.springs.headPitch.kick(9); E.springs.arms.kick(-10); E.hurtUntil = bonkT + 0.9;
    fx.burstSprite(hd.clone().add(V3(0, 0.3, 0.1)), 1.8, 0.3); fx.starsBurst(hd.clone().add(V3(0, 0.3, 0)), 14, { speed: 4.5, size: 0.2 });
    fx.bricksBurst(hd.clone().add(V3(0, 0.3, 0)), 26, { color: ['#e0141e', '#ff6a5a', '#fff2e0', '#35b24a'], speed: 4.5, size: 0.1, up: 2.5, spread: 1.2 });
    fx.puff(hd, 5, { size: 0.5, color: '#fff', life: 0.6 }); fx.ring(hd, { maxR: 2.0, life: 0.45, color: '#ffd24a' }); fx.flash(hd, bonkT);
    shake(0.14); st.fovPunch = 8; hitstop(0.09);
    const sp = project(hd); overlay.pop('BONK!', { x: clamp(sp.x, 200, 880), y: clamp(sp.y - 150, 380, 1400) }, { size: 210, fill: '#ff4d4d', rot: -9, life: 0.9 });
    overlay.flash(0.45); overlay.speedLines(0.55); sfx('bonk', 1.1); sfx('crowd', 0.9); excite(0.5); setHp('E', Math.max(0, hp.E - 22));
    apple.visible = true; appleVel.set(1.8, 3.2, 1.4); apple.userData.bounce = true; apple.userData.t0 = bonkT; apple.position.set(hd.x, hd.y + 0.28, hd.z);
  });
  act(E, bonkT + 0.02, dazed(1.4)); fx.dizzyStars(E, bonkT + 0.1, bonkT + 1.55);
  act(N, bonkT + 0.05, laugh(1.3));
  cut(callT, (u) => ({ pos: lv(N.pos.clone().add(V3(2.8, 0.5, 3.4)), N.pos.clone().add(V3(2.5, 0.7, 3.0)), u), look: nh().add(V3(0, 0.5, 0)), fov: 40 }));
  cut(callT + 0.3, (u) => { const hd = eh(); const ap = apple.position.clone(); return { pos: E.pos.clone().add(V3(2.6, 1.0, 3.2)), look: lv(ap, hd, smooth(Math.pow(u, 3))), fov: 48 - 12 * smooth(u) }; });
  cut(bonkT - 0.02, (u) => ({ pos: lv(E.pos.clone().add(V3(-2.0, 1.9, 2.4)), E.pos.clone().add(V3(-1.7, 1.85, 2.2)), u), look: eh(), fov: 27 }));
  cut(bonkT + 0.4, (u) => ({ pos: lv(V3(1.4, 1.0, -1.6), V3(1.1, 1.0, -2.0), u), look: V3(0, 0.45, -5.75), fov: 34 }));
  cut(bonkT + 1.2, (u) => frame(0, 2.0, 46, { margin: 1.3, minD: 6.5, lookY: 1.25 }));

  // --- Flurry: Einstein steht benommen an den Seilen
  const fl = F + 12.6;
  at(fl - 0.3, () => { E.target.set(2.55, 0, 0.1); E.smoothTime = 0.3; });
  closeIn(fl - 0.2, N, E, 1.3, 0.2);
  const f1 = strike({ hand: 'L', kind: 'jab', hit: true, tA: 0.09, tS: 0.07 }); act(N, fl, f1); whoosh(fl + 0.04, 0.7);
  impact({ t: fl + f1.tHit, from: N, to: E, power: 1.0, label: 'PAFF!', dmg: 8, who: 'E', size: 150 }); at(fl + f1.tHit, () => ropeWob(3, 0.08));
  const f2 = strike({ hand: 'R', kind: 'hook', hit: true, tA: 0.16, tS: 0.12, lunge: 0.3, twist: 0.95, back: 0.3 }); act(N, fl + 0.5, f2); whoosh(fl + 0.6);
  impact({ t: fl + 0.5 + f2.tHit, from: N, to: E, power: 1.3, label: 'KLATSCH!', fill: '#ff4d6d', dmg: 9, who: 'E', size: 170 }); at(fl + 0.5 + f2.tHit, () => ropeWob(3, 0.12));
  const f3 = strike({ hand: 'L', kind: 'cross', hit: true, tA: 0.12, tS: 0.09, lunge: 0.32, twist: 0.8 }); act(N, fl + 1.05, f3); whoosh(fl + 1.1, 0.9);
  impact({ t: fl + 1.05 + f3.tHit, from: N, to: E, power: 1.6, label: 'BUMM!', fill: '#ff7a3a', dmg: 10, who: 'E', size: 190 }); at(fl + 1.05 + f3.tHit, () => ropeWob(3, 0.18));
  const f4 = strike({ hand: 'L', kind: 'upper', hit: true, tA: 0.18, tS: 0.1, lunge: 0.3, twist: 0.5, back: 0.2 }); act(N, fl + 1.65, f4); whoosh(fl + 1.8, 0.9);
  impact({ t: fl + 1.65 + f4.tHit, from: N, to: E, power: 1.6, label: 'RUMMS!', fill: '#ffb347', dmg: 8, who: 'E', size: 180 }); at(fl + 1.65 + f4.tHit, () => ropeWob(3, 0.2));
  cut(fl - 0.5, () => frame(0, 2.0, 46, { margin: 1.3, minD: 6.5, lookY: 1.25 }));
  cut(fl - 0.1, (u) => frame(-34 + 12 * u, 1.65, 36, { margin: 0.85, minD: 4.6, lookY: 1.4 }));

  // --- Einstein: E=mc^2-Atomfaust
  const ch = F + 16.4;
  at(ch - 0.5, () => { N.target.set(0.55, 0, 0); N.smoothTime = 0.5; });
  act(E, ch, charge(1.25)); at(ch, () => { sfx('charge', 1); excite(0.4); });
  glow(ch, ch + 4.4); fx.setAura(E, ch, ch + 2.0, 1); fx.formulaOrbit(() => E.chestWorld, ch + 0.1, ch + 1.9);
  act(N, ch + 0.2, stare(1.0)); act(N, ch + 1.25, block(1.6));
  at(ch + 1.45, () => { E.target.set(N.pos.x + 1.15, 0, 0); E.smoothTime = 0.11; sfx('whoosh', 1); fx.puff(E.pos.clone().add(V3(0, 0.15, 0)), 5, { size: 0.5, color: '#ffe9a8', life: 0.5 }); });
  const up = strike({ hand: 'R', kind: 'upper', hit: true, tA: 0.2, tS: 0.1, tH: 0.18, tR: 0.5, lunge: 0.35, twist: 0.5, back: 0.2 });
  const upT = ch + 1.5; act(E, upT, up);
  const tUp = upT + up.tHit; A.upper = tUp;
  const VY = 6.6, landT = tUp + 2 * VY / 9.8; A.land = landT;
  slow(ch + 0.2, ch + 1.0, 0.6, 0.12); slow(tUp, tUp + 0.55, 0.4, 0.04);
  at(tUp, () => {
    const dir = horiz(E.pos, N.pos); N.hit(dir, 1.6, 'head', tUp); N.springs.arms.kick(-30); const p = N.headWorld;
    fx.burstSprite(p, 2.6, 0.34); fx.starsBurst(p, 26, { speed: 7, size: 0.24 });
    fx.bricksBurst(p, 40, { color: ['#ffd24a', '#fff', '#ffa31a'], speed: 6.5, size: 0.11, up: 3 });
    fx.bricksBurst(N.chestWorld, 16, { color: ['#d6202b', '#ff6a6a', '#fff'], speed: 5, size: 0.1, up: 2 });   // zersplitternde Deckung
    fx.ring(p, { maxR: 3.2, life: 0.55, color: '#ffe066' }); fx.ring(p, { maxR: 2.2, life: 0.4, color: '#ffffff' });
    fx.ring(N.pos.clone().add(V3(0, 0.05, 0)), { mode: 'ground', maxR: 3.4, life: 0.7, color: '#ffd24a' });
    fx.flash(p, tUp); fx.puff(p, 8, { size: 0.7, color: '#fff7d0', life: 0.8 });
    shake(0.3); st.fovPunch = 12; hitstop(0.14);
    const sp = project(p); overlay.pop('E = mc²!!', { x: 540, y: clamp(sp.y - 280, 420, 1100) }, { size: 250, fill: '#ffe14a', rot: -7, life: 1.15, stroke: 12 });
    overlay.flash(0.9); overlay.speedLines(0.95); sfx('boom', 1.3); excite(0.9); setHp('N', Math.max(0, hp.N - 60));
    ropeWob(2, 0.1); ropeWob(0, 0.05); ropeWob(1, 0.05);
    act(N, tUp, flight(tUp, { from: [N.pos.x, N.pos.z], v: [-1.9, 0, VY], spins: 1, hold: 9 }));
  });
  at(landT, () => {
    const p = N.pos.clone(); p.y = 0.2;
    fx.puff(p, 12, { size: 0.9, color: '#cfd3ff', life: 1.1, spread: 2.8, rise: 0.6 }); fx.ring(N.pos.clone().add(V3(0, 0.05, 0)), { mode: 'ground', maxR: 2.6, life: 0.7, color: '#ffffff' });
    fx.bricksBurst(p, 16, { color: ['#fff', '#cfd3ff'], speed: 3.2, size: 0.08, up: 2 }); fx.starsBurst(N.headWorld, 8, { speed: 3, size: 0.14 });
    ropeWob(2, 0.18); shake(0.2); hitstop(0.06); sfx('thud', 1.2); excite(0.5); overlay.flash(0.25);
    const sp = project(p); overlay.pop('WUMMS!', { x: clamp(sp.x, 220, 860), y: clamp(sp.y - 140, 420, 1300) }, { size: 170, fill: '#cfd3ff', rot: 7, life: 0.8 });
  });
  fx.dizzyStars(N, landT + 0.2, landT + 3.4);
  cut(ch - 0.3, (u) => ({ pos: lv(E.pos.clone().add(V3(-2.9, 0, 3.0)), E.pos.clone().add(V3(-2.6, 0, 2.7)), u).setY(1.7), look: eh().add(V3(0, -0.15, 0)), fov: 32 }));
  cut(ch + 0.5, (u) => { const a = lerp(-50, -5, sm(u)) * Math.PI / 180; const c = E.chestWorld; return { pos: V3(c.x + Math.sin(a) * 3.4, 0.8 + 0.5 * u, c.z + Math.cos(a) * 3.4), look: c.add(V3(0, 0.25, 0)), fov: 44 }; });
  cut(ch + 1.35, (u) => frame(-4, 1.5, 42, { margin: 1.1, minD: 5.6 - 0.4 * u, lookY: 1.4 }));
  cut(tUp + 0.55, (u) => { const n = N.headWorld; return { pos: V3(lerp(-0.2, -1.2, sm(u)) , 0.7 + 0.8 * sm(u), 5.7), look: V3(n.x, Math.max(n.y, 0.5) * 0.9 + 0.3, 0), fov: 52 }; });
  cut(landT, (u) => ({ pos: lv(N.pos.clone().add(V3(2.2, 3.5, 4.4)), N.pos.clone().add(V3(1.8, 3.0, 4.0)), u), look: N.pos.clone().add(V3(0, 0.3, 0)), fov: 44 }));

  // --- Auszaehlen, Newton steht auf, Cliffhanger
  A.bellEnd = landT + 9.6;
  act(E, landT + 0.5, victory(1.4));
  at(landT + 0.3, () => { ref.target.set(-1.3, 0, -0.95); ref.smoothTime = 0.3; });
  const cs = landT + 0.5;
  act(ref, cs, { dur: 3.2, fn(u, P) { const h = P.hand.R; h.w = 1; const beat = (u / 0.8) % 1; h.pos.set(-0.28, 0.55 + 0.55 * Math.sin(Math.PI * Math.min(1, beat * 1.2)), 0.35); P.torsoPitch += 0.15; P.face = 'shout'; } });
  ['1', '2', '3', '4'].forEach((n, i) => at(cs + 0.35 + i * 0.8, () => { const sp = project(N.pos.clone().add(V3(0, 1.3, 0))); overlay.pop(n, { x: clamp(sp.x, 200, 880), y: clamp(sp.y - 120, 420, 1300) }, { size: 190, fill: i === 3 ? '#ff4d4d' : '#ffffff', rot: i * 5 - 6, life: 0.6 }); sfx('count', 0.6); }));
  act(E, landT + 2.2, stare(1.8));
  const guT = landT + 3.5, guD = 2.4;
  act(N, guT, getUp(guD));
  at(guT + guD, () => { N.airborne = false; N.target.copy(N.pos); N.pos.y = 0; N.feetInit = false; N.smoothTime = 0.3; });
  at(guT + guD + 0.1, () => { sfx('crowd', 1.0); excite(0.6); const sp = project(N.headWorld); overlay.pop('NOCH NICHT!', { x: 540, y: clamp(sp.y - 260, 420, 1000) }, { size: 130, fill: '#ff6a6a', rot: -5, life: 1.0 }); });
  act(N, guT + guD, { dur: 3.2, fn(u, P) { P.face = 'grit'; P.torsoRoll += 0.06 * Math.sin(u * 7) * Math.exp(-u * 1.2); P.hipsDrop += 0.06 * Math.exp(-u * 1.5); } });
  at(A.bellEnd, () => { sfx('bell', 1); sfx('bell2', 1); arena.bell.userData.ring = st.simT; overlay.flash(0.35); excite(0.6); ref.target.set(-0.4, 0, 0.1); });
  act(ref, A.bellEnd, { dur: 1.2, fn(u, P) { for (const s of ['L', 'R']) { const h = P.hand[s]; h.w = Math.min(1, u * 4); h.pos.set(s === 'L' ? 0.5 : -0.5, 0.75, 0.3); } } });
  cut(landT + 0.9, (u) => ({ pos: lv(N.pos.clone().add(V3(1.6, 2.6, 4.6)), N.pos.clone().add(V3(1.2, 2.4, 4.2)), u), look: N.pos.clone().add(V3(0, 0.3, 0)), fov: 52 }));
  cut(guT - 0.1, (u) => ({ pos: lv(N.pos.clone().add(V3(2.2, 1.4, 3.8)), N.pos.clone().add(V3(1.8, 1.7, 3.5)), u), look: N.pos.clone().add(V3(0, 0.8, 0)), fov: 40 }));
  cut(guT + guD - 0.2, (u) => ({ pos: lv(N.pos.clone().add(V3(0.9, 0, 3.0)), N.pos.clone().add(V3(0.7, 0, 2.6)), u).setY(1.9), look: nh().add(V3(0.1, -0.1, 0)), fov: 28 }));
  cut(guT + guD + 2.0, (u) => ({ pos: lv(E.pos.clone().add(V3(-1.8, 0, 2.2)), E.pos.clone().add(V3(-1.5, 0, 2.0)), u).setY(1.6), look: eh(), fov: 28 }));
  cut(A.bellEnd - 0.4, (u) => frame(0, 2.4 + 0.4 * u, 46, { minD: 6.5, margin: 1.5, lookY: 1.3 }));

  const END = A.bellEnd + 5.6; A.end = END;
  const sorted = cuts.sort((a, b) => a.t - b.t);
  const shots = sorted.map((c, i) => ({ t0: c.t, t1: sorted[i + 1] ? sorted[i + 1].t : 999, fn: c.fn }));
  return {
    shots, T: {}, anchors: A, end: () => END,
    endcard: (simT) => { const t = simT - (A.bellEnd + 0.9); return t >= 0 ? { a: clamp(t / 0.5), s: 0.85 + 0.15 * easeOutCubic(clamp(t / 0.6)), html: '<div style="font-size:170px;color:#fff">RUNDE 2</div><div style="margin-top:4px;font-size:92px">FORTSETZUNG FOLGT!</div>' } : null; },
  };
}
