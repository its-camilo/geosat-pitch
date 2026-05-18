import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export function createPanel5(scene, positionX) {
  const group = new THREE.Group();
  group.position.x = positionX;
  scene.add(group);

  const cities = [
    { x: -4.5, y:  1.4 }, { x: -2.8, y:  1.0 }, { x: -1.0, y:  0.3 },
    { x:  1.2, y: -0.5 }, { x:  3.0, y: -1.4 }, { x:  4.8, y: -2.5 },
  ];

  const coastCurve = new THREE.CatmullRomCurve3(cities.map(c => new THREE.Vector3(c.x, c.y, 0)));
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(coastCurve.getPoints(120)),
    new THREE.LineBasicMaterial({ color: 0x213362, transparent: true, opacity: 0.55 })
  ));

  const cityGroups = cities.map((c, i) => {
    const g        = new THREE.Group();
    const isDibulla = i === 0;
    g.position.set(c.x, c.y, 0);

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
      g.add(new THREE.Mesh(
        new THREE.TorusGeometry(isDibulla ? 0.35 + r * 0.22 : 0.22 + r * 0.16, 0.02, 8, 40),
        new THREE.MeshBasicMaterial({ color: isDibulla ? 0xffcd00 : 0xdadada, transparent: true, opacity: 0 })
      ));
    }

    group.add(g);
    return { g, sphere, cityT: i / (cities.length - 1) };
  });

  const waveTraveler = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcd00, transparent: true, opacity: 0.9 })
  );
  group.add(waveTraveler);

  let waveT = 0;

  return {
    group,
    update(dt, t) {
      waveT = (waveT + dt * 0.09) % 1.0;
      const wp = coastCurve.getPoint(waveT);
      waveTraveler.position.set(wp.x, wp.y, 0.12);
      waveTraveler.material.opacity = 0.65 + Math.sin(t * 10) * 0.35;

      cityGroups.forEach(({ g, sphere, cityT }) => {
        const diff     = ((waveT - cityT) + 1.5) % 1.0 - 0.5;
        const nearness = Math.max(0, 0.14 - Math.abs(diff)) / 0.14;
        sphere.material.emissiveIntensity = 0.12 + nearness * 0.88;
        g.children.slice(1).forEach((ring, ri) => {
          ring.material.opacity = nearness * (0.55 - ri * 0.18);
          ring.scale.setScalar(1 + (1 - nearness) * (0.4 + ri * 0.3));
        });
      });
    },
  };
}
