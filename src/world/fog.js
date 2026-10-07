import * as THREE from "three";
import { scene } from "../core/scene";

export const fog = new THREE.FogExp2(0x0a0d14, 0.042);
scene.fog = fog;

export function updateFog(progress) {
    const sp = progress;

    if (sp < 0.35) {
        // Cold frozen valley: slate blue atmospheric mist
        fog.color.setHex(0x0a0e16);
        fog.density = 0.045;
    } else if (sp < 0.65) {
        // Ancient cavern: deep dark shadows
        const t = (sp - 0.35) / 0.30;
        fog.color.lerpColors(new THREE.Color(0x0a0e16), new THREE.Color(0x140a06), t);
        fog.density = THREE.MathUtils.lerp(0.045, 0.035, t);
    } else if (sp < 0.85) {
        // Awakening & Choice: warm ember atmosphere
        const t = (sp - 0.65) / 0.20;
        fog.color.lerpColors(new THREE.Color(0x140a06), new THREE.Color(0x2d1408), t);
        fog.density = THREE.MathUtils.lerp(0.035, 0.022, t);
    } else {
        // First Flight & Sunrise: golden morning mist
        const t = (sp - 0.85) / 0.15;
        fog.color.lerpColors(new THREE.Color(0x2d1408), new THREE.Color(0x3a2214), t);
        fog.density = THREE.MathUtils.lerp(0.022, 0.012, t);
    }
}