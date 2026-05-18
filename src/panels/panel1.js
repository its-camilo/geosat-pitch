import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createPanel1(scene, positionX) {
  const group = new THREE.Group();
  group.position.x = positionX;
  scene.add(group);

  // inner desplazado para quedar junto al terreno de panel0
  const inner = new THREE.Group();
  inner.position.x = 5;
  group.add(inner);

  const phoneMat = new THREE.MeshStandardMaterial({ color: 0x213362, metalness: 0.7, roughness: 0.3 });
  const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.1), phoneMat);
  phoneBody.position.set(-4, 0.2, 0);
  phoneBody.rotation.y = Math.PI / 8;
  inner.add(phoneBody);

  const phoneScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 1.1),
    new THREE.MeshBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.85 })
  );
  phoneScreen.position.set(-3.98, 0.2, 0.056);
  phoneScreen.rotation.y = Math.PI / 8;
  inner.add(phoneScreen);

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
  inner.add(extractMesh);

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
  inner.add(extractLine);

  const sat1 = new THREE.Group();
  sat1.add(new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.3, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xd8d0c0, metalness: 0.6, roughness: 0.4 })
  ));
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
  inner.add(sat1);

  const flowLine1 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.5, 0, 0), new THREE.Vector3(-1.5, -0.2, 0),
    ]),
    new THREE.LineDashedMaterial({ color: 0x213362, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.45 })
  );
  flowLine1.computeLineDistances();
  inner.add(flowLine1);

  const flowLine2 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1.5, -0.2, 0), new THREE.Vector3(3.5, 1.2, -0.5),
    ]),
    new THREE.LineDashedMaterial({ color: 0x213362, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.45 })
  );
  flowLine2.computeLineDistances();
  inner.add(flowLine2);

  return {
    group,
    update(dt, t) {
      const satA = t * 0.5;
      sat1.position.set(4 + Math.cos(satA) * 1.5, 1.2 + Math.sin(t * 0.7) * 0.3, -1 + Math.sin(satA) * 0.5);
      sat1.rotation.y += dt * 0.3;

      const ePts = extractLine.geometry.attributes.position;
      for (let i = 0; i < ePts.count; i++) {
        const xi = -1.5 + i * 0.05;
        ePts.setY(i, Math.sin(xi * 1.5 + t * 0.5) * 0.12 + Math.sin(t * 0.3) * 0.04);
      }
      ePts.needsUpdate = true;
    },
  };
}
