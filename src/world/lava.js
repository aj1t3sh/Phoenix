import * as THREE from "three";

import { scene } from "../core/scene";

const lava = new THREE.Group();

const lavaMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8a00,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
});

function createLavaCrack(points, width = 0.035) {
    const geometry = new THREE.BufferGeometry();

    const vertices = [];

    for (let i = 0; i < points.length - 1; i++) {
        const start = new THREE.Vector3(...points[i]);
        const end = new THREE.Vector3(...points[i + 1]);

        const direction = new THREE.Vector3()
            .subVectors(end, start)
            .normalize();

        const perpendicular = new THREE.Vector3(
            -direction.z,
            0,
            direction.x
        );

        const offset = perpendicular.multiplyScalar(width);

        vertices.push(
            start.x - offset.x,
            start.y,
            start.z - offset.z,

            start.x + offset.x,
            start.y,
            start.z + offset.z,

            end.x - offset.x,
            end.y,
            end.z - offset.z,

            end.x + offset.x,
            end.y,
            end.z + offset.z
        );
    }

    const indices = [];

    for (let i = 0; i < points.length - 1; i++) {
        const index = i * 4;

        indices.push(
            index,
            index + 1,
            index + 2,

            index + 1,
            index + 3,
            index + 2
        );
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const crack = new THREE.Mesh(
        geometry,
        lavaMaterial
    );

    lava.add(crack);
}


/*
 * Main irregular cracks
 */

createLavaCrack([
    [-6, -0.84, 2.0],
    [-5.2, -0.84, 1.5],
    [-4.4, -0.84, 1.8],
    [-3.7, -0.84, 0.8],
    [-2.8, -0.84, 0.2]
], 0.045);


createLavaCrack([
    [-1.5, -0.83, 1.5],
    [-0.7, -0.83, 1.0],
    [0.2, -0.83, 1.3],
    [1.0, -0.83, 0.4],
    [2.2, -0.83, 0.0]
], 0.035);


createLavaCrack([
    [2.5, -0.82, 1.2],
    [3.2, -0.82, 0.5],
    [4.1, -0.82, 0.7],
    [5.0, -0.82, -0.3],
    [6.3, -0.82, -0.8]
], 0.04);


createLavaCrack([
    [-7.5, -0.81, -1.5],
    [-6.8, -0.81, -2.0],
    [-6.1, -0.81, -2.8],
    [-5.0, -0.81, -3.2]
], 0.03);


/*
 * Smaller branches
 */

createLavaCrack([
    [-4.4, -0.835, 1.8],
    [-4.7, -0.835, 2.6],
    [-5.3, -0.835, 3.1]
], 0.025);


createLavaCrack([
    [3.2, -0.825, 0.5],
    [3.7, -0.825, 1.3],
    [4.4, -0.825, 1.7]
], 0.025);


/*
 * Lava light sources
 */

function createLavaLight(
    x,
    y,
    z,
    intensity,
    distance
) {
    const light = new THREE.PointLight(
        0xff4500,
        intensity,
        distance
    );

    light.position.set(x, y, z);

    lava.add(light);
}

createLavaLight(-4, 0, 1, 2.5, 7);
createLavaLight(1, 0, 1, 2.0, 6);
createLavaLight(4, 0, 0, 1.8, 6);
createLavaLight(-6, 0, -2, 1.3, 5);

scene.add(lava);

export { lava };