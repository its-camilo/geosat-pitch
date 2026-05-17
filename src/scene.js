import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 0); // transparent — body white shows through
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xffffff, 0.018);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.5, 14);

// Lighting for white bg — subtle, blueish
scene.add(new THREE.AmbientLight(0x9ab8d0, 0.6));
const key = new THREE.DirectionalLight(0xffffff, 0.8);
key.position.set(6, 8, 7);
scene.add(key);
const rim = new THREE.DirectionalLight(0x2a8aaa, 0.5);
rim.position.set(-8, 2, -4);
scene.add(rim);
const warm = new THREE.PointLight(0xc09060, 0.3, 40);
warm.position.set(3, -2, 4);
scene.add(warm);

// Subtle floating particles (dark on white)
const particles = (() => {
  const g = new THREE.BufferGeometry();
  const N = 600;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 200;
    pos[i*3+1] = (Math.random() - 0.5) * 60;
    pos[i*3+2] = (Math.random() - 0.5) * 30 - 8;
    // dark blue-gray hues
    const t = Math.random();
    col[i*3]   = 0.15 + t * 0.25;
    col[i*3+1] = 0.35 + t * 0.3;
    col[i*3+2] = 0.55 + t * 0.35;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });
  const p = new THREE.Points(g, m);
  scene.add(p);
  return p;
})();

const SCENE_SPACING = 16;
const N_PANELS = 8;

// ===== PANEL 1 — Hero: Earth + satellite =====
const heroGroup = new THREE.Group();
heroGroup.position.x = 0;
scene.add(heroGroup);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2.4, 96, 96),
  new THREE.MeshStandardMaterial({
    color: 0x1a5080,
    roughness: 0.7,
    metalness: 0.1,
    emissive: 0x0a2a40,
    emissiveIntensity: 0.2,
  })
);
heroGroup.add(earth);

const grid = new THREE.Mesh(
  new THREE.SphereGeometry(2.405, 24, 18),
  new THREE.MeshBasicMaterial({ color: 0x2a8aaa, wireframe: true, transparent: true, opacity: 0.2 })
);
heroGroup.add(grid);

const coastline = (() => {
  const pts = [];
  for (let i = 0; i <= 256; i++) {
    const t = (i / 256) * Math.PI * 2;
    const r = 2.42 + Math.sin(t * 8) * 0.02 + Math.sin(t * 31) * 0.012;
    pts.push(new THREE.Vector3(Math.cos(t) * r, Math.sin(t * 3) * 0.25, Math.sin(t) * r));
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0x4ad6e8, transparent: true, opacity: 0.9 }));
})();
heroGroup.add(coastline);

heroGroup.add(new THREE.Mesh(
  new THREE.SphereGeometry(2.85, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0x2a8aaa, transparent: true, opacity: 0.04, side: THREE.BackSide })
));

const satellite = new THREE.Group();
satellite.add(new THREE.Mesh(
  new THREE.BoxGeometry(0.35, 0.32, 0.55),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.4, metalness: 0.6 })
));
const dish = new THREE.Mesh(
  new THREE.CylinderGeometry(0.18, 0.22, 0.05, 24),
  new THREE.MeshStandardMaterial({ color: 0xb0a898, metalness: 0.7, roughness: 0.3 })
);
dish.position.set(0, 0.2, 0);
dish.rotation.x = Math.PI / 6;
satellite.add(dish);
[-0.7, 0.7].forEach(x => {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.02, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x1a2b6c, emissive: 0x0a1144, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.4 })
  );
  panel.position.set(x, 0, 0);
  satellite.add(panel);
});
heroGroup.add(satellite);

const beamGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const beam = new THREE.Line(beamGeo, new THREE.LineDashedMaterial({
  color: 0x2a8aaa, dashSize: 0.1, gapSize: 0.08, transparent: true, opacity: 0.35,
}));
heroGroup.add(beam);

// ===== PANEL 2 — Erosion terrain =====
const erosionGroup = new THREE.Group();
erosionGroup.position.x = SCENE_SPACING;
scene.add(erosionGroup);

const W = 14, H = 8, SEG = 80;
const terrainGeo = new THREE.PlaneGeometry(W, H, SEG, SEG);
const tPos = terrainGeo.attributes.position;
for (let i = 0; i < tPos.count; i++) {
  const x = tPos.getX(i), y = tPos.getY(i);
  const coast = -1.6 + Math.sin(x * 0.7) * 0.6 + Math.sin(x * 2.2) * 0.2;
  const onLand = y > coast;
  let z = onLand ? Math.min((y - coast) * 0.4, 0.9) + Math.sin(x * 0.9 + y * 0.6) * 0.08 : -0.15 + Math.sin(x * 1.5 + y * 0.9) * 0.04;
  tPos.setZ(i, z);
}
terrainGeo.computeVertexNormals();

const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({
  color: 0x1a5080, wireframe: true, transparent: true, opacity: 0.35,
}));
terrain.rotation.x = -Math.PI / 2.4;
terrain.position.y = -0.8;
erosionGroup.add(terrain);

