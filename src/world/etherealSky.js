import * as THREE from "three";
import { scene } from "../core/scene";

class EtherealSkyWorld {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = "EtherealSkyWorld";

        this.cloudLayers = [];
        this.floatingIslands = [];

        this.createCloudPlains();
        this.createFloatingPeaks();
        this.createSunCorona();

        this.group.position.set(0, 8.0, -10.0);
        this.group.visible = false;

        scene.add(this.group);
    }

    createCloudPlains() {
        // Multi-layered soft drifting cloud sea
        const cloudGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
        
        // Procedural cloud puff canvas
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0.0, "rgba(255, 255, 255, 0.7)");
        grad.addColorStop(0.4, "rgba(240, 248, 255, 0.4)");
        grad.addColorStop(0.8, "rgba(220, 235, 250, 0.1)");
        grad.addColorStop(1.0, "rgba(200, 220, 240, 0.0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        const cloudTex = new THREE.CanvasTexture(canvas);

        const cloudMat = new THREE.MeshBasicMaterial({
            map: cloudTex,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        // 3 cloud tiers
        for (let i = 0; i < 3; i++) {
            const mesh = new THREE.Mesh(cloudGeo, cloudMat.clone());
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(0, -2.0 - i * 1.5, -5 - i * 5);
            this.cloudLayers.push(mesh);
            this.group.add(mesh);
        }
    }

    createFloatingPeaks() {
        // Ethereal Chinese fantasy style floating misty mountain silhouettes
        const peakGeo = new THREE.ConeGeometry(4.5, 12.0, 16);
        const peakMat = new THREE.MeshStandardMaterial({
            color: 0x223545,
            roughness: 0.85,
            metalness: 0.1,
            flatShading: false
        });

        const positions = [
            [-18, 2.0, -25],
            [16, 4.0, -30],
            [-8, -1.0, -35],
            [22, -2.0, -22]
        ];

        positions.forEach(([px, py, pz], idx) => {
            const mesh = new THREE.Mesh(peakGeo, peakMat.clone());
            mesh.position.set(px, py, pz);
            mesh.rotation.y = idx * 0.8;
            mesh.scale.set(1.2 + idx * 0.2, 1.0, 1.2 + idx * 0.2);
            this.floatingIslands.push(mesh);
            this.group.add(mesh);
        });
    }

    createSunCorona() {
        const coronaGeo = new THREE.PlaneGeometry(35, 35);
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0.0, "rgba(255, 245, 210, 0.9)");
        grad.addColorStop(0.3, "rgba(255, 215, 140, 0.45)");
        grad.addColorStop(0.7, "rgba(255, 180, 80, 0.15)");
        grad.addColorStop(1.0, "rgba(255, 150, 50, 0.0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        const coronaTex = new THREE.CanvasTexture(canvas);

        const coronaMat = new THREE.MeshBasicMaterial({
            map: coronaTex,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
        this.sunCorona.position.set(0, 8.0, -38);
        this.group.add(this.sunCorona);
    }

    update(progress, delta, time) {
        const sp = progress;

        // Active primarily during Scenes 8 - 10 (0.78 - 0.96)
        if (sp >= 0.78 && sp < 0.98) {
            this.group.visible = true;

            let opacity = 0.0;
            if (sp < 0.84) {
                // Breakthrough transition
                opacity = (sp - 0.78) / 0.06;
            } else if (sp >= 0.84 && sp <= 0.94) {
                // Full serene sky
                opacity = 1.0;
            } else {
                // Descending back through clouds
                opacity = Math.max(0, 1.0 - (sp - 0.94) / 0.04);
            }

            this.cloudLayers.forEach((cloud, i) => {
                cloud.material.opacity = opacity * 0.75;
                cloud.rotation.z = time * 0.02 * (i % 2 === 0 ? 1 : -1);
            });

            this.floatingIslands.forEach((island, i) => {
                island.material.opacity = opacity;
                island.position.y += Math.sin(time * 0.8 + i) * 0.002;
            });

            if (this.sunCorona) {
                this.sunCorona.material.opacity = opacity * 0.85;
            }
        } else {
            this.group.visible = false;
        }
    }
}

export const etherealSky = new EtherealSkyWorld();
