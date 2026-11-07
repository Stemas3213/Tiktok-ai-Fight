// R15-inspirierter Blockfiguren-Rig (Roblox-Look) mit Ellbogen/Knien fuer fluessige Boxanimationen.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { makeFaces, torsoDecal } from './faces.js';

export const DIM = {
  pelvis: [0.56, 0.24, 0.32], torso: [0.62, 0.64, 0.34], head: 0.46,
  upperArm: [0.25, 0.36, 0.25], foreArm: [0.23, 0.34, 0.23], thigh: [0.27, 0.42, 0.29], shin: [0.25, 0.40, 0.27],
  shoulderX: 0.42, shoulderY: 0.53, hipX: 0.16, L1a: 0.36, L2a: 0.48, L1l: 0.42, L2l: 0.42, footH: 0.12,
};

const geoCache = new Map();
export function rbox(w, h, d, r = 0.04, seg = 3) {
  const k = [w, h, d, r].join('_');
  if (!geoCache.has(k)) geoCache.set(k, new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)));
  return geoCache.get(k);
}
export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.0, ...o });

function part(parent, geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

/**
 * look = { skin, shirt, trunks, trunksTrim, glove, gloveCuff, boots, torsoDecal, hair(fn), face:'newton'... }
 */
export function buildHumanoid(look) {
  const D = DIM;
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);              // Becken-Pivot (Pitch/Roll)
  const skin = mat(look.skin), shirtM = mat(look.shirt), trunksM = mat(look.trunks), trimM = mat(look.trunksTrim || '#fff');
  const gloveM = mat(look.glove, { roughness: 0.3 }), cuffM = mat(look.gloveCuff || '#fff'), bootM = mat(look.boots || '#222', { roughness: 0.5 });

  // Becken + Boxershorts
  const pelvis = part(body, rbox(...D.pelvis, 0.06), trunksM);
  const waistband = part(body, rbox(D.pelvis[0] + 0.02, 0.07, D.pelvis[2] + 0.02, 0.03), trimM, 0, D.pelvis[1] / 2 - 0.03, 0);

  // Torso
  const torso = new THREE.Group(); torso.position.y = D.pelvis[1] / 2; body.add(torso);
  const torsoMesh = part(torso, rbox(...D.torso, 0.07, 4), look.torsoBare ? skin : shirtM, 0, D.torso[1] / 2, 0);
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(D.torso[0] * 0.92, D.torso[1] * 0.92), new THREE.MeshStandardMaterial({ map: torsoDecal(look.torsoDecal), transparent: true, roughness: 0.6 }));
  decal.position.set(0, D.torso[1] / 2, D.torso[2] / 2 + 0.003); torso.add(decal);
  if (look.backDecal) { const b = decal.clone(); b.material = new THREE.MeshStandardMaterial({ map: torsoDecal(look.backDecal), transparent: true }); b.rotation.y = Math.PI; b.position.z = -D.torso[2] / 2 - 0.003; torso.add(b); }

  // Hals + Kopf
  const neck = new THREE.Group(); neck.position.y = D.torso[1] + 0.01; torso.add(neck);
  part(neck, rbox(0.2, 0.1, 0.2, 0.03), skin, 0, 0.02, 0);
  const head = new THREE.Group(); head.position.y = 0.06; neck.add(head);
  const headMesh = part(head, rbox(D.head, D.head * 0.96, D.head * 0.96, 0.09, 4), skin, 0, D.head * 0.48, 0);
  const faces = makeFaces(look.face, look.skin, look.faceExtra);
  const faceMat = new THREE.MeshStandardMaterial({ map: faces.neutral, transparent: true, roughness: 0.7, depthWrite: false });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(D.head * 0.9, D.head * 0.9), faceMat);
  face.position.set(0, D.head * 0.48, D.head * 0.48 + 0.002); head.add(face);
  for (const s of [-1, 1]) part(head, rbox(0.05, 0.12, 0.08, 0.02), skin, s * (D.head / 2 + 0.01), D.head * 0.48, 0); // Ohren
  const hairNodes = look.hair ? look.hair(head, { rbox, mat, part, D }) : [];
  if (look.headExtras) look.headExtras(head, { rbox, mat, part, D, skin });

  // Arme
  const arms = {};
  for (const [name, s] of [['L', 1], ['R', -1]]) {
    const anchor = new THREE.Group(); anchor.position.set(s * D.shoulderX, D.shoulderY, 0); torso.add(anchor);
    const upper = new THREE.Group(); anchor.add(upper);
    part(upper, rbox(...D.upperArm, 0.05), look.torsoBare || look.sleeves === false ? skin : shirtM, 0, -D.upperArm[1] / 2 + 0.04, 0);
    const fore = new THREE.Group(); fore.position.y = -D.L1a; upper.add(fore);
    part(fore, rbox(...D.foreArm, 0.05), skin, 0, -D.foreArm[1] / 2 + 0.03, 0);
    // Boxhandschuh
    const glove = new THREE.Group(); glove.position.y = -0.36; fore.add(glove);
    if (look.handsBare) { part(glove, rbox(0.2, 0.2, 0.2, 0.06), skin, 0, -0.1, 0.02); }
    else {
      part(glove, rbox(0.25, 0.1, 0.25, 0.04), cuffM, 0, 0.06, 0);
      part(glove, rbox(0.34, 0.34, 0.36, 0.13, 5), gloveM, 0, -0.12, 0.02);
      part(glove, rbox(0.12, 0.2, 0.2, 0.05), gloveM, s * -0.17, -0.1, 0.1);   // Daumen
    }
    arms[name] = { anchor, upper, fore, glove, side: s, pole: new THREE.Vector3(s * 0.55, -0.35, -0.8).normalize() };
  }

  // Beine
  const legs = {};
  for (const [name, s] of [['L', 1], ['R', -1]]) {
    const anchor = new THREE.Group(); anchor.position.set(s * D.hipX, -D.pelvis[1] / 2 + 0.03, 0); body.add(anchor);
    const upper = new THREE.Group(); anchor.add(upper);
    part(upper, rbox(...D.thigh, 0.06), trunksM, 0, -D.thigh[1] / 2 + 0.04, 0);
    part(upper, rbox(D.thigh[0] + 0.015, 0.06, D.thigh[2] + 0.015, 0.02), trimM, 0, -0.17, 0);
    const lower = new THREE.Group(); lower.position.y = -D.L1l; upper.add(lower);
    part(lower, rbox(...D.shin, 0.05), skin, 0, -D.shin[1] / 2 + 0.03, 0);
    // Fuss haengt in Weltkoordinaten-IK; als Kind von "root" gefuehrt (siehe Fighter)
    const foot = new THREE.Group(); root.add(foot);
    part(foot, rbox(0.3, 0.16, 0.46, 0.06), bootM, 0, 0.08, 0.07);
    part(foot, rbox(0.31, 0.04, 0.47, 0.02), cuffM, 0, 0.035, 0.07);
    legs[name] = { anchor, upper, lower, foot, side: s, pole: new THREE.Vector3(s * 0.15, 0.1, 1).normalize() };
  }
  return { root, body, pelvis, torso, neck, head, face, faceMat, faces, arms, legs, hairNodes, skinMat: skin, gloveMat: gloveM, torsoMesh };
}

