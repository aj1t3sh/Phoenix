import * as THREE from "three";
import { scene } from "../../core/scene";

class FeatherObject {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = "FeatherGroup";

        this.featherMesh = null;
        this.quillMesh = null;
        this.glowLight = null;
        this.material = null;

        this.createFeather();
        this.createLighting();

        // Initial state: hidden in deep lava
        this.group.position.set(0, -1.2, 0);
        this.group.rotation.set(0.2, 0, 0.15);
        this.group.scale.setScalar(0.7);

        scene.add(this.group);
    }

    createFeather() {
        // 1. Central Quill Shaft
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -1.2, 0),
            new THREE.Vector3(0.04, -0.4, 0.05),
            new THREE.Vector3(0.02, 0.5, 0.08),
            new THREE.Vector3(-0.06, 1.3, 0.04),
            new THREE.Vector3(-0.15, 1.8, 0)
        ]);

        const quillGeo = new THREE.TubeGeometry(curve, 32, 0.025, 8, false);
        const quillMat = new THREE.MeshStandardMaterial({
            color: 0x3d1a08,
            roughness: 0.4,
            metalness: 0.2,
            emissive: new THREE.Color(0xff5500),
            emissiveIntensity: 0.3
        });
        this.quillMesh = new THREE.Mesh(quillGeo, quillMat);
        this.quillMesh.castShadow = true;
        this.group.add(this.quillMesh);

        // 2. Realistic Curved Feather Vane Geometry
        const vaneGeo = new THREE.PlaneGeometry(0.85, 2.6, 16, 32);
        const pos = vaneGeo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);

            // Shape vane silhouette (tapered top and bottom, wide middle)
            const ny = (y + 1.3) / 2.6; // 0 to 1
            const widthFactor = Math.sin(ny * Math.PI) * Math.pow(1 - ny * 0.3, 0.5);

            // Natural feather curvature / arch
            const arch = (1 - Math.abs(x) * 2.0) * 0.12;
            const bend = Math.sin(ny * Math.PI * 0.8) * 0.15;

            pos.setX(i, x * widthFactor);
            pos.setZ(i, arch + bend);
        }
        vaneGeo.computeVertexNormals();

        // Custom Feather Material with Molten Burning Edge Effect
        this.material = new THREE.MeshStandardMaterial({
            color: 0x8a2408,
            roughness: 0.65,
            metalness: 0.1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
            emissive: new THREE.Color(0xff4400),
            emissiveIntensity: 0.4
        });

        this.featherMesh = new THREE.Mesh(vaneGeo, this.material);
        this.featherMesh.position.set(0, 0.3, 0.05);
        this.featherMesh.castShadow = true;
        this.group.add(this.featherMesh);
    }

    createLighting() {
        this.glowLight = new THREE.PointLight(0xff6600, 0, 8, 2.0);
        this.glowLight.position.set(0, 0.5, 0);
        this.group.add(this.glowLight);
    }

    update(progress, delta, time) {
        const sp = progress;

        // SCENE 1 & 2: LAVA & FEATHER EMERGENCE (0.00 - 0.18)
        if (sp < 0.08) {
            // Dormant deep inside lava
            this.group.position.set(0, -1.2, 0);
            this.group.visible = false;
            this.glowLight.intensity = 0;
            this.material.opacity = 0;
        } else if (sp >= 0.08 && sp < 0.18) {
            // Rising slowly out of molten lava
            this.group.visible = true;
            const t = (sp - 0.08) / 0.10;
            const easeT = THREE.MathUtils.smoothstep(t, 0, 1);

            const yPos = THREE.MathUtils.lerp(-1.0, 0.8, easeT);
            this.group.position.set(0, yPos, 0);
            this.group.rotation.set(0.15 + Math.sin(time) * 0.05, time * 0.4, 0.1);

            this.material.opacity = Math.min(1.0, t * 2.0);
            this.material.emissiveIntensity = 0.4 + t * 0.6;
            this.glowLight.intensity = t * 2.5;

        // SCENE 3: THE LIGHT (0.18 - 0.28)
        } else if (sp >= 0.18 && sp < 0.28) {
            // Floating in air, emitting intense warm golden light and rotating
            this.group.visible = true;
            const t = (sp - 0.18) / 0.10;

            const hover = Math.sin(time * 1.5) * 0.08;
            this.group.position.set(0, 0.8 + hover, 0);
            this.group.rotation.set(0.1, time * 0.8, Math.sin(time * 1.2) * 0.1);

            const pulse = 1.0 + Math.sin(time * 4.0) * 0.25;
            this.material.opacity = 1.0;
            this.material.emissive.setHex(0xffaa22);
            this.material.emissiveIntensity = (1.0 + t * 1.5) * pulse;
            this.glowLight.color.setHex(0xffaa22);
            this.glowLight.intensity = (2.5 + t * 3.5) * pulse;

        // SCENE 4: TRANSFORMATION (0.28 - 0.42)
        } else if (sp >= 0.28 && sp < 0.42) {
            // Dissolving into glowing particles
            const t = (sp - 0.28) / 0.14;
            this.group.visible = t < 0.8;
            this.material.opacity = Math.max(0, 1.0 - t * 1.5);
            this.group.scale.setScalar(0.7 * (1.0 + t * 0.5));
            this.glowLight.intensity = Math.max(0, 6.0 * (1.0 - t));

        // SCENE 5 - 10: HIDDEN (Phoenix is formed)
        } else if (sp >= 0.42 && sp < 0.95) {
            this.group.visible = false;
            this.glowLight.intensity = 0;

        // SCENE 11 & LOOP BACK TO EARTH (0.95 - 1.00)
        } else {
            // Resetting deep in lava for seamless cycle
            this.group.visible = false;
            this.group.position.set(0, -1.2, 0);
            this.group.scale.setScalar(0.7);
            this.material.opacity = 0;
            this.glowLight.intensity = 0;
        }
    }
}

export const featherObject = new FeatherObject();
