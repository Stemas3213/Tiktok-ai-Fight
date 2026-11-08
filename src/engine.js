// Engine: Simulation (Sim-Zeit/Zeitlupe/Hit-Stop), Kamera-Regie, Effekt-Helfer, Dialog-Cues, SFX-Events. Der Ablauf einer Folge steht in src/episodes/<id>.js
import * as THREE from 'three';
import { FX } from './fx.js';
import { Overlay } from './overlay.js';
import { Referee, Commentator } from './extras.js';
import { strike, slip, duck, block, lookUp, dazed, laugh, callApple, charge, victory, warmup, taunt, stare, flight } from './moves.js';
import { clamp, lerp, smooth, easeOutCubic, bell, seg } from './util.js';
import { FLOOR_Y } from './arena.js';
import { buildScript, loadScript } from './script.js';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export async function createFight(world, episodeId = 'test-fight') {
  const { scene, camera, arena, newton: N, einstein: E, W, H } = world;
  const fx = new FX(scene, camera);
  const overlay = new Overlay(world);
  const S = buildScript(await loadScript(episodeId));   // Dialog-Cues (Text, Sprecher, Sim-Start, geschaetzte Dauer)

  // ---- Figuren aufstellen ----
  N.defaultExpr = 'smug'; E.defaultExpr = 'neutral';
  N.pos.set(-2.75, 0, 0); N.target.copy(N.pos); E.pos.set(2.75, 0, 0); E.target.copy(E.pos);
  N.yaw = Math.PI / 2; E.yaw = -Math.PI / 2;
  const mid = { pos: V3() };
  const ref = new Referee({ pos: [0.2, -1.4], yaw: 0 }); ref.opp = mid; ref.target.set(0.2, 0, -1.4);
  scene.add(ref.root);
  const deskPos = V3(0, FLOOR_Y, -5.75);
  const comm = new Commentator(deskPos); scene.add(comm.root);
  const commLook = V3();
  comm.lookAt = () => commLook;
  comm.speaking = () => S.speaking('K', st.outT);
  let exciteV = 0.3;
  comm.excite = () => clamp((exciteV - 0.3) * 1.2);

  // ---- Apfel (Prop) ----
  const apple = new THREE.Group();
  const aBody = new THREE.Mesh(new THREE.SphereGeometry(0.34, 28, 20), new THREE.MeshStandardMaterial({ color: '#e0141e', roughness: 0.22, metalness: 0.05 })); aBody.scale.set(1, 0.92, 1); aBody.castShadow = true; apple.add(aBody);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.2, 8), new THREE.MeshStandardMaterial({ color: '#5a3a1a' })); stem.position.y = 0.34; stem.rotation.z = 0.2; apple.add(stem);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshStandardMaterial({ color: '#35b24a' })); leaf.scale.set(1.6, 0.25, 0.8); leaf.position.set(0.16, 0.42, 0); leaf.rotation.z = 0.5; apple.add(leaf);
  apple.visible = false; scene.add(apple);
  const appleShadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.0, depthWrite: false }));
  appleShadow.rotation.x = -Math.PI / 2; appleShadow.position.y = 0.02; scene.add(appleShadow);
  const APPLE = { spawn: 1e9, hit: 1e9, y0: 8.6 };
  let appleHeadY = 2.1, appleX = 0, appleZ = 0, appleDone = false, appleVel = V3();

  // ---- Zeitplan ----
  const events = []; const at = (t, fn) => events.push({ t, fn });
  const act = (f, t0, a) => { f.actions.push({ fn: a.fn, t0, dur: a.dur }); return a; };
  const audio = []; const sfx = (kind, vol = 1, extra = {}) => audio.push({ t: st.outT, kind, vol, ...extra });
  const st = { simT: 0, outT: 0, freeze: 0, shakeAmp: 0, fovPunch: 0, done: false, ended: false, slowTable: [], landT: 0 };
  const slow = (t0, t1, s, edge = 0.08) => st.slowTable.push({ t0, t1, s, edge });
  const scaleAt = (t) => {
    let s = 1;
    for (const w of st.slowTable) { const a = smooth((t - w.t0) / w.edge), b = 1 - smooth((t - (w.t1 - w.edge)) / w.edge); s = Math.min(s, lerp(1, w.s, Math.min(a, b))); }
    return s;
  };

  const glows = []; const glow = (t0, t1) => glows.push({ t0, t1 });
  const glowAt = (t) => { let g = 0; for (const w of glows) g = Math.max(g, Math.min(smooth((t - w.t0) / 0.35), 1 - smooth((t - (w.t1 - 0.4)) / 0.4))); return g; };
  // ---- Effekt-Helfer ----
  const project = (v) => overlay.project(v);
  const horiz = (a, b) => V3(b.x - a.x, 0, b.z - a.z).normalize();
  const shake = (a) => { st.shakeAmp = Math.max(st.shakeAmp, a); };
  const excite = (a) => { exciteV = Math.min(1.5, exciteV + a); };
  const hitstop = (s) => { st.freeze = Math.max(st.freeze, s); };
  const hp = { N: 100, E: 100 };
  const setHp = (who, v) => { hp[who] = v; overlay.setHealth(who === 'N' ? 'L' : 'R', v / 100); };

  function impact({ t, from, to, power = 1, kind = 'head', label, fill = '#ffd24a', size = 150, dmg = 5, who, push = true, big = false, block = false, tiny = false, hs = true }) {
    at(t, () => {
      const dir = horiz(from.pos, to.pos);
      if (block) {
        to.hit(dir, 0.3, 'body', t); to.hurtUntil = -1;
        const p = to.headWorld.clone().addScaledVector(from.fwd(), -0.35); p.y -= 0.15;
        fx.starsBurst(p, 6, { speed: 3.5, size: 0.1, colors: ['#ffffff', '#cfe9ff'] }); fx.ring(p, { maxR: 0.9, life: 0.28, color: '#cfe9ff' }); fx.flash(p, t);
        shake(0.05); hitstop(0.04); const sp = project(p);
        overlay.pop(label || 'KLONK!', { x: clamp(sp.x, 200, 880), y: clamp(sp.y - 110, 360, 1500) }, { size: 120, fill: '#cfe9ff', rot: dir.x > 0 ? 6 : -6, life: 0.55 });
        sfx('block', 0.9); excite(0.08); return;
      }
      if (tiny) {
        to.hit(dir, 0.35, 'head', t); const p = to.headWorld;
        fx.starsBurst(p, 4, { speed: 2.5, size: 0.1 }); const sp = project(p); shake(0.03);
        overlay.pop(label || 'PIEP!', { x: clamp(sp.x, 200, 880), y: clamp(sp.y - 120, 360, 1500) }, { size: 110, fill: '#fff2a8', rot: -5, life: 0.5 });
        sfx('tap', 0.9); excite(0.1); if (who) setHp(who, Math.max(0, hp[who] - dmg)); return;
      }
      if (push) to.hit(dir, power, kind, t); else { to.hurtUntil = t + 0.8; }
      const p = kind === 'head' ? to.headWorld : to.chestWorld;
      const toward = V3(-dir.x, 0, -dir.z);
      fx.burstSprite(p.clone().addScaledVector(toward, 0.15), 1.05 + 0.5 * power, 0.26);
      fx.starsBurst(p, 5 + Math.round(power * 4), { speed: 3 + power * 2.5, size: 0.14 + power * 0.03 });
      fx.bricksBurst(p, 8 + Math.round(power * 6), { speed: 3 + power * 2, dir, up: 1.5 });
      fx.puff(p, 3 + Math.round(power * 2), { size: 0.35, color: '#fff', life: 0.5, spread: 1.6 });
      fx.ring(p, { maxR: 1.0 + power * 0.7, life: 0.4, color: big ? '#ffd24a' : '#ffffff' });
      fx.flash(p, t);
      shake(0.045 + 0.05 * power); st.fovPunch = Math.max(st.fovPunch, 3 + power * 2.5);
      if (hs) hitstop(0.045 + 0.03 * power);
      const sp = project(p);
      overlay.pop(label, { x: clamp(sp.x + (dir.x > 0 ? 130 : -130), 190, 890), y: clamp(sp.y - 130, 360, 1500) }, { size: size + power * 22, fill, rot: (dir.x > 0 ? 1 : -1) * (6 + 5 * power) });
      overlay.flash(0.18 + 0.1 * power); overlay.speedLines(0.25 + 0.15 * power);
      sfx(big ? 'bigHit' : power > 1 ? 'hit2' : 'hit', clamp(0.55 + power * 0.25, 0, 1.2));
      excite(0.2 * power);
      if (who) setHp(who, Math.max(0, hp[who] - dmg));
    });
  }

  const nh = () => N.headWorld, eh = () => E.headWorld;
  const midP = () => V3((N.pos.x + E.pos.x) / 2, 1.3, (N.pos.z + E.pos.z) / 2);
  const lv = (a, b, t) => a.clone().lerp(b, t);
  const sm = smooth;
  // Automatischer Bildausschnitt fuer 9:16: Kamera auf Kreisbahn um die Mitte, Abstand so, dass beide Figuren ins Bild passen (max. Radius: LED-Banden).
  const MAXD = 5.7;
  const frame = (deg, h, fov, { margin = 0.9, minD = 4.2, lookY = 1.3, lookOff = 0, who = null } = {}) => {
    const a = deg * Math.PI / 180, dir = V3(Math.sin(a), 0, Math.cos(a)), right = V3(Math.cos(a), 0, -Math.sin(a));
    const m = who ? who.pos.clone() : midP();
    const sep = who ? 0.8 : Math.abs((N.pos.x - E.pos.x) * right.x + (N.pos.z - E.pos.z) * right.z) / 2;
    const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * (W / H));
    let d = Math.max(minD, (sep + margin) / Math.tan(hf / 2));
    if (d > MAXD) { d = MAXD; const need = 2 * Math.atan((sep + margin) / d); fov = (2 * Math.atan(Math.tan(need / 2) / (W / H))) * 180 / Math.PI; }
    return { pos: V3(m.x + dir.x * d, h, m.z + dir.z * d), look: V3(m.x + right.x * lookOff, lookY, m.z + right.z * lookOff), fov };
  };
  // ===================== EPISODE =====================
  const updaters = []; const extra = { sat: 0, tint: [0, 0, 0], vig: 0, zg: 0, ca: 0 };
  const music = (level) => audio.push({ t: st.outT, kind: 'music', level });
  const mute = (dur, fadeIn = 0.05) => audio.push({ t: st.outT, kind: 'mute', dur, fadeIn });
  const initHp = (n, e) => { hp.N = n; hp.E = e; for (const [s, v] of [['L', n], ['R', e]]) { overlay.hp[s] = v / 100; overlay.hpShown[s] = v / 100; overlay.lag[s] = v / 100; } };
  const ctx = { updaters, extra, music, mute, initHp, glow, nh, eh, midP, lv, sm, frame, THREE, V3, N, E, ref, comm, fx, overlay, arena, S, st, at, act, sfx, slow, impact, shake, excite, hitstop, setHp, hp, project, horiz, apple, appleVel, appleShadow, APPLE, W, H, world, camera, scene, events, getExcite: () => exciteV };
  const ep = await (await import(`./episodes/${episodeId}.js`)).build(ctx);
  const shots = ep.shots, T = ep.T;
  S.cues.forEach((c) => { if (c.at) c.sim = ep.anchors[c.at[0]] + c.at[1]; });
  const camState = { pos: V3(), look: V3(), fov: 40 };

  function updateCamera(outDt) {
    const t = st.simT; let shot = shots[shots.length - 1];
    for (const s of shots) if (t >= s.t0 && t < s.t1) { shot = s; break; }
    const u = clamp((t - shot.t0) / Math.min(shot.t1 - shot.t0, 99));
    const r = shot.fn(shot === shots[shots.length - 1] ? clamp((t - shot.t0) / 1.2) : u);
    const a = st.shakeAmp, o = st.outT;
    const sh = V3(Math.sin(o * 61) + Math.sin(o * 97 + 1), Math.sin(o * 73 + 2) + Math.sin(o * 113), Math.sin(o * 83 + 4)).multiplyScalar(a * 0.5);
    const hand = V3(Math.sin(o * 1.3) * 0.012, Math.sin(o * 1.9 + 1) * 0.01, Math.sin(o * 1.1 + 2) * 0.01);
    camera.position.copy(r.pos).add(sh).add(hand); camera.lookAt(r.look.clone().add(sh.clone().multiplyScalar(0.5)));
    camera.rotateZ(Math.sin(o * 47) * a * 0.08);
    camera.fov = r.fov + st.fovPunch; camera.updateProjectionMatrix();
    st.shakeAmp *= Math.exp(-outDt * 9); st.fovPunch *= Math.exp(-outDt * 8);
  }

  // ===================== SIMULATION =====================
  events.sort((a, b) => a.t - b.t); let evI = 0;
  const bell = arena.bell;
  function stepSim(h) {      // h: Sim-Delta
    st.simT += h; const t = st.simT;
    while (evI < events.length && events[evI].t <= t) events[evI++].fn();
    mid.pos.set((N.pos.x + E.pos.x) / 2, 0, (N.pos.z + E.pos.z) / 2);
    N.talk = S.speaking('N', st.outT); E.talk = S.speaking('E', st.outT); N.talkOpen = 'shout'; E.talkOpen = 'happy';
    for (const u of updaters) u(t, h);
    N.update(h, t); E.update(h, t); ref.update(h, t);
    commLook.copy(midP());
    comm.update(t);
    // Apfel
    if (apple.userData.rest) { /* Apfel liegt still (vom Episoden-Code gesteuert) */ }
    else if (apple.visible && !apple.userData.bounce) {
      const hd = E.headWorld; const u = (t - APPLE.spawn) / (APPLE.hit - APPLE.spawn); const dt_ = APPLE.hit - t;
      const y = hd.y + 0.34 + 0.5 * 9.8 * dt_ * dt_ * 1.0 + 0; const k = clamp(1 - dt_ * 0 );
      apple.position.set(hd.x, Math.min(y, APPLE.y0), hd.z); apple.rotation.set(t * 3, t * 2, 0);
      appleShadow.position.set(hd.x, 0.02, hd.z); const fall = clamp((t - APPLE.spawn) / (APPLE.hit - APPLE.spawn));
      appleShadow.material.opacity = 0.55 * smooth(fall); appleShadow.scale.setScalar(0.4 + 0.9 * smooth(fall));
    } else if (apple.userData.bounce) {
      appleVel.y -= 9.8 * h * (1 - extra.zg); apple.position.addScaledVector(appleVel, h); apple.rotation.x += 6 * h; apple.rotation.z += 4 * h;
      if (apple.position.y < 0.34) { apple.position.y = 0.34; appleVel.y *= -0.45; appleVel.x *= 0.7; appleVel.z *= 0.7; }
      appleShadow.material.opacity = 0.5; appleShadow.position.set(apple.position.x, 0.02, apple.position.z); appleShadow.scale.setScalar(0.5);
      if (t - apple.userData.t0 > 2.5) { apple.visible = false; appleShadow.material.opacity = 0; }
    }
    // Glocke
    const bt = t - (bell.userData.ring ?? -9); bell.rotation.z = bt >= 0 && bt < 1 ? Math.sin(bt * 60) * 0.25 * (1 - bt) : 0;
    // Publikum-Erregung
    exciteV = 0.3 + (exciteV - 0.3) * Math.exp(-h * 0.7);
    arena.updateCrowd(t, exciteV, extra.zg); arena.updateSigns(t, exciteV); arena.updateRopes(st.outT);
    // Lichtshow
    const flicker = 0.85 + 0.15 * Math.sin(t * 9);
    const gl = glowAt(t);
    arena.lights.rimR.intensity = 70 * flicker * (1 + 0.8 * exciteV) * (1 - gl) + 70 * gl; arena.lights.rimB.intensity = 70 * (1.7 - flicker * 0.7) * (1 + 0.8 * exciteV) * (1 - gl) + 70 * gl;
    arena.lights.rimR.color.set(gl > 0.01 ? '#ffd24a' : '#ff3b3b'); arena.lights.rimB.color.set(gl > 0.01 ? '#ffd24a' : '#3b7bff');
    arena.lights.key.color.set(gl > 0.01 ? '#ffe9a8' : '#fff4e0'); arena.jumbo.material[0].emissiveIntensity = 1.2 + 1.4 * gl;
    arena.beams.forEach((b, i) => { b.rotation.z = 0; b.material.opacity = 0.022 + 0.012 * Math.sin(t * 2 + i) + 0.02 * exciteV + 0.04 * gl; b.material.color.set(gl > 0.01 ? '#ffd24a' : ['#fff1d0', '#fff1d0', '#8fb3ff', '#ff8f8f', '#ffffff', '#ffffff'][i]); });
    fx.gScale = 1 - extra.zg; fx.step(h, t);
    // Grading: Zeitlupe -> entsaettigt + Vignette
    const sc = scaleAt(t); const slowK = 1 - sc;
    world.grade.uniforms.sat.value = lerp(1.08, 0.82, slowK) - extra.sat;
    world.grade.uniforms.ca.value = st.shakeAmp * 0.03 + slowK * 0.004 + extra.ca; world.grade.uniforms.vig.value = 0.35 + 0.35 * slowK + extra.vig;
    // Zeitlupe: Aura-Gold-Tint in der Aufladung
    const ch = E.P ? E.P.flash : 0; world.grade.uniforms.tint.value.set(1 + ch * 0.25 + extra.tint[0], 1 + ch * 0.1 + extra.tint[1], 1 - ch * 0.15 + extra.tint[2]);
    if (t >= ep.end()) st.ended = true;
  }

  // Untertitel/Dialog in Ausgabezeit: wir merken Startzeiten in Ausgabezeit
  const cueOut = new Map();
  

  const anchorOut = {};
  function advance(dtOut) {
    let rem = dtOut;
    while (rem > 1e-9) {
      const hh = Math.min(rem, 1 / 120);
      if (st.freeze > 0) { st.freeze -= hh; st.outT += hh; rem -= hh; continue; }
      const sc = scaleAt(st.simT); stepSim(hh * sc); st.outT += hh; rem -= hh;
      for (const c of S.cues) if (c.simOut === undefined && st.simT >= c.sim) c.simOut = st.outT;
      // Sprach-Warteschlange: ein Sprecher zur Zeit (keine Ueberlappung), Reihenfolge nach Soll-Zeit
      const lastEnd = S.cues.reduce((m, c) => c.outStart !== null ? Math.max(m, c.outStart + c.est) : m, -1);
      if (st.outT >= lastEnd + 0.1) { const nxt = S.cues.filter((c) => c.outStart === null && c.simOut !== undefined).sort((a, b) => a.sim - b.sim)[0]; if (nxt) nxt.outStart = st.outT; }
      for (const k in ep.anchors) if (!(k in anchorOut) && st.simT >= ep.anchors[k]) anchorOut[k] = st.outT;
    }
    updateCamera(dtOut);
    const capt = S.captionNow(st.outT);
    const endcard = ep.endcard(st.simT, st.outT);
    overlay.update(st.outT, dtOut, capt, endcard);
    if (st.ended && st.outT > 0 && !st.done) { st.endOut = st.endOut ?? st.outT; if (st.outT - st.endOut > 0.5) st.done = true; }
  }

  advance(0.0001);
  return {
    advance, reset: () => location.reload(),
    get duration() { return st.endOut ? st.endOut + 0.5 : 14.5; }, get done() { return st.done; }, get outT() { return st.outT; }, get simT() { return st.simT; },
    audioEvents: audio, cues: S.cues, state: st, T,
    exportAudio() { return { duration: st.outT, anchors: anchorOut, events: audio, cues: S.cues.map((c) => ({ id: c.id, speaker: c.speaker, text: c.text, outStart: c.outStart, estDur: c.est, wanted: c.simOut })) }; },
  };
}
