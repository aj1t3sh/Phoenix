import * as THREE from "three";
import { scene } from "../core/scene";

import vertexShader from "../shaders/volcanicSky.vert.glsl?raw";
import fragmentShader from "../shaders/volcanicSky.frag.glsl?raw";

const skyGeometry = new THREE.SphereGeometry(60, 32, 32);

const skyUniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 }
};

const skyMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.renderOrder = -100;
scene.add(sky);

export function updateSky(time, progress) {
    skyUniforms.uTime.value = time;
    skyUniforms.uProgress.value = progress;
}

export { sky, skyUniforms };