import * as THREE from "three";
import { scene } from "../core/scene";

const geometry = new THREE.PlaneGeometry(80, 80, 120, 120);

const pos = geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const dist = Math.sqrt(x * x + y * y);

    // Deep mountain valley pass with natural rolling frozen terrain
    const valleyRidge = Math.pow(Math.abs(x) * 0.15, 1.8) * 1.2;
    const wave1 = Math.sin(x * 0.25) * Math.cos(y * 0.2) * 0.8;
    const wave2 = Math.sin(x * 0.6 + y * 0.4) * 0.3;
    const micro = Math.sin(x * 1.8) * Math.cos(y * 1.8) * 0.08;

    pos.setZ(i, valleyRidge + wave1 + wave2 + micro);
}

pos.needsUpdate = true;
geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({
    color: 0x141618,
    roughness: 0.88,
    metalness: 0.12,
    flatShading: false
});

const ground = new THREE.Mesh(geometry, material);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;

scene.add(ground);

export function updateGround(progress, time) {
    const sp = progress;
    if (sp < 0.7) {
        // Cold frozen valley
        material.color.setHex(0x121418);
        material.roughness = 0.9;
    } else {
        // Dawn thaw & warm reflection
        const t = (sp - 0.7) / 0.3;
        material.color.lerpColors(new THREE.Color(0x121418), new THREE.Color(0x281c16), t);
        material.roughness = THREE.MathUtils.lerp(0.9, 0.6, t);
    }
}

export { ground };