const coastEdge = (() => {
  const pts = [];
  for (let xi = -W/2; xi <= W/2; xi += 0.12) {
    const yc = -1.6 + Math.sin(xi * 0.7) * 0.6 + Math.sin(xi * 2.2) * 0.2;
    pts.push(new THREE.Vector3(xi, yc, 0));
  }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0xd4503a, transparent: true, opacity: 0.85 }));
  l.rotation.x = -Math.PI / 2.4;
  l.position.y = -0.78;
  return l;
})();
erosionGroup.add(coastEdge);

// ===== PANEL 3 — Architecture nodes =====
const archGroup = new THREE.Group();
archGroup.position.x = 2 * SCENE_SPACING;
scene.add(archGroup);

const cloudCore = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.6, 1),
  new THREE.MeshStandardMaterial({ color: 0x1a5080, emissive: 0x2a8aaa, emissiveIntensity: 0.25, flatShading: true, transparent: true, opacity: 0.9 })
);
archGroup.add(cloudCore);

archGroup.add(new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.62, 1),
  new THREE.MeshBasicMaterial({ color: 0x2a8aaa, wireframe: true, transparent: true, opacity: 0.35 })
));

const orbitNodes = [];
const ORBIT_RADIUS = 3.2;
const orbitColors = [0x2a8aaa, 0xc9a86a, 0xd4503a, 0x2a8060];
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const node = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({ color: orbitColors[i % 4], emissive: orbitColors[i % 4], emissiveIntensity: 0.4, flatShading: true })
  );
  node.userData.angle = a;
  node.userData.speed = 0.2 + (i % 3) * 0.05;
  node.position.set(Math.cos(a) * ORBIT_RADIUS, Math.sin(i * 0.7) * 0.4, Math.sin(a) * ORBIT_RADIUS);
  archGroup.add(node);
  orbitNodes.push(node);

  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), node.position.clone()]),
    new THREE.LineBasicMaterial({ color: 0x2a8aaa, transparent: true, opacity: 0.15 })
  );
  archGroup.add(line);
  node.userData.line = line;
}

// ===== PANEL 4 — Wave background =====
const sensorsGroup = new THREE.Group();
sensorsGroup.position.x = 3 * SCENE_SPACING;
scene.add(sensorsGroup);

const wavePlane = new THREE.PlaneGeometry(20, 8, 120, 40);
const wavePos = wavePlane.attributes.position;
const waveOrig = new Float32Array(wavePos.count * 3);
for (let i = 0; i < wavePos.count; i++) {
  waveOrig[i*3] = wavePos.getX(i);
  waveOrig[i*3+1] = wavePos.getY(i);
  waveOrig[i*3+2] = 0;
}
const waveMesh = new THREE.Mesh(wavePlane, new THREE.MeshBasicMaterial({
  color: 0x2a8aaa, wireframe: true, transparent: true, opacity: 0.14,
}));
waveMesh.rotation.x = -Math.PI / 2.6;
waveMesh.position.y = -2.5;
sensorsGroup.add(waveMesh);

// ===== PANEL 5 — Torus knot =====
const procGroup = new THREE.Group();
procGroup.position.x = 4 * SCENE_SPACING;
scene.add(procGroup);

const torus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.6, 0.32, 200, 24, 2, 3),
  new THREE.MeshStandardMaterial({ color: 0x1a5080, emissive: 0x2a8aaa, emissiveIntensity: 0.4, metalness: 0.6, roughness: 0.3 })
);
torus.position.set(2.5, 0.2, -1);
procGroup.add(torus);

const procParticles = (() => {
  const N = 400;
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = 1.7 + Math.random() * 1.5;
    pos[i*3] = 2.5 + Math.cos(a) * r;
    pos[i*3+1] = 0.2 + (Math.random() - 0.5) * 1.5;
    pos[i*3+2] = -1 + Math.sin(a) * r;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0x2a8aaa, size: 0.04, transparent: true, opacity: 0.5 }));
})();
procGroup.add(procParticles);

// ===== PANEL 6 — Cycle ring =====
const cycleGroup = new THREE.Group();
cycleGroup.position.x = 5 * SCENE_SPACING;
scene.add(cycleGroup);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2, 0.04, 16, 96),
  new THREE.MeshBasicMaterial({ color: 0x8a7040, transparent: true, opacity: 0.45 })
);
ring.position.x = -2.5;
ring.rotation.x = Math.PI / 2;
cycleGroup.add(ring);

const stationColors = [0x2a8aaa, 0xc9a86a, 0xd4503a, 0x2a8060];
for (let i = 0; i < 4; i++) {
  const a = (i / 4) * Math.PI * 2;
  const s = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({ color: stationColors[i], emissive: stationColors[i], emissiveIntensity: 0.4, flatShading: true })
  );
  s.position.set(-2.5 + Math.cos(a) * 2, Math.sin(a) * 2, 0);
  cycleGroup.add(s);
}

