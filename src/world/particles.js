import * as THREE from "three";
import { scene } from "../core/scene";
import { phoenix } from "../objects/Phoenix";
import { featherObject } from "../objects/Feather";

class ParticleSystemManager {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = "CinematicParticleManager";

        this.particleTex = this.createParticleTexture();

        // 1. Feather Emergence Lava Droplets (Scene 2)
        this.dropletCount = 150;
        this.createLavaDroplets();

        // 2. Feather Golden Swirl Aura (Scene 3)
        this.auraCount = 600;
        this.createFeatherAura();

        // 3. Transformation Particle Morph Array (Scene 4)
        this.transformCount = 1800;
        this.createTransformationParticles();

        // 4. Subtle Ambient Air Embers (Unobtrusive)
        this.ambientCount = 500;
        this.createAmbientEmbers();

        // 5. Flight Wingtip Trails (Scene 7 - 9)
        this.trailCount = 400;
        this.createFlightTrails();

        scene.add(this.group);
        this.cursor = { x: 0, y: 0 };
    }

    createParticleTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
        grad.addColorStop(0.2, "rgba(255, 220, 140, 0.85)");
        grad.addColorStop(0.5, "rgba(255, 100, 20, 0.35)");
        grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    createLavaDroplets() {
        const pos = new Float32Array(this.dropletCount * 3);
        const vel = new Float32Array(this.dropletCount * 3);
        for (let i = 0; i < this.dropletCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.4;
            pos[i * 3 + 1] = -100;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
            vel[i * 3] = (Math.random() - 0.5) * 0.01;
            vel[i * 3 + 1] = -Math.random() * 0.03 - 0.01;
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("velocity", new THREE.BufferAttribute(vel, 3));

        this.dropletMat = new THREE.PointsMaterial({
            size: 0.12,
            map: this.particleTex,
            transparent: true,
            opacity: 0.0,
            color: 0xff6600,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.dropletPoints = new THREE.Points(geo, this.dropletMat);
        this.group.add(this.dropletPoints);
    }

    createFeatherAura() {
        const pos = new Float32Array(this.auraCount * 3);
        const angles = new Float32Array(this.auraCount);
        const radii = new Float32Array(this.auraCount);
        const heights = new Float32Array(this.auraCount);

        for (let i = 0; i < this.auraCount; i++) {
            angles[i] = Math.random() * Math.PI * 2;
            radii[i] = Math.random() * 1.4 + 0.1;
            heights[i] = Math.random() * 2.0 - 0.5;
            pos[i * 3] = Math.cos(angles[i]) * radii[i];
            pos[i * 3 + 1] = heights[i];
            pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("angle", new THREE.BufferAttribute(angles, 1));
        geo.setAttribute("radius", new THREE.BufferAttribute(radii, 1));
        geo.setAttribute("height", new THREE.BufferAttribute(heights, 1));

        this.auraMat = new THREE.PointsMaterial({
            size: 0.14,
            map: this.particleTex,
            transparent: true,
            opacity: 0.0,
            color: 0xffbb33,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.auraPoints = new THREE.Points(geo, this.auraMat);
        this.group.add(this.auraPoints);
    }

    createTransformationParticles() {
        // Particles that start at the feather and morph into the wings and body curves
        const pos = new Float32Array(this.transformCount * 3);
        const originPos = new Float32Array(this.transformCount * 3);
        const targetPos = new Float32Array(this.transformCount * 3);

        for (let i = 0; i < this.transformCount; i++) {
            const i3 = i * 3;
            // Origin at feather center
            originPos[i3] = (Math.random() - 0.5) * 0.5;
            originPos[i3 + 1] = 0.8 + (Math.random() - 0.5) * 1.2;
            originPos[i3 + 2] = (Math.random() - 0.5) * 0.5;

            // Target forming wing arch and body
            const side = i % 2 === 0 ? 1 : -1;
            const u = Math.random();
            const wingSpan = u * 4.2 * side;
            const wingY = 1.0 + Math.sin(u * Math.PI) * 1.5 + (Math.random() - 0.5) * 0.4;
            const wingZ = -2.5 + Math.cos(u * Math.PI * 0.5) * 1.0 + (Math.random() - 0.5) * 0.4;

            targetPos[i3] = wingSpan;
            targetPos[i3 + 1] = wingY;
            targetPos[i3 + 2] = wingZ;

            pos[i3] = originPos[i3];
            pos[i3 + 1] = originPos[i3 + 1];
            pos[i3 + 2] = originPos[i3 + 2];
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("originPos", new THREE.BufferAttribute(originPos, 3));
        geo.setAttribute("targetPos", new THREE.BufferAttribute(targetPos, 3));

        this.transformMat = new THREE.PointsMaterial({
            size: 0.16,
            map: this.particleTex,
            transparent: true,
            opacity: 0.0,
            color: 0xff9922,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.transformPoints = new THREE.Points(geo, this.transformMat);
        this.group.add(this.transformPoints);
    }

    createAmbientEmbers() {
        const pos = new Float32Array(this.ambientCount * 3);
        const vel = new Float32Array(this.ambientCount * 3);

        for (let i = 0; i < this.ambientCount; i++) {
            const i3 = i * 3;
            pos[i3] = (Math.random() - 0.5) * 16;
            pos[i3 + 1] = Math.random() * 8 - 1;
            pos[i3 + 2] = (Math.random() - 0.5) * 14;

            vel[i3] = (Math.random() - 0.5) * 0.008;
            vel[i3 + 1] = Math.random() * 0.015 + 0.004;
            vel[i3 + 2] = (Math.random() - 0.5) * 0.008;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("velocity", new THREE.BufferAttribute(vel, 3));

        this.ambientMat = new THREE.PointsMaterial({
            size: 0.09,
            map: this.particleTex,
            transparent: true,
            opacity: 0.35,
            color: 0xff6600,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.ambientPoints = new THREE.Points(geo, this.ambientMat);
        this.group.add(this.ambientPoints);
    }

    createFlightTrails() {
        const pos = new Float32Array(this.trailCount * 3);
        for (let i = 0; i < this.trailCount; i++) {
            pos[i * 3] = 0;
            pos[i * 3 + 1] = -100;
            pos[i * 3 + 2] = 0;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

        this.trailMat = new THREE.PointsMaterial({
            size: 0.18,
            map: this.particleTex,
            transparent: true,
            opacity: 0.0,
            color: 0xffaa22,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.trailPoints = new THREE.Points(geo, this.trailMat);
        this.group.add(this.trailPoints);
        this.trailHead = 0;
    }

    setCursor(x, y) {
        this.cursor.x = x;
        this.cursor.y = y;
    }

    update(progress, delta, time) {
        const sp = progress;

        // 1. Lava Droplets (Scene 2: 0.08 - 0.18)
        if (this.dropletPoints && this.dropletMat) {
            if (sp >= 0.08 && sp < 0.18) {
                this.dropletMat.opacity = 0.8;
                const pos = this.dropletPoints.geometry.attributes.position.array;
                const vel = this.dropletPoints.geometry.attributes.velocity.array;

                for (let i = 0; i < this.dropletCount; i++) {
                    const i3 = i * 3;
                    pos[i3 + 1] += vel[i3 + 1];
                    if (pos[i3 + 1] < -0.8) {
                        pos[i3] = (Math.random() - 0.5) * 0.4;
                        pos[i3 + 1] = 0.6 + Math.random() * 0.3;
                        pos[i3 + 2] = (Math.random() - 0.5) * 0.4;
                    }
                }
                this.dropletPoints.geometry.attributes.position.needsUpdate = true;
            } else {
                this.dropletMat.opacity = 0.0;
            }
        }

        // 2. Feather Aura (Scene 3: 0.18 - 0.28)
        if (this.auraPoints && this.auraMat) {
            if (sp >= 0.18 && sp < 0.28) {
                const t = (sp - 0.18) / 0.10;
                this.auraMat.opacity = t * 0.95;

                const pos = this.auraPoints.geometry.attributes.position.array;
                const angles = this.auraPoints.geometry.attributes.angle.array;
                const radii = this.auraPoints.geometry.attributes.radius.array;
                const heights = this.auraPoints.geometry.attributes.height.array;

                for (let i = 0; i < this.auraCount; i++) {
                    angles[i] += delta * 1.5;
                    const i3 = i * 3;
                    pos[i3] = Math.cos(angles[i]) * radii[i] + this.cursor.x * 0.1;
                    pos[i3 + 1] = 0.8 + heights[i] + Math.sin(angles[i] * 3.0 + time) * 0.15;
                    pos[i3 + 2] = Math.sin(angles[i]) * radii[i];
                }
                this.auraPoints.geometry.attributes.position.needsUpdate = true;
            } else {
                this.auraMat.opacity = 0.0;
            }
        }

        // 3. Transformation Morph Array (Scene 4: 0.28 - 0.42)
        if (this.transformPoints && this.transformMat) {
            if (sp >= 0.28 && sp < 0.42) {
                const t = (sp - 0.28) / 0.14;
                this.transformMat.opacity = Math.sin(t * Math.PI) * 0.95;

                const pos = this.transformPoints.geometry.attributes.position.array;
                const originPos = this.transformPoints.geometry.attributes.originPos.array;
                const targetPos = this.transformPoints.geometry.attributes.targetPos.array;

                const easeT = THREE.MathUtils.smoothstep(t, 0, 1);
                for (let i = 0; i < this.transformCount; i++) {
                    const i3 = i * 3;
                    pos[i3] = THREE.MathUtils.lerp(originPos[i3], targetPos[i3], easeT) + Math.sin(time * 3.0 + i) * 0.04;
                    pos[i3 + 1] = THREE.MathUtils.lerp(originPos[i3 + 1], targetPos[i3 + 1], easeT) + Math.cos(time * 2.5 + i) * 0.04;
                    pos[i3 + 2] = THREE.MathUtils.lerp(originPos[i3 + 2], targetPos[i3 + 2], easeT);
                }
                this.transformPoints.geometry.attributes.position.needsUpdate = true;
            } else {
                this.transformMat.opacity = 0.0;
            }
        }

        // 4. Subtle Ambient Air Embers
        if (this.ambientPoints && this.ambientMat) {
            // Keep opacity low so it never obscures the Phoenix
            this.ambientMat.opacity = sp > 0.84 ? 0.05 : 0.25;

            const pos = this.ambientPoints.geometry.attributes.position.array;
            const vel = this.ambientPoints.geometry.attributes.velocity.array;

            for (let i = 0; i < this.ambientCount; i++) {
                const i3 = i * 3;
                pos[i3] += vel[i3];
                pos[i3 + 1] += vel[i3 + 1];
                pos[i3 + 2] += vel[i3 + 2];

                if (pos[i3 + 1] > 8) {
                    pos[i3 + 1] = -1;
                    pos[i3] = (Math.random() - 0.5) * 16;
                    pos[i3 + 2] = (Math.random() - 0.5) * 14;
                }
            }
            this.ambientPoints.geometry.attributes.position.needsUpdate = true;
        }

        // 5. Flight Trails (Scene 7 - 9)
        if (this.trailPoints && this.trailMat && phoenix && phoenix.isLoaded) {
            if (sp >= 0.68 && sp < 0.94) {
                this.trailMat.opacity = 0.85;
                const pos = this.trailPoints.geometry.attributes.position.array;
                const emitters = phoenix.getEmberEmitterPositions();

                emitters.forEach((pt) => {
                    const idx = this.trailHead * 3;
                    pos[idx] = pt.x + (Math.random() - 0.5) * 0.2;
                    pos[idx + 1] = pt.y + (Math.random() - 0.5) * 0.2;
                    pos[idx + 2] = pt.z + (Math.random() - 0.5) * 0.2;
                    this.trailHead = (this.trailHead + 1) % this.trailCount;
                });
                this.trailPoints.geometry.attributes.position.needsUpdate = true;
            } else {
                this.trailMat.opacity = 0.0;
            }
        }
    }
}

export const particleManager = new ParticleSystemManager();