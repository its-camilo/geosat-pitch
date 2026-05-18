import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xffffff, 0.016);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.5, 14);

scene.add(new THREE.AmbientLight(0xc5cedd, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 0.8);
key.position.set(6, 8, 7);
scene.add(key);
const rim = new THREE.DirectionalLight(0x213362, 0.45);
rim.position.set(-8, 2, -4);
scene.add(rim);

const SCENE_SPACING = 16;
const N_PANELS = 6;

// Subtle floating particles (visible on white)
const bgParticles = (() => {
  const g = new THREE.BufferGeometry();
  const N = 500;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 160;
    pos[i*3+1] = (Math.random() - 0.5) * 50;
    pos[i*3+2] = (Math.random() - 0.5) * 28 - 6;
    const t = Math.random();
    col[i*3]   = 0.12 + t * 0.15;
    col[i*3+1] = 0.22 + t * 0.2;
    col[i*3+2] = 0.38 + t * 0.25;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.4, sizeAttenuation: true });
  const p = new THREE.Points(g, m);
  scene.add(p);
  return p;
})();

// =============================================================
// PANEL 0 — Eroding coastline (camera scanning a retreating shore)
// =============================================================
const p0 = new THREE.Group();
p0.position.x = 0;
scene.add(p0);

// Terrain — positioned right of center so text lives on the left
const terrainW = 13, terrainH = 7, terrainSeg = 70;
const tGeo = new THREE.PlaneGeometry(terrainW, terrainH, terrainSeg, terrainSeg);
const tPos = tGeo.attributes.position;
let retreatOffset = 0; // animated
const tBase = new Float32Array(tPos.count * 2); // store x,y base for retreat
for (let i = 0; i < tPos.count; i++) {
  const x = tPos.getX(i), y = tPos.getY(i);
  tBase[i*2]   = x;
  tBase[i*2+1] = y;
  const coastY = -1.2 + Math.sin(x * 0.7) * 0.5 + Math.sin(x * 2.1) * 0.18;
  const z = y > coastY
    ? Math.min((y - coastY) * 0.38, 0.85) + Math.sin(x * 0.9 + y * 0.6) * 0.07
    : -0.12 + Math.sin(x * 1.4 + y * 0.8) * 0.04;
  tPos.setZ(i, z);
}
tGeo.computeVertexNormals();

const terrain = new THREE.Mesh(tGeo, new THREE.MeshStandardMaterial({
  color: 0x213362, wireframe: true, transparent: true, opacity: 0.28,
}));
terrain.rotation.x = -Math.PI / 2.5;
terrain.position.set(3.5, -1.0, 0);
p0.add(terrain);

// Glowing coastline edge
const coastPts = [];
for (let xi = -terrainW/2; xi <= terrainW/2; xi += 0.1) {
  coastPts.push(new THREE.Vector3(xi, -1.2 + Math.sin(xi * 0.7) * 0.5 + Math.sin(xi * 2.1) * 0.18, 0));
}
const coastEdge = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(coastPts),
  new THREE.LineBasicMaterial({ color: 0xffcd00, transparent: true, opacity: 0.9 })
);
coastEdge.rotation.x = -Math.PI / 2.5;
coastEdge.position.set(3.5, -0.98, 0);
p0.add(coastEdge);

// Erosion marker spheres along the coast
for (let i = 0; i < 5; i++) {
  const xi = -2 + i * 1.1;
  const yi = -1.2 + Math.sin(xi * 0.7) * 0.5 + Math.sin(xi * 2.1) * 0.18;
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffcd00 })
  );
  const w = new THREE.Group();
  w.rotation.x = -Math.PI / 2.5;
  w.position.set(3.5, -0.97, 0);
  m.position.set(xi, yi, 0);
  w.add(m);
  p0.add(w);
}

// Scanning beam (animated plane sweeping over terrain)
const scanPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(0.04, terrainH, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
);
scanPlane.rotation.x = -Math.PI / 2.5;
scanPlane.position.set(3.5, -0.96, 0.01);
p0.add(scanPlane);

// =============================================================
// PANEL 1 — GeoSAT: Phone + CoastSeg mesh + Satellite
// =============================================================
const p1 = new THREE.Group();
p1.position.x = SCENE_SPACING;
scene.add(p1);

