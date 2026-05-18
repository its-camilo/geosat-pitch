import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createPanel3(scene, positionX) {
  const group = new THREE.Group();
  group.position.x = positionX;
  scene.add(group);

  const inputColors = [0x213362, 0xffcd00, 0x575756];
  const inputNodes  = [];
  [-1.4, 0, 1.4].forEach((y, i) => {
    const n = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshStandardMaterial({ color: inputColors[i], emissive: inputColors[i], emissiveIntensity: 0.35, flatShading: true })
    );
    n.position.set(-4.5, y, 0);
    n.userData.baseY = y;
    group.add(n);
    inputNodes.push(n);
  });

  const cloudNode = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, 1),
    new THREE.MeshStandardMaterial({ color: 0x213362, emissive: 0xffcd00, emissiveIntensity: 0.18, flatShading: true, transparent: true, opacity: 0.92 })
  );
  group.add(cloudNode);

  group.add(new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.12, 1),
    new THREE.MeshBasicMaterial({ color: 0x213362, wireframe: true, transparent: true, opacity: 0.28 })
  ));

  const outputColors = [0xffcd00, 0x575756, 0x213362];
  const outputNodes  = [];
  [-1.2, 0, 1.2].forEach((y, i) => {
    const n = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshStandardMaterial({ color: outputColors[i], emissive: outputColors[i], emissiveIntensity: 0.4, flatShading: true })
    );
    n.position.set(4.2, y, 0);
    n.userData.baseY = y;
    group.add(n);
    outputNodes.push(n);
  });

  inputNodes.forEach(n => {
    const l = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([n.position.clone(), cloudNode.position.clone()]),
      new THREE.LineBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.2 })
    );
    group.add(l);
    n.userData.line = l;
  });

  const streamParticles = (() => {
    const g = new THREE.BufferGeometry();
    const N = 120;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = Math.random();
      const srcY = [-1.4, 0, 1.4][Math.floor(Math.random() * 3)];
      pos[i * 3]     = THREE.MathUtils.lerp(-4.5, 0, t);
      pos[i * 3 + 1] = THREE.MathUtils.lerp(srcY, 0, t);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.userData.t = new Float32Array(N).map(() => Math.random());
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x213362, size: 0.06, transparent: true, opacity: 0.6 }));
    group.add(p);
    return p;
  })();

  return {
    group,
    update(dt, t) {
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

      const sp = streamParticles.geometry.attributes.position;
      const st = streamParticles.geometry.userData.t;
      for (let i = 0; i < st.length; i++) {
        st[i] = (st[i] + dt * 0.25) % 1.0;
        const srcY = [-1.4, 0, 1.4][i % 3];
        sp.setX(i, THREE.MathUtils.lerp(-4.5, 0, st[i]));
        sp.setY(i, THREE.MathUtils.lerp(srcY, 0, st[i]));
      }
      sp.needsUpdate = true;
    },
  };
}
