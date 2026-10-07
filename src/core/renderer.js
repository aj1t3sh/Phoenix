import * as THREE from "three";
import { sizes } from "./sizes";

const canvas = document.querySelector("#webgl");

if (!canvas) {
    throw new Error('Canvas with id="webgl" was not found.');
}

export const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;