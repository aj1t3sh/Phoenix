import * as THREE from "three";
import { scene } from "../core/scene";

const mountains = new THREE.Group();
mountains.name = "MountainRanges";

const mountainMaterials = [];

function createPeak({ width, height, depth, position, color, seed }) {
    const segmentsX = 48;
    const segmentsZ = 36;

    const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getY(i);

        const nx = x / (width * 0.5);
        const nz = z / (depth * 0.5);
        const distance = Math.sqrt(nx * nx + nz * nz);
        const baseShape = Math.max(0, 1 - distance);

        // Multi-octave jagged mountain noise
        const ridge1 = Math.abs(Math.sin(x * 0.35 + seed) * Math.cos(z * 0.28)) * 0.45;
        const ridge2 = Math.sin(x * 0.8 + seed * 2.1) * Math.cos(z * 0.5) * 0.18;
        const crags = Math.sin((x + z) * 1.8 + seed) * 0.08;

        let y = baseShape * (height * 0.85 + ridge1 * height + ridge2 * height + crags * height);
        const edgeFade = Math.max(0, distance - 0.7);
        y *= Math.max(0, 1 - edgeFade * 3.3);

        positions.setZ(i, Math.max(0, y));
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.94,
        metalness: 0.06,
        flatShading: false
    });
    mountainMaterials.push(mat);

    const mountain = new THREE.Mesh(geometry, mat);
    mountain.rotation.x = -Math.PI / 2;
    mountain.position.set(position.x, position.y, position.z);
    mountain.castShadow = true;
    mountain.receiveShadow = true;

    mountains.add(mountain);
}

// Background colossal peaks
createPeak({ width: 45, height: 22, depth: 15, position: { x: -18, y: -1, z: -35 }, color: 0x0e1014, seed: 1.4 });
createPeak({ width: 50, height: 26, depth: 16, position: { x: 5, y: -1, z: -40 }, color: 0x0a0c10, seed: 4.8 });
createPeak({ width: 42, height: 20, depth: 14, position: { x: 22, y: -1, z: -32 }, color: 0x0d0f12, seed: 7.2 });

// Midground valley canyon ridges
createPeak({ width: 28, height: 14, depth: 10, position: { x: -16, y: -1, z: -18 }, color: 0x181a1e, seed: 2.9 });
createPeak({ width: 28, height: 15, depth: 10, position: { x: 16, y: -1, z: -20 }, color: 0x16181c, seed: 5.6 });
createPeak({ width: 20, height: 10, depth: 8, position: { x: -12, y: -1, z: 2 }, color: 0x1e2024, seed: 3.1 });
createPeak({ width: 20, height: 11, depth: 8, position: { x: 12, y: -1, z: 4 }, color: 0x1c1e22, seed: 6.7 });

scene.add(mountains);

export function updateMountains(progress, time) {
    const sp = progress;
    if (sp > 0.75) {
        // Dawn sunlight catching the mountain rims
        const t = (sp - 0.75) / 0.25;
        mountainMaterials.forEach((mat, idx) => {
            const base = idx < 3 ? 0x0e1014 : 0x181a1e;
            mat.color.lerpColors(new THREE.Color(base), new THREE.Color(0x3a241c), t * 0.7);
        });
    }
}

export { mountains };