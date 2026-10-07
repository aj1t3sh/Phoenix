import "./style.css";

import { scene } from "./core/scene";
import { camera } from "./core/camera";
import { renderer } from "./core/renderer";
import { onResize } from "./core/sizes";
import { composer } from "./postprocessing/composer";

import "./core/lights";
import "./world/index";
import "./objects/Feather";
import "./objects/Phoenix";
import { particleManager } from "./world/particles";
import { storyDirector } from "./animations/storyDirector";
import { soundEngine } from "./utils/audio";

// ==========================================================================
// 1. CONTINUOUS CIRCULAR SCROLL CONTROLLER
// ==========================================================================
let targetProgress = 0;

export function setStoryProgress(val) {
    targetProgress = val;
    storyDirector.setScrollProgress(targetProgress);
}

// 1A. Wheel / Trackpad listener with smooth infinite progression
window.addEventListener("wheel", (e) => {
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 32;
    if (e.deltaMode === 2) delta *= 400;

    const step = delta * 0.00035;
    targetProgress += step;
    storyDirector.setScrollProgress(targetProgress);
}, { passive: true });

// 1B. Touch swipe gestures for mobile & tablets
let touchStartY = 0;
window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
    }
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
        const touchCurrentY = e.touches[0].clientY;
        const delta = touchStartY - touchCurrentY;
        touchStartY = touchCurrentY;

        targetProgress += delta * 0.0014;
        storyDirector.setScrollProgress(targetProgress);
    }
}, { passive: true });

// 1C. Keyboard Navigation
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        targetProgress += (e.key === " " ? 0.06 : 0.03);
        storyDirector.setScrollProgress(targetProgress);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        targetProgress -= 0.03;
        storyDirector.setScrollProgress(targetProgress);
    }
});

// ==========================================================================
// 2. CUSTOM INTERACTIVE CURSOR
// ==========================================================================
const cursorDot = document.getElementById("cursor-dot");
const cursorGlow = document.getElementById("cursor-glow");
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }
});

document.querySelectorAll("button, .hud-btn, .hud-progress-container").forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
});

// ==========================================================================
// 3. SOUND CONTROL
// ==========================================================================
const soundToggleBtn = document.getElementById("sound-toggle");
const soundLabel = document.getElementById("sound-label");

if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
        const isAudioActive = soundEngine.toggleMute();
        if (isAudioActive) {
            soundToggleBtn.classList.add("sound-active");
            if (soundLabel) soundLabel.textContent = "SOUND ON";
        } else {
            soundToggleBtn.classList.remove("sound-active");
            if (soundLabel) soundLabel.textContent = "SOUND OFF";
        }
    });
}

// 4. Progress bar scrub
const progressBarContainer = document.querySelector(".hud-progress-container");
if (progressBarContainer) {
    progressBarContainer.addEventListener("click", (e) => {
        const bar = document.querySelector(".hud-progress-bar");
        if (bar) {
            const rect = bar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, clickX / rect.width));
            const currentCycles = Math.floor(targetProgress);
            targetProgress = currentCycles + pct;
            storyDirector.setScrollProgress(targetProgress);
        }
    });
}

// ==========================================================================
// 5. CINEMATIC LOADING EXPERIENCE
// ==========================================================================
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPct = document.getElementById("loader-pct");
const loaderStatus = document.getElementById("loader-status");

let loadProgress = 0;
const loadInterval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 15) + 8;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(loadInterval);

        if (loaderBar) loaderBar.style.width = "100%";
        if (loaderPct) loaderPct.textContent = "100%";
        if (loaderStatus) loaderStatus.textContent = "THE FLAME IS BORN";

        setTimeout(() => {
            if (loader) {
                loader.classList.add("loader-hidden");
                setTimeout(() => {
                    loader.style.display = "none";
                }, 1200);
            }
        }, 400);
    } else {
        if (loaderBar) loaderBar.style.width = `${loadProgress}%`;
        if (loaderPct) loaderPct.textContent = `${loadProgress}%`;
    }
}, 45);

// ==========================================================================
// 6. MAIN RENDER & ANIMATION LOOP
// ==========================================================================
let lastTime = performance.now();

function animate(time) {
    requestAnimationFrame(animate);

    const delta = Math.min((time - lastTime) * 0.001, 0.1);
    lastTime = time;

    // Smooth cursor glow lerp
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    if (cursorGlow) {
        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;
    }

    // Update Story Director
    storyDirector.update(delta);

    // Render 3D Post-processed Scene
    composer.render();
}

requestAnimationFrame(animate);

// ==========================================================================
// 7. RESPONSIVE RESIZE
// ==========================================================================
onResize((sizes) => {
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    composer.setSize(sizes.width, sizes.height);
});