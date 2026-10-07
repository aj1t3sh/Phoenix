import * as THREE from "three";
import { scene } from "../core/scene";

class AncientCavern {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = "AncientCavern";

        this.runeMaterials = [];
        this.runeLights = [];

        this.createCavernChamber();
        this.createSanctuaryPedestal();
        this.createCarvedRunes();

        scene.add(this.group);
    }

    createCavernChamber() {
        // Colossal ancient rocky cavern dome
        const domeGeo = new THREE.SphereGeometry(18, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
        
        // Deform dome for natural cavern stalactite / cavernous rock feel
        const pos = domeGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const noise = Math.sin(x * 0.4) * Math.cos(z * 0.4) * 1.5 + Math.sin(y * 0.8) * 0.8;
            pos.setX(i, x + noise * 0.4);
            pos.setY(i, y + noise * 0.6);
            pos.setZ(i, z + noise * 0.4);
        }
        domeGeo.computeVertexNormals();

        const domeMat = new THREE.MeshStandardMaterial({
            color: 0x12100e,
            roughness: 0.96,
            metalness: 0.04,
            side: THREE.BackSide,
            flatShading: false
        });

        this.domeMesh = new THREE.Mesh(domeGeo, domeMat);
        this.domeMesh.position.set(0, 0, -4);
        this.domeMesh.receiveShadow = true;
        this.group.add(this.domeMesh);

        // Cavern entrance archway (leading to the open sky in Chapters 6 & 7)
        const archGeo = new THREE.TorusGeometry(8, 2.2, 12, 24, Math.PI);
        const archMat = new THREE.MeshStandardMaterial({
            color: 0x181512,
            roughness: 0.95,
            metalness: 0.05
        });
        const archMesh = new THREE.Mesh(archGeo, archMat);
        archMesh.position.set(0, 0, 5);
        archMesh.rotation.y = Math.PI;
        archMesh.castShadow = true;
        archMesh.receiveShadow = true;
        this.group.add(archMesh);
    }

    createSanctuaryPedestal() {
        // Ancient carved stone roost where the Phoenix sits
        const pedestalGeo = new THREE.CylinderGeometry(3.5, 4.8, 1.6, 16);
        const pos = pedestalGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const roughness = Math.sin(x * 4.0 + z * 4.0) * 0.12;
            pos.setX(i, x + roughness);
            pos.setZ(i, z + roughness);
        }
        pedestalGeo.computeVertexNormals();

        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x1a1614,
            roughness: 0.92,
            metalness: 0.08
        });

        const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestal.position.set(0, 0.8, -4);
        pedestal.receiveShadow = true;
        pedestal.castShadow = true;
        this.group.add(pedestal);
    }

    createCarvedRunes() {
        // Ancient mysterious glyphs carved into the cavern walls
        const runePositions = [
            [-5.5, 4.0, -8.0, 0.4],
            [5.5, 4.0, -8.0, -0.4],
            [-8.0, 3.5, -4.0, 0.8],
            [8.0, 3.5, -4.0, -0.8],
            [-6.0, 5.5, 0.0, 1.2],
            [6.0, 5.5, 0.0, -1.2],
            [0.0, 7.5, -6.0, 0.0]
        ];

        runePositions.forEach(([x, y, z, ry], i) => {
            const runeGeo = new THREE.PlaneGeometry(1.6, 2.2);
            const runeMat = new THREE.MeshStandardMaterial({
                color: 0x0a0806,
                emissive: new THREE.Color(0xff6600),
                emissiveIntensity: 0.0,
                roughness: 0.9,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.95
            });

            const runeMesh = new THREE.Mesh(runeGeo, runeMat);
            runeMesh.position.set(x, y, z);
            runeMesh.rotation.y = ry;
            this.runeMaterials.push(runeMat);
            this.group.add(runeMesh);

            // Point light corresponding to rune glow
            const rLight = new THREE.PointLight(0xff6600, 0.0, 6, 2.0);
            rLight.position.set(x * 0.85, y, z * 0.85);
            this.runeLights.push(rLight);
            this.group.add(rLight);
        });
    }

    update(progress, time) {
        const sp = progress;

        // CHAPTER V: THE MEMORY OF FIRE (0.66 - 0.78) -> Runes illuminate brightly
        let runeIntensity = 0.0;
        if (sp >= 0.55 && sp < 0.66) {
            // Faint wake-up flicker
            const t = (sp - 0.55) / 0.11;
            runeIntensity = t * 0.35 + Math.sin(time * 6.0) * 0.08 * t;
        } else if (sp >= 0.66 && sp < 0.82) {
            // Radiant historical memory illumination
            const pulse = 1.0 + Math.sin(time * 3.5) * 0.2;
            runeIntensity = 1.6 * pulse;
        } else if (sp >= 0.82) {
            // Fade out as Phoenix leaves cavern to the sky
            runeIntensity = Math.max(0, 1.6 - (sp - 0.82) * 8.0);
        }

        this.runeMaterials.forEach((mat) => {
            mat.emissiveIntensity = runeIntensity;
        });

        this.runeLights.forEach((light) => {
            light.intensity = runeIntensity * 1.5;
        });
    }
}

export const ancientCavern = new AncientCavern();
