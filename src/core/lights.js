import * as THREE from "three";
import { scene } from "./scene";

// 1. Ambient Fill Light
export const ambientLight = new THREE.AmbientLight(0x1a0a04, 0.8);
scene.add(ambientLight);

// 2. Main Key Light (Directional sun / cavern skylight)
export const directionalLight = new THREE.DirectionalLight(0xff6600, 1.2);
directionalLight.position.set(4, 12, 6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 60;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
directionalLight.shadow.bias = -0.0005;
scene.add(directionalLight);

// 3. Rim Light for feather edge separation
export const rimLight = new THREE.DirectionalLight(0xffaa33, 0.6);
rimLight.position.set(-4, 3, -6);
scene.add(rimLight);

export function updateLights(progress, time) {
    const sp = progress;

    if (sp < 0.28) {
        // Deep Earth & Lava: warm underlighting from magma
        ambientLight.color.setHex(0x180802);
        ambientLight.intensity = 0.6;

        directionalLight.color.setHex(0xff5500);
        directionalLight.intensity = 1.0;
        directionalLight.position.set(2, 8, 4);

        rimLight.color.setHex(0xff3300);
        rimLight.intensity = 0.5;

    } else if (sp < 0.68) {
        // Transformation & Full Phoenix Reveal: rich cinematic 3-point lighting
        const t = (sp - 0.28) / 0.40;
        ambientLight.color.lerpColors(new THREE.Color(0x180802), new THREE.Color(0x281208), t);
        ambientLight.intensity = THREE.MathUtils.lerp(0.6, 1.0, t);

        directionalLight.color.lerpColors(new THREE.Color(0xff5500), new THREE.Color(0xff9933), t);
        directionalLight.intensity = THREE.MathUtils.lerp(1.0, 2.2, t);
        directionalLight.position.set(4, 14, 6);

        rimLight.color.lerpColors(new THREE.Color(0xff3300), new THREE.Color(0xffbb44), t);
        rimLight.intensity = THREE.MathUtils.lerp(0.5, 1.4, t);

    } else if (sp < 0.84) {
        // Ascent & Breakthrough
        ambientLight.color.setHex(0x352015);
        ambientLight.intensity = 1.2;

        directionalLight.color.setHex(0xffbb55);
        directionalLight.intensity = 2.8;

        rimLight.intensity = 1.8;

    } else if (sp < 0.94) {
        // The Clear World - Ethereal Eastern Fantasy Sky (Golden sunlight & soft cyan ambient)
        ambientLight.color.setHex(0x88b0d0);
        ambientLight.intensity = 1.4;

        directionalLight.color.setHex(0xffe8aa);
        directionalLight.intensity = 3.2;
        directionalLight.position.set(0, 16, -20);

        rimLight.color.setHex(0xffd588);
        rimLight.intensity = 2.0;

    } else {
        // Endless loop descent: soft fade back to volcanic warm light
        const t = (sp - 0.94) / 0.06;
        ambientLight.color.lerpColors(new THREE.Color(0x88b0d0), new THREE.Color(0x180802), t);
        ambientLight.intensity = THREE.MathUtils.lerp(1.4, 0.6, t);

        directionalLight.color.lerpColors(new THREE.Color(0xffe8aa), new THREE.Color(0xff5500), t);
        directionalLight.intensity = THREE.MathUtils.lerp(3.2, 1.0, t);
        directionalLight.position.set(2, 8, 4);

        rimLight.color.lerpColors(new THREE.Color(0xffd588), new THREE.Color(0xff3300), t);
        rimLight.intensity = THREE.MathUtils.lerp(2.0, 0.5, t);
    }
}