// Phone body (left side)
const phoneMat = new THREE.MeshStandardMaterial({ color: 0x213362, metalness: 0.7, roughness: 0.3 });
const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.1), phoneMat);
phoneBody.position.set(-4, 0.2, 0);
phoneBody.rotation.y = Math.PI / 8;
p1.add(phoneBody);
const phoneScreen = new THREE.Mesh(
  new THREE.PlaneGeometry(0.58, 1.1),
  new THREE.MeshBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.85 })
);
phoneScreen.position.set(-4.015 + 0.035, 0.2, 0.056);
phoneScreen.rotation.y = Math.PI / 8;
p1.add(phoneScreen);

// Coastline extraction wireframe (center)
const extractGeo = new THREE.PlaneGeometry(3, 2, 24, 16);
const extractPos = extractGeo.attributes.position;
for (let i = 0; i < extractPos.count; i++) {
  const x = extractPos.getX(i), y = extractPos.getY(i);
  extractPos.setZ(i, Math.sin(x * 1.5) * 0.12 + Math.sin(y * 2.1) * 0.08);
}
extractGeo.computeVertexNormals();
const extractMesh = new THREE.Mesh(extractGeo, new THREE.MeshBasicMaterial({
  color: 0x213362, wireframe: true, transparent: true, opacity: 0.35,
}));
extractMesh.rotation.x = -Math.PI / 5;
extractMesh.position.set(0, -0.2, 0);
p1.add(extractMesh);

// Extracted coastline line (the key output)
const extractLinePts = [];
for (let xi = -1.5; xi <= 1.5; xi += 0.05) {
  extractLinePts.push(new THREE.Vector3(xi, Math.sin(xi * 1.5) * 0.12, 0));
}
const extractLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(extractLinePts),
  new THREE.LineBasicMaterial({ color: 0xffcd00, transparent: true, opacity: 0.9 })
);
extractLine.rotation.x = -Math.PI / 5;
extractLine.position.set(0, -0.2, 0.01);
p1.add(extractLine);

// Satellite (right side, reuse existing approach)
const sat1 = new THREE.Group();
const s1Body = new THREE.Mesh(
  new THREE.BoxGeometry(0.35, 0.3, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0, metalness: 0.6, roughness: 0.4 })
);
sat1.add(s1Body);
[-0.65, 0.65].forEach(x => {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.02, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x1a2b6c, emissive: 0x0a1144, emissiveIntensity: 0.6 })
  );
  panel.position.set(x, 0, 0);
  sat1.add(panel);
});
sat1.position.set(4, 1.5, -1);
sat1.rotation.z = Math.PI / 6;
p1.add(sat1);

// Data flow: phone → extract → satellite (dashed lines)
const flowLine1 = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-3.5, 0, 0), new THREE.Vector3(-1.5, -0.2, 0)
  ]),
  new THREE.LineDashedMaterial({ color: 0x213362, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.45 })
);
flowLine1.computeLineDistances();
p1.add(flowLine1);

const flowLine2 = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(1.5, -0.2, 0), new THREE.Vector3(3.5, 1.2, -0.5)
  ]),
  new THREE.LineDashedMaterial({ color: 0x213362, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.45 })
);
flowLine2.computeLineDistances();
p1.add(flowLine2);

// =============================================================
// PANEL 2 — 3 Phones: WhatsApp + Accessibility + Facebook
// =============================================================
const p2 = new THREE.Group();
p2.position.x = 2 * SCENE_SPACING;
scene.add(p2);

const phonePositions = [-3.5, 0, 3.5];
const screenColors   = [0x2a4a6a, 0x213362, 0x575756];

