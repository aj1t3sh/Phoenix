import * as THREE from "three";
import { sizes } from "./sizes";

export const camera = new THREE.PerspectiveCamera(
    60,
    sizes.width / sizes.height,
    0.1,
    100
);

camera.position.set(0, 3.5, 9);

camera.lookAt(0, 0, -4);
