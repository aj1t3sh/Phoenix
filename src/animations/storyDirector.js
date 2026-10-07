import * as THREE from "three";
import { camera } from "../core/camera";
import { updatePhoenixAnimation } from "../objects/Phoenix/animation";
import { phoenix } from "../objects/Phoenix";
import { featherObject } from "../objects/Feather";
import { particleManager } from "../world/particles";
import { updateSky } from "../world/sky";
import { updateLights } from "../core/lights";
import { updateFog } from "../world/fog";
import { updateGround } from "../world/ground";
import { ancientCavern } from "../world/cavern";
import { etherealSky } from "../world/etherealSky";
import { updatePostProcessing } from "../postprocessing/composer";
import { soundEngine } from "../utils/audio";

class StoryDirector {
    constructor() {
        this.scrollProgress = 0;
        this.targetScrollProgress = 0;

        // Cinematic Spline Keyframes across the 11-scene Circular Journey
        this.cameraKeyframes = [
            // Scene 1: The Deep Earth (0.00 - 0.08) - Low camera near magma ground
            { p: 0.00, pos: new THREE.Vector3(0, 0.4, 4.5), look: new THREE.Vector3(0, 0.2, 0), fov: 52 },
            { p: 0.08, pos: new THREE.Vector3(0, 0.5, 3.8), look: new THREE.Vector3(0, 0.4, 0), fov: 50 },

            // Scene 2: The Feather (0.08 - 0.18) - Tracking the rising feather
            { p: 0.13, pos: new THREE.Vector3(0.6, 0.9, 2.5), look: new THREE.Vector3(0, 0.6, 0), fov: 46 },
            { p: 0.18, pos: new THREE.Vector3(-0.5, 1.1, 2.0), look: new THREE.Vector3(0, 0.8, 0), fov: 44 },

            // Scene 3: The Light (0.18 - 0.28) - Orbiting the glowing feather
            { p: 0.23, pos: new THREE.Vector3(1.2, 1.2, 1.4), look: new THREE.Vector3(0, 0.8, 0), fov: 42 },
            { p: 0.28, pos: new THREE.Vector3(0.0, 1.3, 1.8), look: new THREE.Vector3(0, 0.9, -1.0), fov: 45 },

            // Scene 4: Transformation (0.28 - 0.42) - Widening to capture forming wings
            { p: 0.35, pos: new THREE.Vector3(0.0, 1.4, 2.4), look: new THREE.Vector3(0, 1.0, -2.5), fov: 52 },
            { p: 0.42, pos: new THREE.Vector3(0.0, 1.5, 0.8), look: new THREE.Vector3(0, 1.2, -2.5), fov: 48 },

            // Scene 5: Full Phoenix Reveal (0.42 - 0.58) [EXTENDED SHOWCASE]
            // Shot 1: Eye close-up
            { p: 0.45, pos: new THREE.Vector3(0.0, 1.85, -1.3), look: new THREE.Vector3(0, 1.75, -2.5), fov: 32 },
            // Shot 2: Head & upper body
            { p: 0.49, pos: new THREE.Vector3(0.8, 1.7, -0.6), look: new THREE.Vector3(0, 1.5, -2.5), fov: 40 },
            // Shot 3: Standing full body
            { p: 0.53, pos: new THREE.Vector3(-0.6, 1.5, 1.2), look: new THREE.Vector3(0, 1.2, -2.5), fov: 50 },
            // Shot 4: Full wingspan display (Dominating the view!)
            { p: 0.58, pos: new THREE.Vector3(0.0, 1.6, 2.8), look: new THREE.Vector3(0, 1.2, -2.5), fov: 56 },

            // Scene 6: The Moment Before Flight (0.58 - 0.68) - Tension & full scale
            { p: 0.63, pos: new THREE.Vector3(-1.2, 1.8, 3.2), look: new THREE.Vector3(0, 1.3, -2.0), fov: 58 },
            { p: 0.68, pos: new THREE.Vector3(0.0, 2.0, 3.5), look: new THREE.Vector3(0, 1.4, -2.0), fov: 60 },

            // Scene 7: Ascent (0.68 - 0.78) - Dynamic tracking takeoff
            { p: 0.73, pos: new THREE.Vector3(0.0, 4.0, 2.5), look: new THREE.Vector3(0, 4.5, -5.0), fov: 64 },
            { p: 0.78, pos: new THREE.Vector3(1.5, 7.5, -2.0), look: new THREE.Vector3(0, 8.5, -12.0), fov: 68 },

            // Scene 8: Breaking Through (0.78 - 0.84) - Storm cloud penetration
            { p: 0.81, pos: new THREE.Vector3(0.0, 10.0, -4.0), look: new THREE.Vector3(0, 11.0, -14.0), fov: 66 },
            { p: 0.84, pos: new THREE.Vector3(0.0, 11.5, -6.0), look: new THREE.Vector3(0, 12.0, -16.0), fov: 62 },

            // Scene 9: The Clear World (0.84 - 0.92) - Serene Eastern fantasy sky
            { p: 0.88, pos: new THREE.Vector3(-2.5, 12.5, -8.0), look: new THREE.Vector3(0, 12.5, -18.0), fov: 58 },
            { p: 0.92, pos: new THREE.Vector3(0.0, 13.0, -4.0), look: new THREE.Vector3(0, 12.5, -22.0), fov: 56 },

            // Scene 10: The Vanishing (0.92 - 0.96) - Phoenix fades into the horizon
            { p: 0.96, pos: new THREE.Vector3(0.0, 12.5, 0.0), look: new THREE.Vector3(0, 13.0, -28.0), fov: 52 },

            // Scene 11 & Loop: Descent Back to Earth (0.96 - 1.00) - Descending through clouds & smoke
            { p: 0.98, pos: new THREE.Vector3(0.0, 5.5, 2.5), look: new THREE.Vector3(0, 2.0, 0), fov: 50 },
            { p: 1.00, pos: new THREE.Vector3(0.0, 0.4, 4.5), look: new THREE.Vector3(0, 0.2, 0), fov: 52 }
        ];

        // Scene Definitions for UI HUD & Narrative
        this.scenes = [
            { id: "scene1", num: "01", name: "THE DEEP EARTH", range: [0.00, 0.08] },
            { id: "scene2", num: "02", name: "THE FEATHER", range: [0.08, 0.18] },
            { id: "scene3", num: "03", name: "THE LIGHT", range: [0.18, 0.28] },
            { id: "scene4", num: "04", name: "TRANSFORMATION", range: [0.28, 0.42] },
            { id: "scene5", num: "05", name: "THE PHOENIX", range: [0.42, 0.58] },
            { id: "scene6", num: "06", name: "ANTICIPATION", range: [0.58, 0.68] },
            { id: "scene7", num: "07", name: "ASCENT", range: [0.68, 0.78] },
            { id: "scene8", num: "08", name: "BREAKTHROUGH", range: [0.78, 0.84] },
            { id: "scene9", num: "09", name: "THE SERENE SKY", range: [0.84, 0.92] },
            { id: "scene10", num: "10", name: "THE VANISHING", range: [0.92, 0.96] },
            { id: "scene11", num: "11", name: "THE ETERNAL LOOP", range: [0.96, 1.00] }
        ];

        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.currentCamPos = new THREE.Vector3(0, 0.4, 4.5);
        this.currentLookAt = new THREE.Vector3(0, 0.2, 0);

        this.initMouse();
    }