phonePositions.forEach((px, i) => {
  const ph = new THREE.Group();
  ph.position.set(px, 0, 0);
  ph.rotation.y = (i - 1) * -0.18;

  const bodyColor = [0x3d4a5f, 0x4a4d52, 0x343e4f][i];

  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.99, 1.86, 0.125),
    new THREE.MeshStandardMaterial({
      color: 0x1a1f28,
      metalness: 0.55,
      roughness: 0.65,
    })
  );
  bezel.position.set(0, 0, -0.008);
  bezel.scale.set(1.02, 1.02, 0.92);
  ph.add(bezel);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 1.82, 0.12),
    new THREE.MeshPhysicalMaterial({
      color: bodyColor,
      metalness: 0.82,
      roughness: 0.38,
      clearcoat: 0.22,
      clearcoatRoughness: 0.55,
    })
  );
  ph.add(body);

  const screenMat = new THREE.MeshPhysicalMaterial({
    color: screenColors[i],
    metalness: 0.15,
    roughness: 0.25,
    transmission: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    transparent: true,
    opacity: 0.92,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.42), screenMat);
  screen.position.set(0, 0, 0.063);
  ph.add(screen);

  const notch = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.045, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x0a0c10, metalness: 0.3, roughness: 0.8 })
  );
  notch.position.set(0, 0.805, 0.068);
  ph.add(notch);

  const camBump = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0x2a3038, metalness: 0.9, roughness: 0.35 })
  );
  camBump.rotation.x = Math.PI / 2;
  camBump.position.set(0.38, 0.78, -0.055);
  ph.add(camBump);

  // Notification bubble rising
  for (let b = 0; b < 2; b++) {
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: [0xffcd00, 0x213362, 0xdadada][i], transparent: true, opacity: 0.75 })
    );
    bubble.position.set((Math.random() - 0.5) * 0.4, 0.9 + b * 0.35, 0.06);
    bubble.userData.startY = bubble.position.y;
    bubble.userData.phase  = b * Math.PI + i;
    ph.add(bubble);
  }

  p2.add(ph);
  ph.userData.idx = i;
});

// =============================================================
// PANEL 3 — Data pipeline nodes
// =============================================================
const p3 = new THREE.Group();
p3.position.x = 3 * SCENE_SPACING;
scene.add(p3);

// 3 input nodes (left)
const inputColors = [0x213362, 0xffcd00, 0x575756];
const inputNodes  = [];
[-1.4, 0, 1.4].forEach((y, i) => {
  const n = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshStandardMaterial({ color: inputColors[i], emissive: inputColors[i], emissiveIntensity: 0.35, flatShading: true })
  );
  n.position.set(-4.5, y, 0);
  n.userData.baseY = y;
  p3.add(n);
  inputNodes.push(n);
});

// Central cloud icosahedron
const cloudNode = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.1, 1),
  new THREE.MeshStandardMaterial({ color: 0x213362, emissive: 0xffcd00, emissiveIntensity: 0.18, flatShading: true, transparent: true, opacity: 0.92 })
);
cloudNode.position.set(0, 0, 0);
p3.add(cloudNode);

p3.add(new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.12, 1),
  new THREE.MeshBasicMaterial({ color: 0x213362, wireframe: true, transparent: true, opacity: 0.28 })
));

// 3 output nodes (right)
const outputColors = [0xffcd00, 0x575756, 0x213362];
const outputNodes  = [];
[-1.2, 0, 1.2].forEach((y, i) => {
  const n = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({ color: outputColors[i], emissive: outputColors[i], emissiveIntensity: 0.4, flatShading: true })
  );
  n.position.set(4.2, y, 0);
  n.userData.baseY = y;
  p3.add(n);
  outputNodes.push(n);
});

// Connection lines: inputs → cloud, cloud → outputs
inputNodes.forEach(n => {
  const l = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([n.position.clone(), cloudNode.position.clone()]),
    new THREE.LineBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.2 })
  );
  p3.add(l);
  n.userData.line = l;
});

// Flowing particles on data streams
const streamParticles = (() => {
  const g = new THREE.BufferGeometry();
  const N = 120;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    const srcY = [-1.4, 0, 1.4][Math.floor(Math.random() * 3)];
    pos[i*3]   = THREE.MathUtils.lerp(-4.5, 0, t);
    pos[i*3+1] = THREE.MathUtils.lerp(srcY, 0, t);
    pos[i*3+2] = (Math.random() - 0.5) * 0.3;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.userData.t = new Float32Array(N).map(() => Math.random());
  const m = new THREE.PointsMaterial({ color: 0x213362, size: 0.06, transparent: true, opacity: 0.6 });
  const p = new THREE.Points(g, m);
  p3.add(p);
  return p;
})();

// =============================================================
// PANEL 4 — Viabilidad: pilas de monedas + billetes (abanico)
// =============================================================
const p4 = new THREE.Group();
p4.position.x = 4 * SCENE_SPACING;
scene.add(p4);

const p4Motion =
  typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 1
    : 0.22;

