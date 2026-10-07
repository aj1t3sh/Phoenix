import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { scene } from "../core/scene";
import { camera } from "../core/camera";
import { renderer } from "../core/renderer";
import { sizes } from "../core/sizes";

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Calibrated filmic bloom pass
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.4,  // subtle strength
    0.35, // radius
    0.82  // threshold: only genuine hot embers & sun bloom
);
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

export function updatePostProcessing(progress, time) {
    const sp = progress;

    if (sp < 0.35) {
        // Cold valley: subtle frost glints
        bloomPass.strength = 0.35;
        bloomPass.threshold = 0.85;
    } else if (sp < 0.65) {
        // Cavern & Awakening: intimate warm feather rim glow
        const t = (sp - 0.35) / 0.30;
        bloomPass.strength = THREE.MathUtils.lerp(0.35, 0.65, t);
        bloomPass.threshold = 0.78;
    } else if (sp < 0.85) {
        // Memory of Fire & Choice: glowing runes and radiant feathers
        const t = (sp - 0.65) / 0.20;
        bloomPass.strength = THREE.MathUtils.lerp(0.65, 0.95, t);
        bloomPass.threshold = 0.72;
    } else {
        // Flight & Sunrise: atmospheric golden dawn glow
        const t = (sp - 0.85) / 0.15;
        bloomPass.strength = THREE.MathUtils.lerp(0.95, 1.25, t);
        bloomPass.threshold = 0.65;
    }
}

export { composer, bloomPass };