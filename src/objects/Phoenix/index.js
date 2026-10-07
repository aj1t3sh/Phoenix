import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene } from "../../core/scene";
import { enhancePhoenixMaterial } from "./material";

class Phoenix {
    constructor() {
        if (Phoenix.instance) {
            return Phoenix.instance;
        }
        Phoenix.instance = this;

        this.group = new THREE.Group();
        this.group.name = "PhoenixCreature";

        // Positioned perfectly in front of the stone roost
        this.group.position.set(0, 1.2, -2.5);
        this.group.scale.setScalar(0.0082); // Scaled for majestic raptor proportions
        this.group.rotation.set(0, Math.PI, 0);

        this.model = null;
        this.mixer = null;
        this.animations = [];
        this.action = null;
        this.isLoaded = false;

        this.bones = {};
        this.materialsList = [];

        // Internal creature warm key light
        this.creatureLight = new THREE.PointLight(0xff6611, 0, 12, 1.8);
        this.creatureLight.position.set(0, 1.0, 0);
        this.group.add(this.creatureLight);

        // Core chest warm glow
        this.chestGlow = new THREE.PointLight(0xff4400, 0, 6, 2.0);
        this.chestGlow.position.set(0, 0.6, 0.4);
        this.group.add(this.chestGlow);

        // Wingtip tracking anchors for spawning embers in world space
        this.leftWingTip = new THREE.Object3D();
        this.rightWingTip = new THREE.Object3D();
        this.tailTip = new THREE.Object3D();
        this.group.add(this.leftWingTip);
        this.group.add(this.rightWingTip);
        this.group.add(this.tailTip);

        this.loadModel();
        scene.add(this.group);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            "/models/phoenix_bird.glb",
            (gltf) => {
                this.model = gltf.scene;
                this.animations = gltf.animations;

                this.model.traverse((child) => {
                    if (child.isMesh || child.isSkinnedMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        if (child.material) {
                            const isPlumage = child.name.toLowerCase().includes("01b") || child.material.name.includes("01b");
                            const enhancedMat = enhancePhoenixMaterial(child.material, isPlumage);
                            child.material = enhancedMat;
                            this.materialsList.push(enhancedMat);
                        }
                    }

                    if (child.isBone) {
                        this.bones[child.name] = child;
                    }
                });

                if (this.bones["B_Left_Wing_8_075"]) {
                    this.bones["B_Left_Wing_8_075"].add(this.leftWingTip);
                }
                if (this.bones["B_Right_Wing_8_087"]) {
                    this.bones["B_Right_Wing_8_087"].add(this.rightWingTip);
                }
                if (this.bones["B_Tail_5_034"]) {
                    this.bones["B_Tail_5_034"].add(this.tailTip);
                }

                if (this.animations && this.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    this.action = this.mixer.clipAction(this.animations[0]);
                    this.action.play();
                    this.action.timeScale = 0.45;
                }

                this.group.add(this.model);
                this.isLoaded = true;
                this.group.visible = false; // Initially hidden until Scene 4
            },
            undefined,
            (error) => {
                console.error("Error loading Phoenix 3D model:", error);
            }
        );
    }

    setThermalIntensity(intensity, colorHex = 0xff5511) {
        const color = new THREE.Color(colorHex);

        this.materialsList.forEach((mat) => {
            if (mat.userData && mat.userData.shader) {
                mat.userData.shader.uniforms.uThermalIntensity.value = intensity;
                mat.userData.shader.uniforms.uThermalColor.value = color;
            }
            mat.emissive.copy(color);
            mat.emissiveIntensity = intensity * 0.35;
        });

        this.creatureLight.intensity = intensity * 3.5;
        this.creatureLight.color.copy(color);
        this.chestGlow.intensity = intensity * 2.2;
    }

    setPhoenixOpacity(opacity) {
        this.materialsList.forEach((mat) => {
            mat.transparent = opacity < 0.99;
            mat.opacity = opacity;
        });
    }

    getEmberEmitterPositions() {
        const positions = [];
        const v = new THREE.Vector3();

        if (this.leftWingTip && this.leftWingTip.parent) {
            this.leftWingTip.getWorldPosition(v);
            positions.push(v.clone());
        }
        if (this.rightWingTip && this.rightWingTip.parent) {
            this.rightWingTip.getWorldPosition(v);
            positions.push(v.clone());
        }
        if (this.tailTip && this.tailTip.parent) {
            this.tailTip.getWorldPosition(v);
            positions.push(v.clone());
        }

        this.group.getWorldPosition(v);
        v.y += 0.8;
        positions.push(v.clone());

        return positions;
    }
}

export const phoenix = new Phoenix();