/** Pilas tipo “torta”: disco biselado + material por moneda (ripple de brillo) */
function makeCoinStack(x, y, z, discCount, hex) {
  const g = new THREE.Group();
  const col = new THREE.Color(hex);
  const h = 0.046;
  const sep = 0.0025;
  for (let i = 0; i < discCount; i++) {
    const taper = i * 0.0018;
    const rBot = 0.39 - taper;
    const rTop = Math.max(0.3, rBot - 0.032);
    const discMat = new THREE.MeshStandardMaterial({
      color: col.clone().multiplyScalar(1 - i * 0.012),
      metalness: 0.88 + i * 0.003,
      roughness: 0.11 + i * 0.006,
      emissive: col,
      emissiveIntensity: 0.042 + (discCount - i) * 0.004,
    });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 52, 1), discMat);
    disc.position.y = i * (h + sep);
    disc.rotation.y = i * 0.38;
    disc.userData.stackPhase = i * 0.21;
    disc.userData.stackIndex = i;
    disc.userData.baseY = disc.position.y;
    disc.userData.baseRotY = disc.rotation.y;
    g.add(disc);
  }
  g.position.set(x, y, z);
  g.userData.basePos = new THREE.Vector3(x, y, z);
  g.userData.discCount = discCount;
  return g;
}

/** Abanico de billetes (planos) al lado de la pila “oro” */
function makeBillFan(x, y, z, count) {
  const grp = new THREE.Group();
  const baseHue = 0.28;
  for (let i = 0; i < count; i++) {
    const c = new THREE.Color().setHSL(baseHue + i * 0.012, 0.45 + i * 0.04, 0.32 + i * 0.02);
    const mat = new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.78,
      metalness: 0.06,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0x062a18),
      emissiveIntensity: 0.035,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.24), mat);
    const spread = count > 1 ? (i / (count - 1) - 0.5) * 0.95 : 0;
    mesh.rotation.y = spread * 0.55;
    mesh.rotation.x = spread * 0.08;
    mesh.position.set(Math.sin(spread) * 0.06, i * 0.0032, Math.cos(spread) * 0.04);
    mesh.userData.billPhase = i * 0.55 + spread;
    grp.add(mesh);
  }
  grp.position.set(x, y, z);
  grp.rotation.x = -0.12;
  grp.rotation.y = 0.28;
  grp.userData.basePos = new THREE.Vector3(x, y, z);
  return grp;
}

const coinA = makeCoinStack(-1.05, -1.32, 0.18, 12, 0x213362);
const coinB = makeCoinStack(0.52, -1.36, 0.12, 8, 0xffcd00);
const coinC = makeCoinStack(1.82, -1.34, -0.08, 5, 0x575756);
const billFan = makeBillFan(-0.38, -1.34, 0.2, 6);

const p4CoinGlow = new THREE.PointLight(0xffe8a8, 0.42, 5.5, 1.9);
p4CoinGlow.position.set(0.52, -0.85, 1.35);
p4.add(p4CoinGlow);

p4.add(coinA, coinB, coinC, billFan);

// =============================================================
// PANEL 5 — Closing: Colombia Caribbean coast network
// =============================================================
const p5 = new THREE.Group();
p5.position.x = 5 * SCENE_SPACING;
scene.add(p5);

const colombiaCities = [
  { x: -4.5, y: 1.4 },
  { x: -2.8, y: 1.0 },
  { x: -1.0, y: 0.3 },
  { x:  1.2, y: -0.5 },
  { x:  3.0, y: -1.4 },
  { x:  4.8, y: -2.5 },
];

const coastCurve = new THREE.CatmullRomCurve3(
  colombiaCities.map(c => new THREE.Vector3(c.x, c.y, 0))
);
const coastNetwork = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(coastCurve.getPoints(120)),
  new THREE.LineBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.55 })
);
p5.add(coastNetwork);

const cityGroups = [];
colombiaCities.forEach((c, i) => {
  const g = new THREE.Group();
  g.position.set(c.x, c.y, 0);
  const isDibulla = i === 0;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(isDibulla ? 0.22 : 0.13, 12, 12),
    new THREE.MeshStandardMaterial({
      color: isDibulla ? 0xffcd00 : 0x213362,
      emissive: isDibulla ? 0xffcd00 : 0x213362,
      emissiveIntensity: 0.15,
    })
  );
  g.add(sphere);
  for (let r = 0; r < 2; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(isDibulla ? 0.35 + r * 0.22 : 0.22 + r * 0.16, 0.02, 8, 40),
      new THREE.MeshBasicMaterial({ color: isDibulla ? 0xffcd00 : 0xdadada, transparent: true, opacity: 0 })
    );
    g.add(ring);
  }
  p5.add(g);
  cityGroups.push({ g, sphere, cityT: i / (colombiaCities.length - 1) });
});

