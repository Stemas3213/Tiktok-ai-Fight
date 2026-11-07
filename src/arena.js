// Boxring, Tribuenen, Publikum, Licht, Jumbotron, Kommentatorentisch.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mulberry32, clamp } from './util.js';

export const RING_HALF = 3.2;
export const FLOOR_Y = -1.0;

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...o });

export function buildArena(scene) {
  const A = { ropes: [], wobble: [], bell: null, crowd: null, lights: {}, update: null };

  scene.background = new THREE.Color('#05060d');
  scene.fog = new THREE.FogExp2('#070a18', 0.022);

  // ---------- Boden ----------
  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 64), std('#0c1020', { roughness: 0.28, metalness: 0.15 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR_Y; floor.receiveShadow = true; scene.add(floor);

  // ---------- Ring ----------
  const ring = new THREE.Group(); scene.add(ring);
  const canvasTexture = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#10204a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c3141f'; g.fillRect(0, 0, w / 2, 70); g.fillRect(0, h - 70, w / 2, 70);
    g.fillStyle = '#1f4bd8'; g.fillRect(w / 2, 0, w / 2, 70); g.fillRect(w / 2, h - 70, w / 2, 70);
    g.strokeStyle = '#f2f2f2'; g.lineWidth = 14; g.strokeRect(28, 28, w - 56, h - 56);
    const grd = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 400); grd.addColorStop(0, '#1d3c8f'); grd.addColorStop(1, '#10204a');
    g.fillStyle = grd; g.beginPath(); g.arc(w / 2, h / 2, 380, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#ffd24a'; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2, 380, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '120px "Lilita One", Impact, Arial Black';
    g.save(); g.translate(w / 2, h / 2 - 20); g.shadowColor = '#000'; g.shadowBlur = 18; g.fillText('AI FIGHT', 0, 0); g.fillStyle = '#ffd24a'; g.fillText('CLUB', 0, 120); g.restore();
  });
  const cv = new THREE.Mesh(new THREE.BoxGeometry(RING_HALF * 2 + 0.6, 0.12, RING_HALF * 2 + 0.6), [std('#fff'), std('#fff'), new THREE.MeshStandardMaterial({ map: canvasTexture, roughness: 0.85 }), std('#222'), std('#fff'), std('#fff')]);
  cv.position.y = -0.06; cv.receiveShadow = true; ring.add(cv);
  const skirtTex = canvasTex(1024, 128, (g, w, h) => {
    g.fillStyle = '#0d1330'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd24a'; g.font = '84px "Lilita One", Impact'; g.textAlign = 'center'; g.fillText('AI FIGHT CLUB', w / 2, 92);
  });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(RING_HALF * 2 + 1.0, 0.9, RING_HALF * 2 + 1.0), [0, 1, 2, 3, 4, 5].map((i) => i === 2 || i === 3 ? std('#0d1330') : new THREE.MeshStandardMaterial({ map: skirtTex, roughness: 0.6, emissive: '#ffffff', emissiveMap: skirtTex, emissiveIntensity: 0.28 })));
  platform.position.y = -0.62; platform.receiveShadow = true; ring.add(platform);

  // Pfosten + Polster
  const padCols = { '-1,-1': '#d6202b', '-1,1': '#d6202b', '1,-1': '#2a62ff', '1,1': '#2a62ff' };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.7, 16), std('#cfd3dc', { metalness: 0.6, roughness: 0.3 }));
    p.position.set(sx * RING_HALF, 0.85, sz * RING_HALF); p.castShadow = true; ring.add(p);
    for (let i = 0; i < 3; i++) {
      const pad = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.26, 0.34, 3, 0.07), std(padCols[sx + ',' + sz], { roughness: 0.4 }));
      pad.position.set(sx * (RING_HALF - 0.02), 0.45 + i * 0.35, sz * (RING_HALF - 0.02)); ring.add(pad);
    }
  }
  // Seile (animierbar)
  const ropeCols = ['#f2f2f2', '#d6202b', '#f2f2f2'];
  const SEG = 28;
  const sides = [
    { a: [-RING_HALF, -RING_HALF], b: [RING_HALF, -RING_HALF], n: [0, 0, 1] },
    { a: [-RING_HALF, RING_HALF], b: [RING_HALF, RING_HALF], n: [0, 0, -1] },
    { a: [-RING_HALF, -RING_HALF], b: [-RING_HALF, RING_HALF], n: [1, 0, 0] },
    { a: [RING_HALF, -RING_HALF], b: [RING_HALF, RING_HALF], n: [-1, 0, 0] },
  ];
  sides.forEach((sd, si) => {
    for (let r = 0; r < 3; r++) {
      const h = 0.46 + r * 0.35;
      const geo = new THREE.CylinderGeometry(0.035, 0.035, 1, 6, SEG, true);
      const m = new THREE.Mesh(geo, std(ropeCols[r], { roughness: 0.4 })); m.castShadow = true;
      const base = geo.attributes.position.array.slice();
      const len = Math.hypot(sd.b[0] - sd.a[0], sd.b[1] - sd.a[1]);
      m.userData = { base, sd, h, len, geo, amp: 0, t0: -99, phase: r * 0.4 };
      ring.add(m); A.ropes.push(m);
    }
  });
  function placeRope(m, t) {
    const { base, sd, h, len, geo } = m.userData;
    const pos = geo.attributes.position;
    const cx = (sd.a[0] + sd.b[0]) / 2, cz = (sd.a[1] + sd.b[1]) / 2;
    const ang = Math.atan2(sd.b[1] - sd.a[1], sd.b[0] - sd.a[0]);
    const ux = Math.cos(ang), uz = Math.sin(ang), px = -Math.sin(ang), pz = Math.cos(ang);
    const nx = sd.n[0], nz = sd.n[2];
    const dt = t - m.userData.t0, A_ = m.userData.amp * Math.exp(-dt * 2.6) * Math.cos(dt * 17 + m.userData.phase);
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2];
      const s = by + 0.5, along = (s - 0.5) * len;
      const sag = -0.05 * Math.sin(Math.PI * s), bulge = A_ * Math.sin(Math.PI * s);
      pos.setXYZ(i, cx + ux * along + px * bx + nx * bulge, h + sag + bz, cz + uz * along + pz * bx + nz * bulge);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
  }
  A.ropes.forEach((m) => placeRope(m, 0));
  A.wobbleSide = (sideIdx, amp, t) => { for (let r = 0; r < 3; r++) { const m = A.ropes[sideIdx * 3 + r]; m.userData.amp = amp * (1 - r * 0.12); m.userData.t0 = t; } };

  // Glocke am Kampfgericht-Tisch
  const bell = new THREE.Group(); bell.position.set(RING_HALF + 1.0, -0.1, -RING_HALF - 0.9);
  const bellBody = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), std('#c8963a', { metalness: 0.9, roughness: 0.25 }));
  bellBody.rotation.x = Math.PI; bellBody.position.y = 0.25; bell.add(bellBody);
  A.bell = bell; scene.add(bell);

  // ---------- LED-Banden ----------
  const ledTex = canvasTex(2048, 128, (g, w, h) => {
    g.fillStyle = '#05070f'; g.fillRect(0, 0, w, h); g.font = '78px "Lilita One", Impact'; g.textAlign = 'left';
    const txt = ['APFEL-SAFT', 'E=mc² ENERGY', 'GRAVITÄTS-GEL', 'RELATIV GUT', 'AI FIGHT CLUB', 'NEWTON-CHIPS'];
    const cols = ['#ff4d4d', '#4da6ff', '#ffd24a', '#7dff8a', '#ffffff', '#ff9ad5'];
    txt.forEach((s, i) => { g.fillStyle = cols[i]; g.fillText(s + '   ★   ', 20 + i * 340, 90); });
  }, [3, 1]);
  const led = new THREE.MeshStandardMaterial({ map: ledTex, emissive: '#ffffff', emissiveMap: ledTex, emissiveIntensity: 1.3, roughness: 0.4 });
  const R_LED = 6.35;
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(R_LED * 2 + 1, 0.8, 0.12), led);
    const ang = i * Math.PI / 2;
    b.position.set(Math.sin(ang) * R_LED, FLOOR_Y + 0.4, Math.cos(ang) * R_LED); b.rotation.y = ang; scene.add(b);
  }

  // ---------- Tribuenen + Publikum ----------
  const rng = mulberry32(1337);
  const standMat = std('#14182c', { roughness: 0.9 });
  const seats = [];
  const ROWS = 10;
  for (let side = 0; side < 4; side++) {
    const ang = side * Math.PI / 2;
    const dirx = Math.sin(ang), dirz = Math.cos(ang);
    for (let r = 0; r < ROWS; r++) {
      const dist = 7.2 + r * 0.92, y = FLOOR_Y + 0.5 + r * 0.5;
      const step = new THREE.Mesh(new THREE.BoxGeometry(2 * dist + 2, 0.5 + r * 0.5, 0.92), standMat);
      step.position.set(dirx * dist, FLOOR_Y + (0.5 + r * 0.5) / 2, dirz * dist); step.rotation.y = ang; step.receiveShadow = false; scene.add(step);
      const n = Math.floor((2 * dist) / 0.62);
      for (let k = 0; k < n; k++) {
        if (rng() < 0.07) continue;
        const lat = (k - (n - 1) / 2) * 0.62 + (rng() - 0.5) * 0.1;
        const x = dirx * dist + Math.cos(ang) * lat, z = dirz * dist - Math.sin(ang) * lat;
        seats.push({ x, y: y + 0.28, z, yaw: ang + Math.PI + (rng() - 0.5) * 0.3, phase: rng() * 6.28, speed: 5 + rng() * 5, row: r, side, mood: rng() });
      }
    }
  }
  const N = seats.length;
  const bodyG = new RoundedBoxGeometry(0.46, 0.6, 0.3, 2, 0.05), headG = new RoundedBoxGeometry(0.34, 0.32, 0.32, 2, 0.06), armG = new RoundedBoxGeometry(0.14, 0.5, 0.14, 2, 0.04);
  const mk = (g) => { const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ roughness: 0.7 }), N); m.castShadow = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; };
  const iBody = mk(bodyG), iHead = mk(headG), iArmL = mk(armG), iArmR = mk(armG);
  const shirts = ['#d6202b', '#2a62ff', '#ffd24a', '#2fb36a', '#ff7a1a', '#8e44ad', '#ecf0f1', '#16a5b8', '#ff5ea8', '#34495e'];
  const skins = ['#f1c9a5', '#e3b48e', '#c68a62', '#8d5a3b', '#f5d5b8', '#6b4228'];
  const col = new THREE.Color();
  seats.forEach((s, i) => {
    s.shirt = shirts[Math.floor(rng() * shirts.length)]; s.skin = skins[Math.floor(rng() * skins.length)];
    iBody.setColorAt(i, col.set(s.shirt)); iHead.setColorAt(i, col.set(s.skin));
    iArmL.setColorAt(i, col.set(s.skin)); iArmR.setColorAt(i, col.set(s.skin));
  });
  [iBody, iHead, iArmL, iArmR].forEach((m) => { m.instanceColor.needsUpdate = true; });
  const dummy = new THREE.Object3D();
  A.crowdExcite = 0.3;
  A.updateCrowd = (t, excite) => {
    for (let i = 0; i < N; i++) {
      const s = seats[i];
      const e = clamp(excite * (0.5 + s.mood) , 0, 1.4);
      const hop = Math.abs(Math.sin(t * s.speed + s.phase)) * (0.02 + 0.22 * e) * (s.mood > 0.25 ? 1 : 0.3);
      const sway = Math.sin(t * 2 + s.phase) * 0.05 * (0.5 + e);
      dummy.position.set(s.x, s.y + hop, s.z); dummy.rotation.set(0, s.yaw, sway); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); iBody.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, s.y + hop + 0.46, s.z); dummy.rotation.set(0, s.yaw + Math.sin(t * 1.3 + s.phase) * 0.25, sway * 0.5); dummy.updateMatrix(); iHead.setMatrixAt(i, dummy.matrix);
      const up = clamp(e - 0.35, 0, 1) * (s.mood > 0.4 ? 1 : 0.2);
      for (const [mesh, sd] of [[iArmL, 1], [iArmR, -1]]) {
        const ph = Math.sin(t * s.speed * 0.8 + s.phase + (sd > 0 ? 0 : 1.5));
        dummy.position.set(0, 0, 0);
        const ax = Math.cos(s.yaw) * sd * 0.3, az = -Math.sin(s.yaw) * sd * 0.3;
        // Arm haengt an der Schulter; hebt sich nach oben mit Erregung
        const ang = Math.PI * (0.05 + up * 0.85) + ph * 0.25 * up;
        dummy.position.set(s.x + ax, s.y + hop + 0.25, s.z + az);
        dummy.rotation.set(0, s.yaw, sd * -ang * 0.2); dummy.rotateX(-ang); dummy.translateY(-0.2);
        dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      }
    }
    [iBody, iHead, iArmL, iArmR].forEach((m) => { m.instanceMatrix.needsUpdate = true; });
  };

  // Fan-Schilder
  const signTexts = ['NEWTON ♥', 'TEAM RELATIV', 'APFEL!', 'E=mc²!', 'KO!', 'GRAVITÄT'];
  signTexts.forEach((txt, i) => {
    const sg = seats[(i * 97 + 41) % N];
    const t = canvasTex(256, 128, (g, w, h) => { g.fillStyle = ['#ffd24a', '#fff', '#7dff8a', '#ff9ad5', '#4da6ff', '#fff'][i]; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; g.font = '56px "Lilita One", Impact'; g.textAlign = 'center'; g.fillText(txt, w / 2, 82); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshStandardMaterial({ map: t, emissive: '#fff', emissiveMap: t, emissiveIntensity: 0.3, side: THREE.DoubleSide }));
    sign.position.set(sg.x, sg.y + 1.35, sg.z); sign.rotation.y = sg.yaw; sign.userData = { y0: sg.y + 1.35, ph: i }; scene.add(sign); (A.signs ||= []).push(sign);
  });

  // ---------- Truss + Jumbotron ----------
  const truss = new THREE.Group(); scene.add(truss);
  const trussMat = std('#2a2f45', { metalness: 0.7, roughness: 0.4 });
  const TY = 9.2;
  for (const [w, d] of [[11, 0.25], [11, 0.25]]) { }
  for (const s of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(11, 0.25, 0.25), trussMat); a.position.set(0, TY, s * 5.5); truss.add(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 11), trussMat); b.position.set(s * 5.5, TY, 0); truss.add(b);
  }
  const jt = canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a0b4d'); gr.addColorStop(1, '#0b2a6b'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd24a'; g.font = '150px "Lilita One", Impact'; g.textAlign = 'center'; g.shadowColor = '#ff7a1a'; g.shadowBlur = 30; g.fillText('AI FIGHT', w / 2, 210); g.fillStyle = '#fff'; g.fillText('CLUB', w / 2, 370);
    g.shadowBlur = 0; g.fillStyle = '#ff4d4d'; g.font = '56px "Lilita One"'; g.fillText('NEWTON  vs  EINSTEIN', w / 2, 470);
  });
  const jm = new THREE.MeshStandardMaterial({ map: jt, emissive: '#fff', emissiveMap: jt, emissiveIntensity: 1.2, roughness: 0.5 });
  const jumbo = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 3.4), [jm, jm, std('#111'), std('#111'), jm, jm]);
  jumbo.position.set(0, 7.2, 0); scene.add(jumbo); A.jumbo = jumbo;
  for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, TY - 7.2), trussMat); w.position.set(Math.cos(i * Math.PI / 2 + 0.78) * 1.2, (TY + 7.2) / 2, Math.sin(i * Math.PI / 2 + 0.78) * 1.2); scene.add(w); }

  // Lichttraeger mit sichtbaren Strahlern + Lichtkegeln
  const spotMeshes = [];
  const coneTex = canvasTex(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.0)'); gr.addColorStop(1, 'rgba(255,255,255,0.9)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const beam = (x, z, color) => {
    const g = new THREE.ConeGeometry(1.5, 1, 24, 1, true); g.translate(0, -0.5, 0);
    const cone = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, map: coneTex, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const from = new THREE.Vector3(x, TY, z), to = new THREE.Vector3(x * 0.15, 0, z * 0.15);
    const dir = to.clone().sub(from), len = dir.length(); dir.normalize();
    cone.position.copy(from); cone.scale.set(1, len, 1); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    scene.add(cone);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.5, 10), std('#222')); lamp.position.copy(from); lamp.lookAt(0, 0, 0); scene.add(lamp);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), new THREE.MeshBasicMaterial({ color })); glow.position.copy(from).addScaledVector(dir, 0.3); scene.add(glow);
    return cone;
  };
  A.beams = [beam(5.5, 5.5, '#fff1d0'), beam(-5.5, 5.5, '#fff1d0'), beam(5.5, -5.5, '#8fb3ff'), beam(-5.5, -5.5, '#ff8f8f'), beam(0, 5.5, '#ffffff'), beam(0, -5.5, '#ffffff')];

  // ---------- Lichter ----------
  scene.add(new THREE.HemisphereLight('#8fa4ff', '#1a1020', 0.3));
  const key = new THREE.DirectionalLight('#fff4e0', 1.5); key.position.set(3, 11, 5); key.target.position.set(0, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 2; sc.far = 30; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  scene.add(key, key.target); A.lights.key = key;
  const rimR = new THREE.SpotLight('#ff3b3b', 70, 30, 0.5, 0.8, 1.5); rimR.position.set(-7, 5.5, -3); rimR.target.position.set(-1.5, 1, 0); scene.add(rimR, rimR.target);
  const rimB = new THREE.SpotLight('#3b7bff', 70, 30, 0.5, 0.8, 1.5); rimB.position.set(7, 5.5, 3); rimB.target.position.set(1.5, 1, 0); scene.add(rimB, rimB.target);
  const top = new THREE.SpotLight('#ffffff', 55, 30, 0.6, 0.6, 1.2); top.position.set(0, 9, 0); top.target.position.set(0, 0, 0); scene.add(top, top.target);
  A.lights.rimR = rimR; A.lights.rimB = rimB; A.lights.top = top;

  // ---------- Kommentatorentisch ----------
  const desk = new THREE.Group(); desk.position.set(0, FLOOR_Y, -5.0); desk.rotation.y = Math.PI; scene.add(desk);
  const deskMat = std('#1b2350', { roughness: 0.35 });
  const dtop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 0.9), std('#e9eef9', { roughness: 0.3 })); dtop.position.set(0, 0.95, 0); desk.add(dtop);
  const dfront = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.9, 0.08), new THREE.MeshStandardMaterial({ map: ledTex, emissive: '#fff', emissiveMap: ledTex, emissiveIntensity: 0.9 })); dfront.position.set(0, 0.5, -0.44); desk.add(dfront);
  const dsideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.9), deskMat); dsideL.position.set(-1.5, 0.5, 0); desk.add(dsideL);
  const dsideR = dsideL.clone(); dsideR.position.x = 1.5; desk.add(dsideR);
  const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), std('#222')); mic.position.set(0.5, 1.12, -0.1); desk.add(mic);
  const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), std('#e04')); micHead.position.set(0.5, 1.28, -0.1); desk.add(micHead);
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.04), new THREE.MeshStandardMaterial({ map: jt, emissive: '#fff', emissiveMap: jt, emissiveIntensity: 0.9 })); monitor.position.set(-0.8, 1.25, 0.1); monitor.rotation.y = Math.PI; monitor.rotation.x = -0.1; desk.add(monitor);
  A.desk = desk;
  const deskLight = new THREE.SpotLight('#fff0d8', 90, 12, 0.7, 0.8, 1.5); deskLight.position.set(1.8, 3.2, -2.2); deskLight.target.position.set(0, 0.2, -5.7); scene.add(deskLight, deskLight.target);

  A.ringGroup = ring;
  A.updateRopes = (t) => { for (const m of A.ropes) { if (m.userData.amp > 0 && t - m.userData.t0 < 3.5 && t >= m.userData.t0) placeRope(m, t); } };
  A.updateSigns = (t, excite) => { (A.signs || []).forEach((s, i) => { s.position.y = s.userData.y0 + Math.abs(Math.sin(t * 4 + i)) * 0.12 * (0.3 + excite); s.rotation.z = Math.sin(t * 3 + i) * 0.08 * excite; }); };
  return A;
}
