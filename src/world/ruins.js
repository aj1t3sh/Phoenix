import * as THREE from "three";
import { scene } from "../core/scene";

class AncientRuins {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = "AncientRuins";

        this.featherGlowLight = null;
        this.runeMaterials = [];
        this.createMonoliths();
        this.createFrozenFeatherAltar();
        this.createClawMarkStone();

        scene.add(this.group);
    }

    createMonoliths() {
        // Ancient weathered stone monoliths flanking the valley pass
        const stoneGeo = new THREE.BoxGeometry(1.4, 8.0, 1.4, 4, 16, 4);
        
        // Deform vertices for ancient rough carved look
        const pos = stoneGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const noise = Math.sin(y * 1.5) * 0.12 + Math.cos(x * 3.0 + z * 3.0) * 0.08;
            pos.setX(i, x + noise);
            pos.setZ(i, z + noise);
        }
        stoneGeo.computeVertexNormals();

        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x1c1a18,
            roughness: 0.95,
            metalness: 0.05,
            flatShading: false
        });

        // Left & Right Monolith pairs
        const positions = [
            [-5.5, 3.5, 4.0],
            [5.5, 3.5, 4.0],
            [-7.0, 3.5, -2.0],
            [7.0, 3.5, -2.0],
            [-4.0, 3.5, -12.0],
            [4.0, 3.5, -12.0],
        ];

        positions.forEach(([px, py, pz], idx) => {
            const mesh = new THREE.Mesh(stoneGeo, stoneMat);
            mesh.position.set(px, py, pz);
            mesh.rotation.y = (idx * 0.7) + Math.PI / 4;
            mesh.rotation.z = (Math.random() - 0.5) * 0.08;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.group.add(mesh);
        });
    }

    createFrozenFeatherAltar() {
        // Chapter I & II discovery: An ancient feather embedded in ice
        this.altarGroup = new THREE.Group();
        this.altarGroup.position.set(1.5, 0.4, 2.5);

        // Cracked glacial ice slab
        const iceGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.35, 12);
        const iceMat = new THREE.MeshStandardMaterial({
            color: 0x6688aa,
            roughness: 0.15,
            metalness: 0.1,
            transparent: true,
            opacity: 0.75,
            envMapIntensity: 1.5
        });
        const iceMesh = new THREE.Mesh(iceGeo, iceMat);
        iceMesh.receiveShadow = true;
        this.altarGroup.add(iceMesh);

        // Embedded glowing feather silhouette
        const featherGeo = new THREE.PlaneGeometry(0.8, 2.2, 4, 8);
        this.featherMat = new THREE.MeshStandardMaterial({
            color: 0x220500,
            emissive: new THREE.Color(0xff4400),
            emissiveIntensity: 0.25,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const featherMesh = new THREE.Mesh(featherGeo, this.featherMat);
        featherMesh.rotation.x = -Math.PI / 2 + 0.1;
        featherMesh.rotation.z = 0.4;
        featherMesh.position.set(0, 0.18, 0);
        this.altarGroup.add(featherMesh);

        // Faint sub-ice warm glow
        this.featherGlowLight = new THREE.PointLight(0xff4400, 0.4, 4.5, 2.0);
        this.featherGlowLight.position.set(0, 0.3, 0);
        this.altarGroup.add(this.featherGlowLight);

        this.group.add(this.altarGroup);
    }

    createClawMarkStone() {
        // Chapter II evidence: Scorched stone with deep talon scratches
        const rockGeo = new THREE.DodecahedronGeometry(1.8, 1);
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x151210,
            roughness: 0.98,
            metalness: 0.02
        });
        const rockMesh = new THREE.Mesh(rockGeo, rockMat);
        rockMesh.position.set(-2.2, 0.6, 0.0);
        rockMesh.rotation.set(0.3, 0.8, 0.2);
        rockMesh.scale.set(1.5, 0.8, 1.2);
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        this.group.add(rockMesh);
    }

    update(progress, time) {
        // Pulse the ice feather glow in Chapters 0 - 2
        if (this.featherGlowLight) {
            const sp = progress;
            if (sp < 0.35) {
                const pulse = 0.3 + Math.sin(time * 2.2) * 0.15;
                this.featherGlowLight.intensity = pulse;
                this.featherMat.emissiveIntensity = pulse * 0.8;
            } else {
                this.featherGlowLight.intensity = Math.max(0, 0.4 - (sp - 0.35) * 2.0);
            }
        }
    }
}

export const ancientRuins = new AncientRuins();
