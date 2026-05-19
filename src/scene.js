import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { createPanel0 } from './panels/panel0.js';
import { createPanel1 } from './panels/panel1.js';

// ── Renderer ──────────────────────────────────────────────────
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ── Scene & camera ─────────────────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xffffff, 0.008);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.5, 35);

// ── Lights ─────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xc5cedd, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 0.8);
key.position.set(6, 8, 7);
scene.add(key);
const rim = new THREE.DirectionalLight(0x213362, 0.45);
rim.position.set(-8, 2, -4);
scene.add(rim);

// ── Constants ──────────────────────────────────────────────────
const SCENE_SPACING = 16;
const N_PANELS      = 6;

// ── Background particles ───────────────────────────────────────
const bgParticles = (() => {
  const g = new THREE.BufferGeometry();
  const N = 500;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 160;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 28 - 6;
    const t = Math.random();
    col[i * 3]     = 0.12 + t * 0.15;
    col[i * 3 + 1] = 0.22 + t * 0.2;
    col[i * 3 + 2] = 0.38 + t * 0.25;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.4, sizeAttenuation: true,
  }));
  scene.add(p);
  return p;
})();

// ── Panels ─────────────────────────────────────────────────────
const panel0 = createPanel0(scene, 1 * SCENE_SPACING);
const panel1 = createPanel1(scene, 1 * SCENE_SPACING);

// ── Scroll tracking ────────────────────────────────────────────
const fogDark  = new THREE.Color(0xffffff);
const fogLight = new THREE.Color(0xffffff);

let scrollProgress = 0;
let targetCameraX  = 0;
let currentCameraX = 0;

function updateScroll() {
  const max = document.body.scrollHeight - window.innerHeight;
  scrollProgress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  targetCameraX  = scrollProgress * (N_PANELS - 1) * SCENE_SPACING;
}
window.addEventListener('scroll', updateScroll, { passive: true });

// ── Animation loop ─────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();
  const t  = clock.getElapsedTime();

  currentCameraX += (targetCameraX - currentCameraX) * 0.08;
  camera.position.x = currentCameraX;
  camera.position.y = 0.4 + Math.sin(t * 0.38) * 0.04;
  camera.lookAt(currentCameraX + 5, 0, 0);

  scene.fog.color.lerpColors(fogDark, fogLight, Math.min(1, scrollProgress * (N_PANELS - 1)));

  panel0.update(dt, t);
  panel1.update(dt, t);

  bgParticles.rotation.y += dt * 0.004;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// ── Resize ─────────────────────────────────────────────────────
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}
window.addEventListener('resize', resize);
resize();
updateScroll();
animate();
