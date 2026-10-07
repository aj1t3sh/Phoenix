import * as THREE from "three";
import { phoenix } from "./index";

let flightTime = 0;

export function updatePhoenixAnimation(progress, delta, time) {
    if (!phoenix || !phoenix.isLoaded) return;

    if (phoenix.mixer) {
        phoenix.mixer.update(delta);
    }

    phoenix.materialsList.forEach((mat) => {
        if (mat.userData && mat.userData.shader) {
            mat.userData.shader.uniforms.uTime.value = time;
        }
    });

    const sp = progress;
    const breath = Math.sin(time * 2.2) * 0.035;

    // SCENES 1 - 3: LAVA, FEATHER & LIGHT (0.00 - 0.28)
    if (sp < 0.28) {
        phoenix.group.visible = false;
        phoenix.setThermalIntensity(0.0);
        phoenix.setPhoenixOpacity(0.0);

    // SCENE 4: TRANSFORMATION (0.28 - 0.42)
    } else if (sp >= 0.28 && sp < 0.42) {
        phoenix.group.visible = true;
        const t = (sp - 0.28) / 0.14;
        const easeT = THREE.MathUtils.smoothstep(t, 0, 1);

        phoenix.group.position.set(0, 1.0 + breath * 0.5, -2.5);
        phoenix.group.rotation.set(0, Math.PI, 0);
        phoenix.group.scale.setScalar(0.0082);

        // Gradually solidifies into view through light
        phoenix.setPhoenixOpacity(easeT);
        phoenix.setThermalIntensity(0.4 + easeT * 0.4, 0xff7722);

        if (phoenix.action) {
            phoenix.action.timeScale = 0.25;
        }

        // Head resting slightly down as it forms
        if (phoenix.bones["b_Head_06"]) {
            phoenix.bones["b_Head_06"].rotation.x = THREE.MathUtils.lerp(0.3, 0.05, easeT);
        }

    // SCENE 5: THE FULL PHOENIX REVEAL (0.42 - 0.58) [EXTENDED SHOWCASE]
    } else if (sp >= 0.42 && sp < 0.58) {
        phoenix.group.visible = true;
        phoenix.setPhoenixOpacity(1.0);
        const t = (sp - 0.42) / 0.16;

        phoenix.group.position.set(0, 1.1 + breath, -2.5);
        phoenix.group.rotation.set(0, Math.PI, 0);
        phoenix.group.scale.setScalar(0.0082);

        const thermal = 0.55 + Math.sin(time * 2.5) * 0.1;
        phoenix.setThermalIntensity(thermal, 0xff6611);

        if (phoenix.action) {
            phoenix.action.timeScale = 0.35; // majestic slow cadence
        }

        // Kinetic progression across the 4 reveal shots:
        // Shot 1 & 2: Head rises, eyes focus forward
        if (phoenix.bones["b_Head_06"]) {
            const headAngle = t < 0.3 ? 0.05 : -0.1 + Math.sin(time * 1.2) * 0.05;
            phoenix.bones["b_Head_06"].rotation.x = headAngle;
            phoenix.bones["b_Head_06"].rotation.y = Math.sin(time * 0.8) * 0.06;
        }

        // Shot 3 & 4: Wings slowly unfurl to show full magnificent wingspan
        if (phoenix.bones["B_Left_Wing_0_070"]) {
            const fold = THREE.MathUtils.lerp(-0.7, 0.0, Math.min(1.0, t * 1.4));
            phoenix.bones["B_Left_Wing_0_070"].rotation.z = fold;
        }
        if (phoenix.bones["B_Right_Wing_0_079"]) {
            const fold = THREE.MathUtils.lerp(0.7, 0.0, Math.min(1.0, t * 1.4));
            phoenix.bones["B_Right_Wing_0_079"].rotation.z = fold;
        }

    // SCENE 6: THE MOMENT BEFORE FLIGHT (0.58 - 0.68)
    } else if (sp >= 0.58 && sp < 0.68) {
        phoenix.group.visible = true;
        phoenix.setPhoenixOpacity(1.0);
        const t = (sp - 0.58) / 0.10;

        // Crouching for takeoff
        const crouchY = 1.1 - t * 0.2 + breath * 1.5;
        phoenix.group.position.set(0, crouchY, -2.5 + t * 0.5);
        phoenix.group.rotation.set(t * 0.15, Math.PI, 0);

        phoenix.setThermalIntensity(0.7 + t * 0.3, 0xff7711);

        if (phoenix.action) {
            phoenix.action.timeScale = 0.65;
        }

        if (phoenix.bones["B_Left_Wing_0_070"]) {
            phoenix.bones["B_Left_Wing_0_070"].rotation.z = -0.15 + Math.sin(time * 4.0) * 0.1;
        }
        if (phoenix.bones["B_Right_Wing_0_079"]) {
            phoenix.bones["B_Right_Wing_0_079"].rotation.z = 0.15 - Math.sin(time * 4.0) * 0.1;
        }

    // SCENE 7: ASCENT (0.68 - 0.78)
    } else if (sp >= 0.68 && sp < 0.78) {
        phoenix.group.visible = true;
        phoenix.setPhoenixOpacity(1.0);
        const t = (sp - 0.68) / 0.10;

        if (phoenix.action) {
            phoenix.action.timeScale = 1.25; // full flight flapping
        }

        flightTime += delta * 2.2;
        const flapY = Math.sin(flightTime * 2.0) * 0.4;
        const flightX = Math.sin(flightTime * 0.8) * 1.5;
        const flightY = 2.0 + t * 6.0 + flapY;
        const flightZ = -2.0 - t * 8.0;

        phoenix.group.position.set(flightX, flightY, flightZ);
        phoenix.group.rotation.set(0.3, Math.PI + Math.cos(flightTime * 0.8) * 0.25, -Math.sin(flightTime * 0.8) * 0.2);

        phoenix.setThermalIntensity(1.0, 0xff8811);

    // SCENE 8: BREAKING THROUGH CLOUDS (0.78 - 0.84)
    } else if (sp >= 0.78 && sp < 0.84) {
        phoenix.group.visible = true;
        phoenix.setPhoenixOpacity(1.0);
        const t = (sp - 0.78) / 0.06;

        flightTime += delta * 1.8;
        const flightY = 8.0 + t * 4.0;
        const flightZ = -10.0 - t * 6.0;

        phoenix.group.position.set(Math.sin(flightTime * 0.7) * 2.0, flightY, flightZ);
        phoenix.group.rotation.set(0.2, Math.PI, -Math.sin(flightTime * 0.7) * 0.15);

        if (phoenix.action) {
            phoenix.action.timeScale = 1.0;
        }

        // Shift fire from volcanic orange to golden ethereal
        phoenix.setThermalIntensity(0.7, 0xffaa33);

    // SCENE 9: THE CLEAR WORLD (0.84 - 0.92)
    } else if (sp >= 0.84 && sp < 0.92) {
        phoenix.group.visible = true;
        phoenix.setPhoenixOpacity(1.0);
        const t = (sp - 0.84) / 0.08;

        flightTime += delta * 1.2;
        const bankRadius = 6.0;
        const cx = Math.sin(flightTime * 0.6) * bankRadius;
        const cy = 12.0 + Math.sin(flightTime * 0.5) * 1.0;
        const cz = -16.0 - t * 8.0 + Math.cos(flightTime * 0.6) * 2.0;

        phoenix.group.position.set(cx, cy, cz);
        phoenix.group.rotation.set(0.05, Math.PI + Math.cos(flightTime * 0.6) * 0.35, -Math.sin(flightTime * 0.6) * 0.3);

        if (phoenix.action) {
            phoenix.action.timeScale = 0.75; // serene gliding
        }

        // Soft, elegant golden feather rim glow
        phoenix.setThermalIntensity(0.35, 0xffcc44);

    // SCENE 10: THE VANISHING (0.92 - 0.96)
    } else if (sp >= 0.92 && sp < 0.96) {
        phoenix.group.visible = true;
        const t = (sp - 0.92) / 0.04;

        flightTime += delta * 0.8;
        const distZ = -24.0 - t * 20.0;
        const distY = 12.0 + t * 4.0;
        const distX = Math.sin(flightTime * 0.5) * (4.0 - t * 3.0);

        phoenix.group.position.set(distX, distY, distZ);
        phoenix.group.scale.setScalar(0.0082 * (1.0 - t * 0.4));

        // Vanishes into sunlight and light
        phoenix.setPhoenixOpacity(Math.max(0, 1.0 - t * 1.2));
        phoenix.setThermalIntensity(0.25 * (1.0 - t), 0xffdd66);

    // SCENE 11 & LOOP: RESETTING FOR DEEP EARTH (0.96 - 1.00)
    } else {
        phoenix.group.visible = false;
        phoenix.setPhoenixOpacity(0.0);
        phoenix.setThermalIntensity(0.0);
        phoenix.group.scale.setScalar(0.0082);
        phoenix.group.position.set(0, 1.2, -2.5);
    }
}