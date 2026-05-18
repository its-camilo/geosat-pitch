import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createPanel0(scene, positionX) {
  const group = new THREE.Group();
  group.position.x = positionX;
  scene.add(group);

  const ANCHOR_X = -6;
  const terrainW = 13, terrainH = 7, terrainSeg = 70;
  const tGeo = new THREE.PlaneGeometry(terrainW, terrainH, terrainSeg, terrainSeg);
  const tPos = tGeo.attributes.position;
  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i), y = tPos.getY(i);
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
  terrain.position.set(ANCHOR_X, -1.0, 0);
  group.add(terrain);

  const coastPts = [];
  for (let xi = -terrainW / 2; xi <= terrainW / 2; xi += 0.1) {
    coastPts.push(new THREE.Vector3(xi, -1.2 + Math.sin(xi * 0.7) * 0.5 + Math.sin(xi * 2.1) * 0.18, 0));
  }
  const coastEdge = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(coastPts),
    new THREE.LineBasicMaterial({ color: 0xffcd00, transparent: true, opacity: 0.9 })
  );
  coastEdge.rotation.x = -Math.PI / 2.5;
  coastEdge.position.set(ANCHOR_X, -0.98, 0);
  group.add(coastEdge);

  for (let i = 0; i < 5; i++) {
    const xi = -2 + i * 1.1;
    const yi = -1.2 + Math.sin(xi * 0.7) * 0.5 + Math.sin(xi * 2.1) * 0.18;
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffcd00 })
    );
    const w = new THREE.Group();
    w.rotation.x = -Math.PI / 2.5;
    w.position.set(ANCHOR_X, -0.97, 0);
    m.position.set(xi, yi, 0);
    w.add(m);
    group.add(w);
  }

  const scanPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.04, terrainH, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  scanPlane.rotation.x = -Math.PI / 2.5;
  scanPlane.position.set(ANCHOR_X, -0.96, 0.01);
  group.add(scanPlane);

  let scanX = -terrainW / 2;

  return {
    group,
    update(dt, t) {
      scanX += dt * 2.2;
      if (scanX > terrainW / 2) scanX = -terrainW / 2;
      scanPlane.position.x = ANCHOR_X + scanX;
      const retreatOffset = Math.sin(t * 0.06) * 0.4;
      coastEdge.position.x = ANCHOR_X + retreatOffset;
      terrain.position.x   = ANCHOR_X + retreatOffset * 0.5;
    },
  };
}
