import * as THREE from "three";

export const clock = new THREE.Clock();

export let elapsedTime = 0;
export let deltaTime = 0;

export function updateClock() {
    deltaTime = clock.getDelta();
    elapsedTime = clock.elapsedTime;

    return {
        elapsedTime,
        deltaTime
    };
}