// ----- Charakter-Looks -----
export const LOOKS = {
  newton: () => ({
    face: 'newton', skin: '#f2cfae', shirt: '#7a1424', trunks: '#a8141f', trunksTrim: '#e8b923', glove: '#d6202b', gloveCuff: '#f3ede0',
    boots: '#4a0d14', torsoDecal: 'newton', sleeves: true,
    hair: (head, { rbox, mat, part, D }) => {
      const w = mat('#f4f1ea', { roughness: 0.9 }), nodes = [];
      part(head, rbox(0.52, 0.2, 0.5, 0.09, 4), w, 0, D.head * 1.08, -0.04);        // Perueckendach
      part(head, rbox(0.54, 0.5, 0.22, 0.09, 4), w, 0, D.head * 0.5, -0.27);         // Hinterkopf
      for (const s of [-1, 1]) {                                                      // Seitenlocken
        for (let i = 0; i < 3; i++) { const c = part(head, new THREE.CylinderGeometry(0.075, 0.075, 0.2, 14), w, s * 0.285, D.head * 0.62 - i * 0.12, 0.02 - i * 0.005); c.rotation.z = Math.PI / 2; c.rotation.x = Math.PI / 2; c.rotation.set(0, 0, 0); c.rotation.x = Math.PI / 2; nodes.push(c); }
        const side = part(head, rbox(0.1, 0.46, 0.5, 0.04), w, s * 0.262, D.head * 0.7, -0.03);
      }
      const bow = part(head, rbox(0.14, 0.14, 0.06, 0.03), mat('#16161c'), 0, D.head * 0.9, -0.52); // Haarschleife
      return nodes;
    },
    headExtras: (head, { rbox, mat, part, D }) => {
      part(head, rbox(0.075, 0.17, 0.12, 0.03), mat('#eec3a0'), 0, D.head * 0.46, D.head * 0.5 + 0.03); // lange Nase
    },
  }),
  einstein: () => ({
    face: 'einstein', skin: '#f5d5b8', shirt: '#8f98a3', trunks: '#1f4bd8', trunksTrim: '#ffffff', glove: '#2a62ff', gloveCuff: '#ffffff',
    boots: '#16328f', torsoDecal: 'einstein', sleeves: true,
    hair: (head, { rbox, mat, part, D }) => {
      const w = mat('#f2f4f7', { roughness: 0.95 }), nodes = [];
      let seed = 7; const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      part(head, rbox(0.5, 0.14, 0.5, 0.06), w, 0, D.head * 0.98, -0.01);
      for (const s of [-1, 1]) part(head, rbox(0.14, 0.34, 0.44, 0.06), w, s * 0.28, D.head * 0.7, -0.03);
      part(head, rbox(0.5, 0.4, 0.14, 0.06), w, 0, D.head * 0.62, -0.25);
      const count = 26;
      for (let i = 0; i < count; i++) {                 // wilde Haarbueschel
        const g = new THREE.Group(); const a = (i / count) * Math.PI * 2 + r() * 0.3, tilt = 0.45 + r() * 0.9;
        const len = 0.22 + r() * 0.2, th = 0.075 + r() * 0.04;
        const t = new THREE.Mesh(rbox(th, len, th, 0.02, 2), w); t.position.y = len / 2; t.castShadow = true; g.add(t);
        g.position.set(Math.cos(a) * 0.27, D.head * 0.82 + (r() - 0.2) * 0.2, Math.sin(a) * 0.27 - 0.03);
        g.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
        g.userData = { base: g.rotation.clone(), ph: r() * 6.28 }; head.add(g); nodes.push(g);
      }
      return nodes;
    },
    headExtras: (head, { rbox, mat, part, D }) => {
      part(head, rbox(0.1, 0.1, 0.09, 0.03), mat('#f0c9a8'), 0, D.head * 0.44, D.head * 0.5 + 0.015);  // Knollennase
    },
  }),
  referee: () => ({
    face: 'ref', faceExtra: { brow: '#222' }, skin: '#e3b48e', shirt: '#f4f4f4', trunks: '#15151a', trunksTrim: '#15151a', glove: '#f4f4f4', gloveCuff: '#fff',
    boots: '#111', torsoDecal: 'ref', sleeves: true,
    hair: (head, { rbox, mat, part, D }) => { part(head, rbox(0.48, 0.1, 0.48, 0.04), mat('#1d1a18'), 0, D.head * 0.98, -0.02); part(head, rbox(0.48, 0.3, 0.1, 0.04), mat('#1d1a18'), 0, D.head * 0.72, -0.25); return []; },
    headExtras: (head, { rbox, mat, part, D }) => { part(head, rbox(0.2, 0.06, 0.04, 0.02), mat('#111'), 0, -0.02, 0.0); },
    handsBare: true,
  }),
  host: () => ({
    face: 'host', faceExtra: { brow: '#2a1a10' }, skin: '#d9a47e', shirt: '#1b1f3a', trunks: '#1b1f3a', trunksTrim: '#1b1f3a', glove: '#d9a47e', gloveCuff: '#1b1f3a',
    boots: '#111', torsoDecal: 'host', sleeves: true,
    hair: (head, { rbox, mat, part, D }) => { const m = mat('#2b1a10'); part(head, rbox(0.5, 0.16, 0.5, 0.07), m, 0, D.head * 1.0, -0.01); part(head, rbox(0.5, 0.36, 0.12, 0.05), m, 0, D.head * 0.66, -0.25); part(head, rbox(0.52, 0.1, 0.12, 0.05), m, 0, D.head * 0.98, 0.2); return []; },
    headExtras: (head, { rbox, mat, part, D }) => {   // Headset
      const hm = mat('#222', { roughness: 0.4 });
      part(head, rbox(0.5, 0.05, 0.05, 0.02), hm, 0, D.head * 1.04, 0); part(head, rbox(0.07, 0.16, 0.14, 0.03), hm, -0.265, D.head * 0.5, 0); part(head, rbox(0.07, 0.16, 0.14, 0.03), hm, 0.265, D.head * 0.5, 0);
      part(head, rbox(0.03, 0.03, 0.26, 0.01), hm, -0.26, D.head * 0.34, 0.14); part(head, rbox(0.06, 0.06, 0.06, 0.03), mat('#e04'), -0.26, D.head * 0.3, 0.29);
    },
  }),
};
