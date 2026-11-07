import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildArena } from './arena.js';
import { Fighter } from './fighter.js';

const params = new URLSearchParams(location.search);
const W = Number(params.get('w') || 1080), H = Number(params.get('h') || 1920);
const RENDER_MODE = params.get('render') === '1';

await document.fonts.load('40px "Lilita One"'); await document.fonts.load('40px "Bangers"');

const stage = document.getElementById('stage');
const fit = RENDER_MODE ? W / 1080 : Math.min(innerWidth / 1080, innerHeight / 1920);
stage.style.transform = `scale(${fit})`;
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
camera.position.set(0, 2.2, -6); camera.lookAt(0, 1.2, 0);
const arena = buildArena(scene);

const newton = new Fighter('newton', 'newton', { pos: [-1.0, 0], yaw: Math.PI / 2, bobPhase: 0 });
const einstein = new Fighter('einstein', 'einstein', { pos: [1.0, 0], yaw: -Math.PI / 2, bobPhase: 1.7 });
newton.opp = einstein; einstein.opp = newton;
scene.add(newton.root, einstein.root);

// Post-Processing
const composer = new EffectComposer(renderer);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.22, 0.5, 0.9);
composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, sat: { value: 1.08 }, con: { value: 1.06 }, ca: { value: 0 }, vig: { value: 0.35 }, tint: { value: new THREE.Vector3(1, 1, 1) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float sat, con, ca, vig; uniform vec3 tint; varying vec2 vUv;
    void main(){ vec2 d=vUv-0.5; vec2 off=d*ca;
      vec3 c=vec3(texture2D(tDiffuse,vUv+off).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-off).b);
      float l=dot(c,vec3(0.299,0.587,0.114)); c=mix(vec3(l),c,sat); c=(c-0.5)*con+0.5; c*=tint;
      c*=1.0-vig*smoothstep(0.35,0.95,length(d)*1.25); gl_FragColor=vec4(c,1.0); }`,
});
composer.addPass(grade);
composer.addPass(new OutputPass());

const world = { THREE, scene, camera, renderer, composer, arena, newton, einstein, bloom, grade, W, H, RENDER_MODE, params };
window.__world = world;

function render() { composer.render(); }
world.render = render;

let choreo = null;
if (params.get('choreo') !== '0') {
  try { const m = await import('./engine.js'); choreo = await m.createFight(world, params.get('ep') || 'test-fight'); } catch (e) { console.warn('Keine Choreografie:', e); }
}
if (choreo) {
  window.__fight = choreo;
  if (RENDER_MODE) { window.__ready = true; }
  else {
    let last = performance.now(), simOut = 0, playing = true;
    const loop = (now) => {
      requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (playing && !choreo.done) { choreo.advance(dt); simOut += dt; } else if (choreo.done && playing) { playing = false; setTimeout(() => { choreo.reset(); simOut = 0; playing = true; }, 2500); }
      render();
    };
    requestAnimationFrame(loop);
    addEventListener('keydown', (e) => { if (e.code === 'Space') playing = !playing; if (e.key === 'r') { choreo.reset(); simOut = 0; playing = true; } });
  }
} else {
  newton.update(1 / 60, 0); einstein.update(1 / 60, 0);
  render(); window.__ready = true;
}