// ===== PANEL 7 — Coin stacks =====
const budgetGroup = new THREE.Group();
budgetGroup.position.x = 6 * SCENE_SPACING;
scene.add(budgetGroup);

const makeCoinStack = (x, y, z, count, color) => {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32),
      new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3, emissive: color, emissiveIntensity: 0.08 })
    );
    c.position.y = i * 0.09;
    group.add(c);
  }
  group.position.set(x, y, z);
  return group;
};
const coinA = makeCoinStack(3.5, -1.2, -0.5, 8, 0x2a8aaa);
const coinB = makeCoinStack(4.5, -1.2, 0.3, 4, 0xc9a86a);
const coinC = makeCoinStack(3.0, -1.2, 1.0, 2, 0x8a7040);
budgetGroup.add(coinA, coinB, coinC);

// ===== PANEL 8 — Closing sphere =====
const closeGroup = new THREE.Group();
closeGroup.position.x = 7 * SCENE_SPACING;
scene.add(closeGroup);

const closeSphere = new THREE.Mesh(
  new THREE.SphereGeometry(2.6, 32, 24),
  new THREE.MeshBasicMaterial({ color: 0x2a8aaa, wireframe: true, transparent: true, opacity: 0.15 })
);
closeGroup.add(closeSphere);

closeGroup.add(new THREE.Mesh(
  new THREE.SphereGeometry(1.4, 64, 64),
  new THREE.MeshStandardMaterial({ color: 0x1a5080, emissive: 0x2a6080, emissiveIntensity: 0.3, roughness: 0.6, metalness: 0.2 })
));

// ===== Scroll =====
let scrollProgress = 0;
let targetCameraX = 0;
let currentCameraX = 0;

function updateScroll() {
  const max = document.body.scrollHeight - window.innerHeight;
  scrollProgress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  targetCameraX = scrollProgress * (N_PANELS - 1) * SCENE_SPACING;
}
window.addEventListener('scroll', updateScroll, { passive: true });

// ===== Animation loop =====
const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();
  const t = clock.getElapsedTime();

  currentCameraX += (targetCameraX - currentCameraX) * 0.08;
  camera.position.x = currentCameraX;
  camera.position.y = 0.4 + Math.sin(t * 0.4) * 0.05;
  camera.lookAt(currentCameraX, 0, 0);

  // Panel 1
  earth.rotation.y += dt * 0.06;
  grid.rotation.y -= dt * 0.04;
  coastline.rotation.y += dt * 0.08;
  const satA = t * 0.45, satR = 3.6;
  satellite.position.set(Math.cos(satA) * satR, 0.5 + Math.sin(t * 0.6) * 0.3, Math.sin(satA) * satR);
  satellite.lookAt(0, 0, 0);
  beam.geometry.setFromPoints([new THREE.Vector3(), satellite.position.clone()]);
  beam.computeLineDistances();

  // Panel 3
  orbitNodes.forEach((n, i) => {
    n.userData.angle += dt * n.userData.speed;
    const a = n.userData.angle;
    n.position.x = Math.cos(a) * ORBIT_RADIUS;
    n.position.z = Math.sin(a) * ORBIT_RADIUS;
    n.position.y = Math.sin(t * 0.6 + i) * 0.4;
    n.rotation.x += dt * 0.4;
    n.rotation.y += dt * 0.6;
    if (n.userData.line) {
      n.userData.line.geometry.setFromPoints([new THREE.Vector3(), n.position.clone()]);
    }
  });
  cloudCore.rotation.x += dt * 0.1;
  cloudCore.rotation.y += dt * 0.15;

  // Panel 4 — waves
  for (let i = 0; i < wavePos.count; i++) {
    const x = waveOrig[i*3], y = waveOrig[i*3+1];
    wavePos.setZ(i, Math.sin(x * 0.6 + t * 1.2) * 0.18 + Math.sin(y * 0.9 + t * 0.7) * 0.12);
  }
  wavePos.needsUpdate = true;

  // Panel 5
  torus.rotation.x += dt * 0.3;
  torus.rotation.y += dt * 0.25;
  procParticles.rotation.y += dt * 0.15;

  // Panel 6
  const stations = cycleGroup.children.slice(1);
  stations.forEach((s, i) => {
    const a = (i / stations.length) * Math.PI * 2 + t * 0.3;
    s.position.set(-2.5 + Math.cos(a) * 2, Math.sin(a) * 2, 0);
    s.rotation.x += dt * 0.5;
    s.rotation.y += dt * 0.7;
  });

  // Panel 7
  [coinA, coinB, coinC].forEach((c, i) => {
    c.position.y = -1.2 + Math.sin(t * 0.5 + i) * 0.08;
    c.rotation.y += dt * (0.2 + i * 0.05);
  });

  // Panel 8
  closeSphere.rotation.y += dt * 0.05;
  closeSphere.rotation.x += dt * 0.03;

  particles.rotation.y += dt * 0.005;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}
window.addEventListener('resize', resize);
resize();
updateScroll();
animate();