    initMouse() {
        window.addEventListener("mousemove", (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.mouse.targetX = x;
            this.mouse.targetY = y;
            particleManager.setCursor(x, y);
        });
    }

    setScrollProgress(progress) {
        // Supports circular wrap around
        this.targetScrollProgress = progress;
    }

    interpolateCamera(p) {
        // Normalize p to 0.0 - 1.0
        const normP = ((p % 1.0) + 1.0) % 1.0;
        const kfs = this.cameraKeyframes;
        let prev = kfs[0];
        let next = kfs[kfs.length - 1];

        for (let i = 0; i < kfs.length - 1; i++) {
            if (normP >= kfs[i].p && normP <= kfs[i + 1].p) {
                prev = kfs[i];
                next = kfs[i + 1];
                break;
            }
        }

        const range = next.p - prev.p;
        const t = range === 0 ? 0 : (normP - prev.p) / range;
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);

        const targetPos = new THREE.Vector3().lerpVectors(prev.pos, next.pos, smoothT);
        const targetLook = new THREE.Vector3().lerpVectors(prev.look, next.look, smoothT);
        const targetFov = THREE.MathUtils.lerp(prev.fov, next.fov, smoothT);

        // Subtle mouse parallax
        targetPos.x += this.mouse.x * 0.25;
        targetPos.y += this.mouse.y * 0.15;

        this.currentCamPos.lerp(targetPos, 0.1);
        this.currentLookAt.lerp(targetLook, 0.1);

        camera.position.copy(this.currentCamPos);
        camera.lookAt(this.currentLookAt);

        if (Math.abs(camera.fov - targetFov) > 0.05) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1);
            camera.updateProjectionMatrix();
        }
    }

    updateUI(p) {
        const normP = ((p % 1.0) + 1.0) % 1.0;
        let activeScene = this.scenes[0];
        for (let i = 0; i < this.scenes.length; i++) {
            const sc = this.scenes[i];
            if (normP >= sc.range[0] && normP <= sc.range[1]) {
                activeScene = sc;
                break;
            }
        }

        const numEl = document.getElementById("hud-chapter-num");
        const nameEl = document.getElementById("hud-chapter-name");
        const pctEl = document.getElementById("hud-progress-pct");
        const fillEl = document.getElementById("hud-progress-fill");

        if (numEl && nameEl) {
            numEl.textContent = `${activeScene.num} / 11`;
            nameEl.textContent = activeScene.name;
        }

        if (pctEl && fillEl) {
            const pct = Math.round(normP * 100);
            pctEl.textContent = `${pct}%`;
            fillEl.style.width = `${pct}%`;
        }

        const blocks = document.querySelectorAll(".story-block");
        blocks.forEach((block) => {
            const start = parseFloat(block.dataset.start);
            const end = parseFloat(block.dataset.end);
            if (normP >= start && normP <= end) {
                block.classList.add("active");
            } else {
                block.classList.remove("active");
            }
        });
    }

    update(delta) {
        const time = performance.now() * 0.001;

        // Smooth scroll progress lerping
        this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
        const normP = ((this.scrollProgress % 1.0) + 1.0) % 1.0;

        // Lerp mouse
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

        // 1. Camera Spline Update
        this.interpolateCamera(normP);

        // 2. Feather Object & Phoenix Kinematics
        featherObject.update(normP, delta, time);
        updatePhoenixAnimation(normP, delta, time);

        // 3. World & Atmosphere Updates
        particleManager.update(normP, delta, time);
        updateSky(time, normP);
        updateLights(normP, time);
        updateFog(normP);
        updateGround(normP, time);
        ancientCavern.update(normP, time);
        etherealSky.update(normP, delta, time);

        // 4. Post-processing & Sound
        updatePostProcessing(normP, time);
        soundEngine.updateSceneAudio(normP);

        // 5. UI Updates
        this.updateUI(normP);
    }
}

export const storyDirector = new StoryDirector();
