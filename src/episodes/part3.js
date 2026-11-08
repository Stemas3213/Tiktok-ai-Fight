// AI FIGHT CLUB - Part 3: Runde 3 (Finale). Dramaturgie: Schwerkraft kehrt zurueck -> Einstein am Boden (nahezu verloren) -> Auszaehlung -> absolute Stille (Herzschlag/Atmen) -> bei NEUN oeffnet er die Augen:
// "Du hast eine Sache vergessen, Isaac ... Zeit ist relativ." -> Comeback -> perfekt inszenierter entscheidender Treffer (Stille, Zeitlupe, Perspektive, Reaktion) -> Sieger Einstein, versoehnliches Ende.
import { strike, tired, breathe, weakRise, dropFrom, flight, getUp, kneel, victory, stare, laugh, panic, gloveBang, wave, shrug, duck, slip } from '../moves.js';
import { clamp, lerp, smooth, easeOutCubic, easeInQuad, seg } from '../util.js';

export async function build(ctx) {
  const { updaters, extra, music, mute, initHp, nh, eh, midP, lv, sm, frame, THREE, V3, N, E, ref, fx, overlay, arena, S, st, at, act, sfx, slow, impact, shake, excite, hitstop, setHp, hp, project, horiz, apple, appleShadow, appleVel, APPLE, scene, W, H } = ctx;
  const A = {}; const cuts = []; const cut = (t, fn) => cuts.push({ t, fn });
  document.getElementById('roundTxt').textContent = 'RUNDE 3';
  initHp(14, 20);

  const place = (f, x, z, yaw) => { f.pos.set(x, 0, z); f.target.copy(f.pos); f.vel.set(0, 0, 0); f.yaw = yaw; f.feetInit = false; for (const k in f.springs) { f.springs[k].x = 0; f.springs[k].v = 0; } f.hurtUntil = -1; };
  const closeIn = (t, att, def, dist = 1.4, sT = 0.25) => at(t, () => { const d = horiz(def.pos, att.pos); att.target.set(def.pos.x + d.x * dist, 0, def.pos.z + d.z * dist); att.smoothTime = sT; });
  const orbit = (who, a0, a1, u, r, h, fov, dy = 0) => { const a = lerp(a0, a1, u) * Math.PI / 180; return { pos: V3(who.pos.x + Math.sin(a) * r, h, who.pos.z + Math.cos(a) * r), look: who.headWorld.add(V3(0, dy, 0)), fov }; };
  const ropeWob = (side, amp) => arena.wobbleSide(side, amp, st.outT);
  const strikeAt = (f, t, o) => { const s = strike(o); act(f, t, s); at(t + 0.05, () => sfx('whoosh', 0.6)); return { t, tHit: t + s.tHit, s }; };
  const numeral = (n, who, big = false, color = '#ffffff') => { const sp = project(who.pos.clone().add(V3(0, 1.0, 0))); overlay.pop(String(n), { x: 540, y: clamp(sp.y - 140, 420, 1100) }, { size: big ? 330 : 240, fill: color, rot: 0, life: big ? 1.0 : 0.9, stroke: 12 }); };

  // Apfel: aus dem Bild (hat seine Schuldigkeit getan)
  apple.visible = false; apple.userData.rest = true; appleShadow.material.opacity = 0;
  place(N, -0.75, 0, Math.PI / 2); place(E, 0.55, 0, -Math.PI / 2); place(ref, 0.2, -1.8, 0);

  // ===================== 0: SCHWERELOS -> SCHWERKRAFT KEHRT ZURUECK =====================
  const SNAP = 2.2; A.snap = SNAP;
  const hover = (f, y, seed, pitchBase) => ({ dur: SNAP, fn(u, P) {
    f.airborne = true; P.y = y + 0.25 * Math.sin(u * 1.6 + seed); P.bodyPitch = 0.7 * Math.sin(u * 0.9 + seed) + pitchBase; P.bodyRoll = 0.4 * Math.sin(u * 0.7 + seed * 2); P.hipsY = 0.99;
    P.fk = { L: { hip: -0.5 + 0.3 * Math.sin(u * 1.3 + seed), knee: 0.8, splay: 0.2 }, R: { hip: -0.2 + 0.3 * Math.sin(u * 1.1 + seed), knee: 0.5, splay: -0.2 } };
    for (const sd of ['L', 'R']) { const h = P.hand[sd], s2 = sd === 'L' ? 1 : -1; h.w = 1; h.pos.set(s2 * (0.6 + 0.2 * Math.sin(u * 1.6 + s2)), 0.7 + 0.3 * Math.sin(u * 1.3 + s2 + seed), 0.1 + 0.2 * Math.sin(u * 1.1)); }
    P.face = 'shout'; P.hairPuff = Math.max(P.hairPuff, 0.8);
  } });
  const yN = 2.3, yE = 2.7, pN = 0.0, pE = -0.2;
  act(N, 0, hover(N, yN, 0, pN)); act(E, 0, hover(E, yE, 2.1, pE));
  updaters.push((t) => { extra.zg = t < SNAP ? 1 : 0; const k = t < SNAP ? 1 : 0; extra.tint = [-0.08 * k, -0.1 * k, 0.22 * k]; extra.sat = -0.1 * k; });
  at(0.0, () => { music(0.25); });
  // Zeitlupen-Schlag in der Luft
  act(N, 0.45, { dur: 1.3, fn(u, P, f) { const b = Math.sin(Math.PI * seg(u, 0, 1)); const h = P.hand.R; h.w = b; h.fn = (out) => { out.copy(f.rig.torso.worldToLocal(E.chestWorld)); }; P.torsoTwist += 0.8 * b; P.face = 'shout'; } });
  at(1.55, () => { E.springs.torsoPitch.kick(-3); E.springs.headPitch.kick(-4); E.springs.torsoRoll.kick(2); fx.starsBurst(E.chestWorld, 5, { speed: 1.5, size: 0.12, colors: ['#ffffff', '#9fe3ff'] }); fx.ring(E.chestWorld, { maxR: 1.2, life: 0.6, color: '#9fe3ff' }); sfx('hit', 0.5); shake(0.06); });
  slow(0.35, 2.1, 0.7, 0.25);
  // Schwerkraft schnappt zurueck
  const pAt = (amp, seed, base) => amp * Math.sin(SNAP * 0.9 + seed) + base;
  at(SNAP, () => {
    sfx('crash', 1.0); sfx('sub', 1.0); sfx('fall', 1.0); shake(0.1); music(3.0); overlay.flash(0.5);
    const yNow = N.pos.y + yN + 0.25 * Math.sin(SNAP * 1.6), yEn = yE + 0.25 * Math.sin(SNAP * 1.6 + 2.1);
    act(N, SNAP, dropFrom(SNAP, { y0: yNow, pitch0: pAt(0.7, 0, pN), flat: false }));
    act(E, SNAP, dropFrom(SNAP, { y0: yEn, pitch0: pAt(0.7, 2.1, pE), flat: true, lieYaw: -Math.PI / 2, hold: NINE + 5.4 - SNAP }));
    A.landN = SNAP + Math.sqrt(2 * yNow / 9.8); A.landE = SNAP + Math.sqrt(2 * yEn / 9.8);
    at(A.landN, () => { fx.puff(V3(N.pos.x, 0.2, N.pos.z), 8, { size: 0.7, color: '#cfd3ff', life: 0.9, spread: 2.2 }); shake(0.14); sfx('thud', 0.9); ropeWob(2, 0.1); });
    at(A.landE, () => { fx.puff(V3(E.pos.x, 0.2, E.pos.z), 12, { size: 0.9, color: '#cfd3ff', life: 1.1, spread: 2.8 }); fx.ring(E.pos.clone().add(V3(0, 0.05, 0)), { mode: 'ground', maxR: 2.8, life: 0.7, color: '#fff' }); shake(0.25); hitstop(0.1); sfx('thud', 1.3); ropeWob(3, 0.2); excite(0.8); setHp('E', 4); overlay.pop('WUMMS!', { x: 540, y: 1000 }, { size: 170, fill: '#cfd3ff', rot: 7, life: 0.8 }); music(0.7); });
  });
  act(E, SNAP + 1.2, breathe(30, 'closed', 0.9));    // Einstein bleibt liegen
  cut(0, (u) => ({ pos: lv(V3(-1.2, 1.0, 7.4), V3(0.4, 1.4, 7.0), u), look: V3(0, 3.5, 0), fov: 58 }));
  cut(1.2, (u) => ({ pos: V3(0.2, 1.3, 7.2), look: V3(0, 3.3, 0), fov: 56 }));
  cut(SNAP - 0.15, (u) => ({ pos: V3(0.4, 1.8, 7.4), look: V3(0, 2.0, 0), fov: 58 }));
  cut(SNAP + 0.75, (u) => ({ pos: lv(E.pos.clone().add(V3(1.9, 0.5, 2.5)), E.pos.clone().add(V3(1.5, 0.7, 2.2)), u), look: E.pos.clone().add(V3(0, 0.35, 0)), fov: 38 }));

  // ===================== 1: NEWTON TRIUMPHIERT (erschoepft), Schiedsrichter schickt ihn in die Ecke =====================
  const GL = SNAP + 1.5; A.gloat = GL;
  at(GL - 0.5, () => { N.defaultExpr = 'tired'; });
  act(N, A.landN ? A.landN : SNAP + 0.8, tired(14)); at(GL, () => { N.target.set(-0.7, 0, 0.2); N.smoothTime = 0.9; sfx('breath', 0.9); });
  act(N, GL + 3.5, { dur: 1.4, fn(u, P) { const b = Math.sin(Math.PI * seg(u, 0, 1)); const h = P.hand.R; h.w = b; h.pos.set(-0.2, 1.3, 0.1); P.face = 'happy'; P.torsoPitch -= 0.25 * b; } });   // Arm hoch fuers Publikum
  at(GL + 3.6, () => { sfx('crowd', 0.9); excite(0.5); });
  at(GL + 4.8, () => { ref.target.set(-0.2, 0, 0.5); ref.smoothTime = 0.4; });
  act(ref, GL + 5.0, { dur: 1.6, fn(u, P) { const b = bell(u, 0, 0.2, 1.6); const h = P.hand.R; h.w = b; h.pos.set(-0.65, 0.8, 0.45); P.torsoTwist += 0.3 * b; P.face = 'shout'; } });
  at(GL + 5.4, () => { N.target.set(-2.6, 0, -2.5); N.smoothTime = 1.2; });
  cut(GL - 0.2, (u) => ({ pos: lv(N.pos.clone().add(V3(2.4, 0, 1.3)), N.pos.clone().add(V3(2.0, 0, 1.1)), u).setY(1.3), look: nh().add(V3(0, -0.1, 0)), fov: 30 }));
  cut(GL + 3.2, (u) => frame(6, 1.9, 44, { minD: 6.0, margin: 1.4, lookY: 1.2 }));
  cut(GL + 5.0, (u) => ({ pos: lv(V3(-0.4, 1.3, 4.8), V3(-1.2, 1.4, 4.2), u), look: V3(-1.2, 0.9, -0.8), fov: 42 }));
  function bell(t, a, b, c) { return t < b ? smooth(seg(t, a, b)) : 1 - smooth(seg(t, b, c)); }

  // ===================== 2: DIE AUSZAEHLUNG =====================
  const CNT = GL + 6.4; A.count = CNT;
  at(CNT, () => { music(0.9); sfx('crowd', 1.0); });
  const nums = [[1, 0.4], [2, 1.3], [3, 2.2], [4, 3.1], [5, 5.5], [6, 7.0], [7, 8.4], [8, 9.7], [9, 10.9]];
  const NINE = CNT + 10.9; A.nine = NINE;
  nums.forEach(([n, o]) => at(CNT + o, () => { numeral(n, E, false, n >= 7 ? '#ff6a6a' : '#ffffff'); sfx('count', 0.9); if (n <= 4) { sfx('cheer', 0.5 + 0.1 * n); excite(0.1); } }));
  // Referee-Haende (Schlag zu jeder Zahl)
  act(ref, CNT, { dur: 12.5, fn(u, P) { let b = 0; for (const [, o] of nums) { const d = u - o; if (d >= 0) b = Math.max(b, Math.exp(-d * 4)); } const h = P.hand.R; h.w = 1; h.pos.set(-0.28, 0.5 + 0.75 * b, 0.35); P.torsoPitch += 0.18; P.face = u < 5.4 ? 'shout' : 'neutral'; } });
  at(CNT - 0.5, () => { ref.target.set(0.4, 0, 0.9); ref.smoothTime = 0.5; });
  // Stille: nur Herzschlag und Atmen
  const HUSH = CNT + 4.6; A.hush = HUSH; const HD = NINE - HUSH + 0.3;
  at(HUSH, () => { mute(HD, 0.5); music(0.2); });
  [0.4, 1.5, 2.5, 3.4, 4.3, 5.1, 5.8, 6.4].forEach((o, i) => at(HUSH + o, () => sfx('heart', 0.9 + 0.03 * i)));
  at(HUSH + 1.4, () => sfx('breath', 0.8)); at(HUSH + 3.6, () => sfx('breath', 0.9)); at(HUSH + 5.0, () => sfx('breath', 0.7));
  act(N, CNT + 1.0, { dur: 12, fn(u, P) { P.face = u < 4 ? 'happy' : u < 8 ? 'tired' : 'shock'; const b = Math.sin(u * 7); P.torsoPitch += 0.2 + 0.05 * b; P.hipsDrop += 0.12; P.guardW = 0.3; P.hairDroop = 0.4; } });
  act(E, CNT + 7.5, { dur: 3.5, fn(u, P) { const h = P.hand.L; h.w = smooth(seg(u, 0, 0.1)) * (1 - smooth(seg(u, 0.4, 0.5))); h.pos.set(0.45, 0.2, -0.1); P.torsoRoll += 0.03 * Math.sin(u * 20) * h.w; } }); // Finger zuckt
  cut(CNT - 0.3, (u) => ({ pos: lv(V3(1.4, 1.8, 4.8), V3(1.0, 1.6, 4.4), u), look: eh().add(V3(-0.6, 0.0, 0)), fov: 48 }));
  cut(CNT + 3.4, (u) => ({ pos: lv(eh().add(V3(-1.5, 2.2, 2.2)), eh().add(V3(-1.2, 1.8, 1.8)), u), look: eh().add(V3(-0.3, 0, 0)), fov: 36 }));        // Einsteins Gesicht liegend (Naheinstellung, sehr langsame Annaeherung)
  cut(HUSH + 1.6, (u) => ({ pos: lv(N.pos.clone().add(V3(2.2, 0, 2.2)), N.pos.clone().add(V3(1.9, 0, 1.9)), u).setY(1.6), look: nh(), fov: 26 }));           // Newton in der Ecke, Zweifel
  cut(HUSH + 3.1, (u) => ({ pos: V3(0.9, 0.35, 2.2), look: V3(0.9, 0.9, 0), fov: 34 }));                                                                    // Schiedsrichter-Hand (Untersicht)
  cut(HUSH + 4.5, (u) => ({ pos: lv(eh().add(V3(-1.0, 1.7, 1.7)), eh().add(V3(-0.75, 1.3, 1.3)), u), look: eh().add(V3(-0.1, 0, 0)), fov: lerp(32, 26, u) }));  // Naheinstellung Gesicht
  cut(NINE - 0.3, (u) => ({ pos: eh().add(V3(0.0, 2.1, 0.5)), look: eh().add(V3(0, -0.02, 0)), fov: lerp(30, 25, u) }));                                                     // extreme Nahaufnahme: Augen

  // Belichtung/Bloom in den Gesichts-Naheinstellungen absenken (sonst weisse Flaechen)
  const baseExp = ctx.world.renderer.toneMappingExposure, baseBloom = ctx.world.bloom.strength;
  updaters.push((t) => { const w = t >= CNT + 3.0 && t < NINE + 2.6; ctx.world.renderer.toneMappingExposure = w ? baseExp * 0.62 : baseExp; ctx.world.bloom.strength = w ? 0.06 : baseBloom; });
  // ===================== 3: BEI NEUN: AUGEN AUF -> COMEBACK =====================
  at(NINE, () => { E.defaultExpr = 'resolve'; sfx('sub', 0.7); music(0.3); numeral('9', E, true, '#ff4d4d'); });
  act(E, NINE, { dur: 5.1, fn(u, P) { P.face = 'resolve'; P.hairDroop = Math.max(P.hairDroop, 0.9); P.torsoPitch += 0.04 * Math.sin(u * 3); } });   // Augen offen, noch liegend
  const RISE = NINE + 5.1; A.rise = RISE;
  at(RISE - 0.5, () => { music(5); });
  at(RISE, () => { N.defaultExpr = 'shock'; });
  act(E, RISE, getUp(3.6)); act(E, RISE, weakRise(3.6));
  at(RISE + 3.6, () => { E.airborne = false; E.target.copy(E.pos); E.pos.y = 0; E.feetInit = false; E.smoothTime = 0.4; E.defaultExpr = 'resolve'; });
  act(N, RISE + 0.9, { dur: 3, fn(u, P) { P.face = 'shock'; P.guardW = 0.3; P.torsoPitch += -0.15; P.hipsDrop += 0.05; P.headPitch += -0.1; } });
  at(RISE + 1.4, () => { N.target.set(-2.3, 0, -2.0); N.smoothTime = 0.8; sfx('crowd', 0.6); });
  at(RISE + 1.8, () => { sfx('cheer', 1.0); excite(0.9); });
  at(RISE + 3.2, () => { overlay.flash(0.2); });
  act(ref, RISE + 3.0, { dur: 1.2, fn(u, P) { const h = P.hand.R; h.w = smooth(seg(u, 0, 0.2)); h.pos.set(-0.2, 1.0, 0.4); P.face = 'shout'; } });
  // Kranfahrt: vom Boden aufwaerts, um den aufstehenden Einstein herum
  cut(NINE + 1.2, (u) => { const a = lerp(-70, -15, sm(u)) * Math.PI / 180; const p = E.pos.clone(); return { pos: V3(p.x + Math.sin(a) * 2.4, lerp(0.25, 1.9, sm(u)), p.z + Math.cos(a) * 2.4), look: E.headWorld.add(V3(0, lerp(-0.8, 0.0, sm(u)), 0)), fov: 38 }; });
  cut(RISE + 3.1, (u) => frame(10, 1.8, 40, { minD: 5.6, margin: 1.2, lookY: 1.3 }));

  // ===================== 4: LETZTER SCHLAGABTAUSCH, ENTSCHEIDENDER TREFFER =====================
  const FB = RISE + 4.6; A.fight = FB;
  at(FB - 1.5, () => { ref.target.set(0.2, 0, -1.9); ref.smoothTime = 0.5; });
  at(FB - 0.5, () => { music(6); N.defaultExpr = 'grit'; N.target.set(E.pos.x - 1.3, 0, 0); N.smoothTime = 0.4; E.target.set(E.pos.x, 0, 0); sfx('riser', 1.0); });
  act(N, FB - 0.3, { dur: 0.6, fn(u, P) { P.face = 'shout'; } });
  const f1 = strikeAt(N, FB + 0.3, { hand: 'L', kind: 'jab', hit: true, tA: 0.14, tS: 0.1 });
  impact({ t: f1.tHit, from: N, to: E, power: 0.9, label: 'PAFF!', dmg: 0, size: 130 });
  const f2 = strikeAt(N, FB + 1.0, { hand: 'R', kind: 'hook', hit: true, tA: 0.2, tS: 0.14, lunge: 0.3, twist: 0.95 });
  impact({ t: f2.tHit, from: N, to: E, power: 1.2, label: 'KLATSCH!', fill: '#ff4d6d', dmg: 0, size: 160 });
  at(f1.tHit + 0.05, () => { setHp('E', 3); E.target.add(V3(0.2, 0, 0)); }); at(f2.tHit, () => { setHp('E', 2); });
  const f3 = strikeAt(N, FB + 1.8, { hand: 'L', kind: 'cross', hit: true, tA: 0.2, tS: 0.12, lunge: 0.3, twist: 0.8 });
  impact({ t: f3.tHit, from: N, to: E, power: 1.4, label: 'WUMM!', fill: '#ff7a3a', dmg: 0, size: 175 });
  at(f3.tHit, () => { setHp('E', 1); });
  act(E, f3.tHit + 0.1, kneel(1.2));                      // Treffer haben Konsequenzen: Einstein geht in die Knie
  // Einstein kaempft sich hoch, Newton ist leer
  act(N, FB + 2.9, tired(1.8)); at(FB + 3.0, () => { sfx('breath', 0.9); });
  act(E, FB + 3.4, { dur: 1.4, fn(u, P) { const k = smooth(u / 1.4); P.hipsDrop += 0.5 * (1 - k); P.torsoPitch += 0.45 * (1 - k); P.face = 'resolve'; P.hairDroop = 0.6; for (const sd of ['L', 'R']) { const h = P.hand[sd]; h.w = 1 - k; h.pos.set(sd === 'L' ? 0.3 : -0.3, 0.25, 0.3); } } });
  at(FB + 3.6, () => { E.target.set(0.5, 0, 0); E.smoothTime = 0.7; N.target.set(-1.0, 0, 0); N.smoothTime = 0.6; music(6); });
  // Stille vor dem Treffer
  const TH0 = FB + 5.2, HAY = TH0 + 0.9, CROSS = HAY + 0.1;
  at(TH0 - 0.4, () => { mute(2.5, 0.2); music(0.2); });
  at(TH0, () => sfx('heart', 1)); at(TH0 + 0.35, () => sfx('heart', 1)); at(TH0 + 0.6, () => sfx('breath', 0.9));
  // Newtons verzweifelter Wild-Haken (Zeitlupe) - Einstein taucht darunter weg und kontert mit der Geraden
  const hay = strikeAt(N, HAY - 0.6, { hand: 'R', kind: 'hook', hit: false, tA: 0.5, tS: 0.3, tH: 0.1, tR: 0.5, lunge: 0.45, twist: 1.4, back: 0.4 });
  act(E, HAY - 0.35, duck(0.9, 0.5));
  const cx = strikeAt(E, CROSS, { hand: 'R', kind: 'cross', hit: true, tA: 0.3, tS: 0.2, tH: 0.2, tR: 0.7, lunge: 0.4, twist: 0.9, back: 0.25, face: 'resolve' });
  const TH = cx.tHit; A.hit = TH;
  slow(HAY - 0.7, TH + 1.6, 0.3, 0.25);
  const wig = N.rig.wig; const wv = V3(), wp = V3(); let wigFlying = false;
  updaters.push((t, h) => { if (!wigFlying) return; wv.y -= 9.8 * h; wp.addScaledVector(wv, h); if (wp.y < 0.3) { wp.y = 0.3; wv.set(wv.x * 0.2, 0, wv.z * 0.2); } wig.position.copy(wp); wig.rotation.x += 2.4 * h; wig.rotation.z += 3.1 * h; });
  at(TH, () => {
    const dir = horiz(E.pos, N.pos); N.hit(dir, 2.2, 'head', TH); N.springs.headPitch.kick(-6); N.springs.torsoPitch.kick(-2);
    const p = N.headWorld; fx.ring(p, { maxR: 1.6, life: 0.7, color: '#ffffff', opacity: 0.6 });
    fx.bricksBurst(p, 16, { color: ['#bfe9ff', '#ffffff'], speed: 1.6, size: 0.04, up: 0.8, life: 2.4 });      // Schweisstropfen in Zeitlupe
    shake(0.05); st.fovPunch = 3; hitstop(0.25); sfx('tap', 1.2); setHp('N', 0);
    scene.attach(wig); wp.copy(wig.position); wv.set(-1.4, 3.0, 0.5); wigFlying = true;                              // Perueckenflug
    N.defaultExpr = 'hurt';
  });
  at(TH + 0.2, () => { sfx('sub', 1.4); overlay.flash(0.35); });
  const FALLT = TH + 0.2; const gfall = 3.4, vzf = 2.2, LAND = FALLT + 2 * vzf / gfall; A.land = LAND;
  at(FALLT, () => act(N, FALLT, flight(FALLT, { from: [N.pos.x, N.pos.z], v: [-0.45, 0, vzf], g: gfall, spins: 0, hold: 4.4 })));   // endet genau, wenn Newton aufsteht (NUP = LAND + 4.4)
  at(LAND, () => { fx.puff(V3(N.pos.x, 0.2, N.pos.z), 10, { size: 0.8, color: '#cfd3ff', life: 1.2, spread: 2.4 }); ropeWob(2, 0.16); shake(0.18); sfx('thud', 1.2); music(7); excite(0.8); sfx('cheer', 1.2); sfx('crowd', 1.0); });
  act(E, TH + 0.3, { dur: 5, fn(u, P) { const k = smooth(seg(u, 0.5, 2.2)); P.face = 'resolve'; P.hipsDrop += 0.3 * k; P.torsoPitch += 0.3 * k; P.hairDroop = 0.5; for (const sd of ['L', 'R']) { const h = P.hand[sd]; h.w = k; h.pos.set(sd === 'L' ? 0.3 : -0.3, 0.2, 0.3); } } });   // erschoepft
  // Kamera: Naheinstellung Newtons Gesicht, Perspektivwechsel, Zeitlupen-Fall
  cut(TH0 - 1.4, (u) => ({ pos: lv(N.pos.clone().add(V3(1.7, 0, 1.7)), N.pos.clone().add(V3(1.5, 0, 1.5)), u).setY(1.7), look: nh().add(V3(0, -0.05, 0)), fov: 26 }));
  cut(TH0 - 0.2, (u) => ({ pos: lv(E.pos.clone().add(V3(-1.1, 0, 1.5)), E.pos.clone().add(V3(-0.9, 0, 1.3)), u).setY(1.78), look: eh().add(V3(0, 0.0, 0)), fov: 18 }));       // Einsteins Augen
  cut(HAY - 0.6, (u) => frame(-6, 1.3, 38, { minD: 4.6, margin: 0.9, lookY: 1.45 }));                                                                                 // niedrige Totale: Haken, Ducken
  cut(CROSS + 0.3, (u) => { const mx = (N.pos.x + E.pos.x) / 2; return { pos: V3(mx, 1.7, 5.6), look: V3(mx, 1.68, 0), fov: 30 }; });   // klares Seitenprofil: Faust -> Gesicht
  cut(TH + 0.12, (u) => { const a = lerp(-25, 60, sm(u)) * Math.PI / 180; const p = N.headWorld; return { pos: V3(p.x + Math.sin(a) * 3.6, lerp(0.9, 1.6, sm(u)), p.z + Math.cos(a) * 3.6), look: p.add(V3(0, -0.1, 0)), fov: 34 }; });   // Orbit um den fallenden Newton
  cut(LAND - 0.4, (u) => ({ pos: lv(V3(-1.0, 2.9, 4.4), V3(-0.6, 2.4, 4.0), u), look: N.pos.clone().add(V3(0.5, 0.2, 0)), fov: 46 }));

  // ===================== 5: SIEG, VERSOEHNLICHES ENDE =====================
  const TEN = LAND + 3.0; A.ten = TEN;
  at(LAND + 0.3, () => { ref.target.set(-0.8, 0, 0.9); ref.smoothTime = 0.35; });
  const cn = [[5, 0.4], [6, 0.9], [7, 1.4], [8, 1.9], [9, 2.4], [10, 2.9]];
  cn.forEach(([n, o]) => at(LAND + o, () => { numeral(n, N, n === 10, n === 10 ? '#ffd24a' : '#ffffff'); sfx('count', 0.8); }));
  act(ref, LAND + 0.2, { dur: 3.2, fn(u, P) { let b = 0; for (const [, o] of cn) { const d = u - (o - 0.2); if (d >= 0) b = Math.max(b, Math.exp(-d * 5)); } const h = P.hand.R; h.w = 1; h.pos.set(-0.28, 0.5 + 0.75 * b, 0.35); P.torsoPitch += 0.18; P.face = 'shout'; } });
  at(TEN, () => {
    sfx('bell', 1); sfx('bellKO', 1); arena.bell.userData.ring = st.simT; overlay.flash(0.5); excite(1.3); music(7);
    fx.confettiBurst(V3(0.3, 3.4, 0), 260); fx.confettiBurst(V3(-1.2, 3.0, 0), 120);
  });
  act(ref, TEN, { dur: 6, fn(u, P) { const h = P.hand.R; h.w = smooth(seg(u, 0, 0.2)); h.pos.set(-0.2, 1.1 + 0.1 * Math.sin(u * 9), 0.2); P.face = 'shout'; } });
  at(TEN, () => { ref.target.set(0.3, 0, 0.9); ref.smoothTime = 0.5; E.target.set(0.5, 0, 0.3); });
  act(E, TEN + 0.6, victory(8)); act(E, TEN + 0.6, { dur: 8, fn(u, P) { P.face = u < 2.5 ? 'tired' : 'happy'; P.hairDroop = Math.max(0, 0.5 - u * 0.2); P.hairPuff = Math.max(P.hairPuff, 0.1 + 0.1 * u); P.hipsDrop += 0.15 * Math.exp(-u); } });
  const NUP = TEN + 1.4; act(N, NUP, getUp(2.0));
  at(NUP + 2.0, () => { N.airborne = false; N.target.set(-0.9, 0, 0.3); N.pos.y = 0; N.feetInit = false; N.smoothTime = 0.8; N.defaultExpr = 'smug'; });
  act(N, NUP + 2.0, { dur: 7, fn(u, P) { P.face = u < 1.0 ? 'dizzy' : 'happy'; P.hipsDrop += 0.05; P.torsoPitch += 0.1 * Math.exp(-u); } });
  act(N, NUP + 4.0, gloveBang(1.0)); act(E, NUP + 4.0, gloveBang(1.0));
  at(NUP + 4.2, () => { sfx('tap', 1.0); excite(0.4); });
  cut(LAND + 0.5, (u) => ({ pos: lv(V3(-0.4, 1.4, 4.4), V3(-0.6, 1.6, 4.0), u), look: N.pos.clone().add(V3(0.6, 0.6, -0.1)), fov: 42 }));
  cut(TEN - 0.5, (u) => ({ pos: lv(E.pos.clone().add(V3(-2.4, 0, 3.0)), E.pos.clone().add(V3(-2.0, 0, 2.6)), u).setY(1.4), look: eh().add(V3(0, -0.1, 0)), fov: 30 }));
  cut(NUP + 1.8, (u) => frame(4, 1.8, 42, { minD: 5.8, margin: 1.3, lookY: 1.3 }));
  cut(NUP + 4.2, (u) => ({ pos: lv(E.pos.clone().add(V3(-2.3, 0, 2.9)), E.pos.clone().add(V3(-1.7, 0, 2.3)), u).setY(1.6), look: eh().add(V3(0, -0.15, 0)), fov: 32 }));

  A.end = NUP + 8.2; const END = A.end;
  const sorted = cuts.sort((a, b) => a.t - b.t);
  const shots = sorted.map((c, i) => ({ t0: c.t, t1: sorted[i + 1] ? sorted[i + 1].t : 999, fn: c.fn }));
  return {
    shots, T: {}, anchors: A, end: () => END,
    endcard: (simT) => { const t = simT - (NUP + 4.8); return t >= 0 ? { a: clamp(t / 0.5), s: 0.85 + 0.15 * easeOutCubic(clamp(t / 0.6)), html: '<div style="font-size:92px;color:#fff;white-space:nowrap">EINSTEIN GEWINNT!</div><div style="margin-top:10px;font-size:54px;color:#ffd24a">DAS FINALE</div>' } : null; },
  };
}
