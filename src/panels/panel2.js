import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createPanel2(scene, positionX) {
  const group = new THREE.Group();
  group.position.x = positionX;
  scene.add(group);

  const phonePositions = [-3.5, 0, 3.5];
  const screenColors   = [0x2a4a6a, 0x213362, 0x575756];
  const bodyColors     = [0x3d4a5f, 0x4a4d52, 0x343e4f];
  const bubbleColors   = [0xffcd00, 0x213362, 0xdadada];

  phonePositions.forEach((px, i) => {
    const ph = new THREE.Group();
    ph.position.set(px, 0, 0);
    ph.rotation.y = (i - 1) * -0.18;

    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.99, 1.86, 0.125),
      new THREE.MeshStandardMaterial({ color: 0x1a1f28, metalness: 0.55, roughness: 0.65 })
    );
    bezel.position.set(0, 0, -0.008);
    bezel.scale.set(1.02, 1.02, 0.92);
    ph.add(bezel);

    ph.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.82, 0.12),
      new THREE.MeshPhysicalMaterial({
        color: bodyColors[i], metalness: 0.82, roughness: 0.38, clearcoat: 0.22, clearcoatRoughness: 0.55,
      })
    ));

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 1.42),
      new THREE.MeshPhysicalMaterial({
        color: screenColors[i], metalness: 0.15, roughness: 0.25,
        clearcoat: 0.4, clearcoatRoughness: 0.2, transparent: true, opacity: 0.92,
      })
    );
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

    for (let b = 0; b < 2; b++) {
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: bubbleColors[i], transparent: true, opacity: 0.75 })
      );
      bubble.position.set((Math.random() - 0.5) * 0.4, 0.9 + b * 0.35, 0.06);
      bubble.userData.startY = bubble.position.y;
      bubble.userData.phase  = b * Math.PI + i;
      ph.add(bubble);
    }

    group.add(ph);
  });

  return {
    group,
    update(dt, t) {
      group.children.forEach(ph => {
        ph.children.forEach(child => {
          if (child.userData.startY !== undefined) {
            child.position.y = child.userData.startY + Math.sin(t * 1.2 + child.userData.phase) * 0.15;
            child.material.opacity = 0.5 + Math.sin(t * 1.5 + child.userData.phase) * 0.25;
          }
        });
      });
    },
  };
}
