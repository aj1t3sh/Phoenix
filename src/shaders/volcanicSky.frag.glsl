uniform float uTime;
uniform float uProgress;
varying vec3 vPosition;

void main() {
    vec3 normPos = normalize(vPosition);
    float height = normPos.y;
    float t = height * 0.5 + 0.5;

    // COLOR PALETTES FOR THE 11 SCENES
    // 1. Deep Earth & Lava (0.00 - 0.28)
    vec3 volcanicDark = vec3(0.004, 0.003, 0.005);
    vec3 magmaHorizon = vec3(0.08, 0.025, 0.008);

    // 2. Transformation & Phoenix Reveal (0.28 - 0.68)
    vec3 transformHorizon = vec3(0.35, 0.12, 0.02);
    vec3 transformZenith = vec3(0.04, 0.015, 0.006);

    // 3. Breakthrough Cloud Whiteout (0.78 - 0.84)
    vec3 breakthroughWhite = vec3(0.95, 0.94, 0.90);

    // 4. The Clear World - Ethereal Eastern Fantasy Sky (0.84 - 0.94)
    vec3 sereneZenith = vec3(0.32, 0.55, 0.78);   // pale azure cyan
    vec3 sereneHorizon = vec3(0.95, 0.82, 0.62);  // warm golden mist
    vec3 sereneRose = vec3(0.85, 0.65, 0.60);     // soft dawn blush

    // 5. Descent Back to Earth (0.94 - 1.00)
    vec3 smokyDescent = vec3(0.03, 0.025, 0.02);

    vec3 horizonColor;
    vec3 zenithColor;
    float sunGlow = 0.0;
    float whiteout = 0.0;

    if (uProgress < 0.28) {
        // Deep Earth & Lava
        float p = uProgress / 0.28;
        horizonColor = mix(magmaHorizon, vec3(0.12, 0.04, 0.01), p);
        zenithColor = volcanicDark;
    } else if (uProgress < 0.68) {
        // Transformation & Full Phoenix Reveal
        float p = (uProgress - 0.28) / 0.40;
        horizonColor = mix(vec3(0.12, 0.04, 0.01), transformHorizon, p);
        zenithColor = mix(volcanicDark, transformZenith, p);
    } else if (uProgress < 0.78) {
        // Ascent
        float p = (uProgress - 0.68) / 0.10;
        horizonColor = mix(transformHorizon, vec3(0.45, 0.22, 0.08), p);
        zenithColor = mix(transformZenith, vec3(0.08, 0.05, 0.04), p);
    } else if (uProgress < 0.84) {
        // Breaking Through (Cloud Whiteout)
        float p = (uProgress - 0.78) / 0.06;
        whiteout = sin(p * 3.14159) * 0.85;
        horizonColor = mix(vec3(0.45, 0.22, 0.08), sereneHorizon, p);
        zenithColor = mix(vec3(0.08, 0.05, 0.04), sereneZenith, p);
    } else if (uProgress < 0.94) {
        // The Clear World - Ethereal Eastern Fantasy Sky
        float p = (uProgress - 0.84) / 0.10;
        horizonColor = mix(sereneHorizon, sereneRose, Math.sin(p * 3.14159) * 0.4);
        zenithColor = sereneZenith;
        sunGlow = 1.0;
    } else {
        // The Endless Loop: Clouds darken, smoke forms, descending back to magma
        float p = (uProgress - 0.94) / 0.06;
        horizonColor = mix(sereneHorizon, magmaHorizon, p);
        zenithColor = mix(sereneZenith, volcanicDark, p);
        sunGlow = 1.0 - p;
    }

    vec3 baseSky = mix(horizonColor, zenithColor, smoothstep(0.05, 0.95, t));

    // Dynamic solar disk and atmospheric corona in the Serene Sky
    if (sunGlow > 0.01) {
        vec3 sunDir = normalize(vec3(0.0, 0.35, -1.0));
        float sunDot = max(dot(normPos, sunDir), 0.0);
        float sunDisc = pow(sunDot, 256.0) * 3.0;
        float sunCorona = pow(sunDot, 8.0) * 0.9;

        vec3 sunColor = vec3(1.0, 0.95, 0.75);
        baseSky += (sunDisc * sunColor + sunCorona * vec3(1.0, 0.75, 0.4)) * sunGlow;
    }

    // Flash whiteout during cloud breakthrough
    if (whiteout > 0.01) {
        baseSky = mix(baseSky, breakthroughWhite, whiteout);
    }

    // Atmospheric cloud shimmer
    float cloudNoise = sin(vPosition.x * 0.08 + uTime * 0.1) * cos(vPosition.z * 0.08 + uTime * 0.08);
    baseSky += vec3(0.02, 0.015, 0.01) * cloudNoise;

    gl_FragColor = vec4(baseSky, 1.0);
}