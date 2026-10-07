import * as THREE from "three";

/**
 * Enhanced cinematic PBR material enhancer for the Phoenix avian creature.
 * Provides realistic feather sheen, subtle subsurface thermal glow, and organic fresnel.
 */
export function enhancePhoenixMaterial(originalMaterial, isPlumage = false) {
    const mat = originalMaterial.clone();

    mat.roughness = isPlumage ? 0.68 : 0.75;
    mat.metalness = 0.08;
    mat.envMapIntensity = 1.2;
    mat.shadowSide = THREE.DoubleSide;
    mat.side = THREE.DoubleSide;

    // Emissive base for subtle feather heat
    mat.emissive = new THREE.Color(0x000000);
    mat.emissiveIntensity = 0.0;

    // Custom shader modifications for feather rim sheen & internal thermal pulse
    mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0.0 };
        shader.uniforms.uThermalIntensity = { value: 0.0 };
        shader.uniforms.uThermalColor = { value: new THREE.Color(0xff4400) };
        shader.uniforms.uRimPower = { value: 3.5 };

        mat.userData.shader = shader;

        shader.vertexShader = `
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            ${shader.vertexShader}
        `.replace(
            `#include <worldpos_vertex>`,
            `
            #include <worldpos_vertex>
            vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            `
        );

        shader.fragmentShader = `
            uniform float uTime;
            uniform float uThermalIntensity;
            uniform vec3 uThermalColor;
            uniform float uRimPower;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            ${shader.fragmentShader}
        `.replace(
            `#include <dithering_fragment>`,
            `
            #include <dithering_fragment>

            if (uThermalIntensity > 0.001) {
                vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                float fresnel = pow(1.0 - max(dot(viewDir, normalize(vWorldNormal)), 0.0), uRimPower);
                
                // Subtle thermal breathing wave across feathers
                float wave = sin(vWorldPosition.y * 2.0 - uTime * 2.5 + vWorldPosition.x * 1.5) * 0.5 + 0.5;
                vec3 thermalGlow = uThermalColor * (fresnel * 0.8 + wave * 0.2) * uThermalIntensity;

                gl_FragColor.rgb += thermalGlow;
            }
            `
        );
    };

    return mat;
}
