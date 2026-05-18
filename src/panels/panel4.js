import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createPanel4(scene, positionX) {
  const group = new THREE.Group();
  group.position.x = positionX;
  scene.add(group);

  const motion =
    typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 1 : 0.22;

  function makeCoinStack(x, y, z, discCount, hex) {
    const g = new THREE.Group();
    const col = new THREE.Color(hex);
    const h = 0.046, sep = 0.0025;
    for (let i = 0; i < discCount; i++) {
      const taper = i * 0.0018;
      const rBot  = 0.39 - taper;
      const rTop  = Math.max(0.3, rBot - 0.032);
      const disc  = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBot, h, 52, 1),
        new THREE.MeshStandardMaterial({
          color: col.clone().multiplyScalar(1 - i * 0.012),
          metalness: 0.88 + i * 0.003, roughness: 0.11 + i * 0.006,
          emissive: col, emissiveIntensity: 0.042 + (discCount - i) * 0.004,
        })
      );
      disc.position.y = i * (h + sep);
      disc.rotation.y = i * 0.38;
      disc.userData.stackPhase = i * 0.21;
      disc.userData.baseY      = disc.position.y;
      disc.userData.baseRotY   = disc.rotation.y;
      g.add(disc);
    }
    g.position.set(x, y, z);
    g.userData.basePos   = new THREE.Vector3(x, y, z);
    g.userData.discCount = discCount;
    return g;
  }

  function makeBillFan(x, y, z, count) {
    const grp = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const c      = new THREE.Color().setHSL(0.28 + i * 0.012, 0.45 + i * 0.04, 0.32 + i * 0.02);
      const mesh   = new THREE.Mesh(
        new THREE.PlaneGeometry(0.52, 0.24),
        new THREE.MeshStandardMaterial({
          color: c, roughness: 0.78, metalness: 0.06, side: THREE.DoubleSide,
          emissive: new THREE.Color(0x062a18), emissiveIntensity: 0.035,
        })
      );
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

  const coinA   = makeCoinStack(-1.05, -1.32,  0.18, 12, 0x213362);
  const coinB   = makeCoinStack( 0.52, -1.36,  0.12,  8, 0xffcd00);
  const coinC   = makeCoinStack( 1.82, -1.34, -0.08,  5, 0x575756);
  const billFan = makeBillFan(-0.38, -1.34, 0.2, 6);

  const coinGlow = new THREE.PointLight(0xffe8a8, 0.42, 5.5, 1.9);
  coinGlow.position.set(0.52, -0.85, 1.35);
  group.add(coinGlow, coinA, coinB, coinC, billFan);

  return {
    group,
    update(dt, t) {
      const m = motion;
      const drift = 0.026 * m;

      [coinA, coinB, coinC].forEach((stack, si) => {
        const b = stack.userData.basePos;
        stack.position.set(
          b.x + Math.cos(t * 0.31 + si * 1.18) * drift,
          b.y + Math.sin(t * 0.48 + si * 1.12) * drift * 0.88 + Math.sin(t * 0.72 + si) * 0.012 * m,
          b.z + Math.sin(t * 0.23 + si * 0.68) * drift * 0.72
        );
        stack.rotation.y += dt * (0.095 + si * 0.032) * m;
        stack.rotation.z  = Math.sin(t * 0.36 + si * 0.88) * 0.038 * m;
        stack.rotation.x  = Math.sin(t * 0.21 + si * 0.55) * 0.022 * m;

        const n = stack.userData.discCount ?? stack.children.length;
        stack.children.forEach((disc, di) => {
          if (disc.userData.stackPhase === undefined) return;
          const ph     = disc.userData.stackPhase;
          const ripple = Math.sin(t * 1.65 - di * 0.4 + si * 0.55) * 0.5 + 0.5;
          disc.material.emissiveIntensity = (0.038 + (n - di) * 0.0045 + ripple * 0.052 + si * 0.006) * m + 0.018;
          disc.rotation.x  = Math.sin(t * 1.08 + ph) * 0.034 * m;
          disc.rotation.y  = (disc.userData.baseRotY ?? 0) + t * (0.22 + si * 0.07) * m;
          disc.position.y  = disc.userData.baseY + Math.sin(t * 1.02 + ph + si * 0.35) * 0.016 * m;
          disc.position.x  = Math.sin(t * 0.92 + ph * 1.7) * 0.0085 * m;
          disc.position.z  = Math.cos(t * 0.84 + ph * 1.7) * 0.007 * m;
          disc.scale.setScalar(di === n - 1 ? 1 + Math.sin(t * 2.35 + si * 1.3) * 0.045 * m : 1);
        });
      });

      coinGlow.intensity    = (0.28 + Math.sin(t * 2.05) * 0.16 + Math.cos(t * 1.1) * 0.08) * m + 0.06;
      coinGlow.position.x   = 0.52 + Math.sin(t * 0.9) * 0.06 * m;
      coinGlow.position.y   = -0.82 + Math.sin(t * 1.4) * 0.05 * m;

      const bf = billFan.userData.basePos;
      billFan.position.set(
        bf.x + Math.sin(t * 0.44) * 0.018 * m,
        bf.y + Math.sin(t * 0.62 + 0.4) * 0.01 * m,
        bf.z + Math.cos(t * 0.38) * 0.014 * m
      );
      billFan.rotation.y = 0.28 + Math.sin(t * 0.4) * 0.14 * m;
      billFan.rotation.z = Math.sin(t * 0.55) * 0.06 * m;
      billFan.children.forEach((bill, bi) => {
        const ph = bill.userData.billPhase ?? bi;
        bill.rotation.z  = Math.sin(t * 1.25 + ph) * 0.09 * m;
        bill.position.y  = bi * 0.0032 + Math.sin(t * 0.88 + ph) * 0.008 * m;
        if (bill.material.emissiveIntensity !== undefined) {
          bill.material.emissiveIntensity = 0.03 + Math.sin(t * 1.5 + bi * 0.4) * 0.022 * m;
        }
      });
    },
  };
}