// Wave traveler particle
const waveTraveler = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffcd00, transparent: true, opacity: 0.9 })
);
p5.add(waveTraveler);
let waveT = 0;

const fogDark  = new THREE.Color(0xffffff);
const fogLight = new THREE.Color(0xffffff);

// =============================================================
// Scroll tracking
// =============================================================
let scrollProgress = 0;
let targetCameraX  = 0;
let currentCameraX = 0;

function updateScroll() {
  const max = document.body.scrollHeight - window.innerHeight;
  scrollProgress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  targetCameraX  = scrollProgress * (N_PANELS - 1) * SCENE_SPACING;
}
window.addEventListener('scroll', updateScroll, { passive: true });

// =============================================================
// Animation loop
// =============================================================
const clock = new THREE.Clock();
let scanX = -terrainW / 2;

function animate() {
  const dt = clock.getDelta();
  const t  = clock.getElapsedTime();

  currentCameraX += (targetCameraX - currentCameraX) * 0.08;
  camera.position.x = currentCameraX;
  camera.position.y = 0.4 + Math.sin(t * 0.38) * 0.04;
  camera.lookAt(currentCameraX, 0, 0);

  // Dynamic fog: dark at panel 0, light for panels 1–5
  scene.fog.color.lerpColors(fogDark, fogLight, Math.min(1, scrollProgress * (N_PANELS - 1)));

  // --- Panel 0: scanning coastline ---
  scanX += dt * 2.2;
  if (scanX > terrainW / 2) scanX = -terrainW / 2;
  scanPlane.position.x = 3.5 + scanX; // relative to group
  // slowly retreat coastline edge
  retreatOffset = Math.sin(t * 0.06) * 0.4;
  coastEdge.position.x = 3.5 + retreatOffset;
  terrain.position.x   = 3.5 + retreatOffset * 0.5;

  // --- Panel 1: satellite + extraction ---
  const satA1 = t * 0.5;
  sat1.position.set(4 + Math.cos(satA1) * 1.5, 1.2 + Math.sin(t * 0.7) * 0.3, -1 + Math.sin(satA1) * 0.5);
  sat1.rotation.y += dt * 0.3;
  // animate extracted coastline (slight wave morph)
  const ePts = extractLine.geometry.attributes.position;
  for (let i = 0; i < ePts.count; i++) {
    const xi = -1.5 + i * 0.05;
    ePts.setY(i, Math.sin(xi * 1.5 + t * 0.5) * 0.12 + Math.sin(t * 0.3) * 0.04);
  }
  ePts.needsUpdate = true;

  // --- Panel 2: phone notification bubbles float ---
  p2.children.forEach(ph => {
    if (!ph.userData) return;
    ph.children.forEach(child => {
      if (child.userData && child.userData.startY !== undefined) {
        child.position.y = child.userData.startY + Math.sin(t * 1.2 + child.userData.phase) * 0.15;
        child.material.opacity = 0.5 + Math.sin(t * 1.5 + child.userData.phase) * 0.25;
      }
    });
  });

  // --- Panel 3: cloud + orbit nodes ---
  cloudNode.rotation.x += dt * 0.1;
  cloudNode.rotation.y += dt * 0.14;
  inputNodes.forEach((n, i) => {
    n.position.y = n.userData.baseY + Math.sin(t * 0.6 + i) * 0.2;
    n.rotation.x += dt * 0.4;
    n.rotation.y += dt * 0.6;
    if (n.userData.line) {
      n.userData.line.geometry.setFromPoints([n.position.clone(), cloudNode.position.clone()]);
    }
  });
  outputNodes.forEach((n, i) => {
    n.position.y = n.userData.baseY + Math.sin(t * 0.5 + i + 2) * 0.2;
    n.rotation.x += dt * 0.5;
  });
  // animate stream particles
  const sp = streamParticles.geometry.attributes.position;
  const st = streamParticles.geometry.userData.t;
  for (let i = 0; i < st.length; i++) {
    st[i] = (st[i] + dt * 0.25) % 1.0;
    const srcY = [-1.4, 0, 1.4][i % 3];
    sp.setX(i, THREE.MathUtils.lerp(-4.5, 0, st[i]));
    sp.setY(i, THREE.MathUtils.lerp(srcY, 0, st[i]));
  }
  sp.needsUpdate = true;

  // --- Viabilidad (p4): monedas + billetes — anclaje suave, brillo en cascada, abanico vivo ---
  const m4 = p4Motion;
  const drift = 0.026 * m4;
  [coinA, coinB, coinC].forEach((stack, si) => {
    const b = stack.userData.basePos;
    stack.position.set(
      b.x + Math.cos(t * 0.31 + si * 1.18) * drift,
      b.y + Math.sin(t * 0.48 + si * 1.12) * drift * 0.88 + Math.sin(t * 0.72 + si) * 0.012 * m4,
      b.z + Math.sin(t * 0.23 + si * 0.68) * drift * 0.72
    );
    stack.rotation.y += dt * (0.095 + si * 0.032) * m4;
    stack.rotation.z = Math.sin(t * 0.36 + si * 0.88) * 0.038 * m4;
    stack.rotation.x = Math.sin(t * 0.21 + si * 0.55) * 0.022 * m4;

    const n = stack.userData.discCount ?? stack.children.length;
    stack.children.forEach((disc, di) => {
      if (disc.userData.stackPhase === undefined) return;
      const ph = disc.userData.stackPhase;
      const mat = disc.material;
      const ripple = Math.sin(t * 1.65 - di * 0.4 + si * 0.55) * 0.5 + 0.5;
      mat.emissiveIntensity = (0.038 + (n - di) * 0.0045 + ripple * 0.052 + si * 0.006) * m4 + 0.018;

      disc.rotation.x = Math.sin(t * 1.08 + ph) * 0.034 * m4;
      disc.rotation.y = (disc.userData.baseRotY ?? 0) + t * (0.22 + si * 0.07) * m4;
      disc.position.y = disc.userData.baseY + Math.sin(t * 1.02 + ph + si * 0.35) * 0.016 * m4;
      disc.position.x = Math.sin(t * 0.92 + ph * 1.7) * 0.0085 * m4;
      disc.position.z = Math.cos(t * 0.84 + ph * 1.7) * 0.007 * m4;

      const isTop = di === n - 1;
      const pulseTop = 1 + Math.sin(t * 2.35 + si * 1.3) * 0.045 * m4;
      disc.scale.setScalar(isTop ? pulseTop : 1);
    });
  });

  p4CoinGlow.intensity = (0.28 + Math.sin(t * 2.05) * 0.16 + Math.cos(t * 1.1) * 0.08) * m4 + 0.06;
  p4CoinGlow.position.x = 0.52 + Math.sin(t * 0.9) * 0.06 * m4;
  p4CoinGlow.position.y = -0.82 + Math.sin(t * 1.4) * 0.05 * m4;

  const bf = billFan.userData.basePos;
  billFan.position.set(
    bf.x + Math.sin(t * 0.44) * 0.018 * m4,
    bf.y + Math.sin(t * 0.62 + 0.4) * 0.01 * m4,
    bf.z + Math.cos(t * 0.38) * 0.014 * m4
  );
  billFan.rotation.y = 0.28 + Math.sin(t * 0.4) * 0.14 * m4;
  billFan.rotation.z = Math.sin(t * 0.55) * 0.06 * m4;
  billFan.children.forEach((bill, bi) => {
    const ph = bill.userData.billPhase ?? bi;
    bill.rotation.z = Math.sin(t * 1.25 + ph) * 0.09 * m4;
    bill.position.y = bi * 0.0032 + Math.sin(t * 0.88 + ph) * 0.008 * m4;
    const bm = bill.material;
    if (bm && bm.emissiveIntensity !== undefined) {
      bm.emissiveIntensity = 0.03 + Math.sin(t * 1.5 + bi * 0.4) * 0.022 * m4;
    }
  });

  // --- Panel 5: Colombia coast wave propagation ---
  waveT = (waveT + dt * 0.09) % 1.0;
  const wp = coastCurve.getPoint(waveT);
  waveTraveler.position.set(wp.x, wp.y, 0.12);
  waveTraveler.material.opacity = 0.65 + Math.sin(t * 10) * 0.35;
  cityGroups.forEach(({ g, sphere, cityT }) => {
    const diff = ((waveT - cityT) + 1.5) % 1.0 - 0.5;
    const nearness = Math.max(0, 0.14 - Math.abs(diff)) / 0.14;
    sphere.material.emissiveIntensity = 0.12 + nearness * 0.88;
    g.children.slice(1).forEach((ring, ri) => {
      ring.material.opacity = nearness * (0.55 - ri * 0.18);
      ring.scale.setScalar(1 + (1 - nearness) * (0.4 + ri * 0.3));
    });
  });

  bgParticles.rotation.y += dt * 0.004;

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
