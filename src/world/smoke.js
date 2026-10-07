import * as THREE from "three";

import { scene } from "../core/scene";

const smoke = new THREE.Group();

const smokeMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a0d0a,
    transparent: true,
    opacity: 0.12,
    depthWrite: false
});

function createSmokeCloud(x, y, z, scale) {

    const geometry = new THREE.SphereGeometry(
        1,
        16,
        16
    );

    const cloud = new THREE.Mesh(
        geometry,
        smokeMaterial
    );

    cloud.position.set(x, y, z);

    cloud.scale.set(
        scale * 1.5,
        scale,
        scale * 1.5
    );

    smoke.add(cloud);
}


/*
 * Distant volcanic smoke
 */

createSmokeCloud(-5, 3.5, -5, 1.8);
createSmokeCloud(-3.5, 4.2, -6, 1.4);
createSmokeCloud(0, 4.8, -7, 2.0);
createSmokeCloud(2.5, 4.0, -6, 1.5);
createSmokeCloud(5, 3.5, -5, 1.8);


/*
 * Smaller clouds
 */

createSmokeCloud(-4, 2.5, -3, 0.9);
createSmokeCloud(1, 3.0, -4, 1.1);
createSmokeCloud(4, 2.8, -3, 1.0);

scene.add(smoke);

export { smoke };