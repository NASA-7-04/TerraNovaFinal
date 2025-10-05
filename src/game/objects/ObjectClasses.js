// ObjectClasses.js

import { SceneManager } from "../SceneManager";
import * as BABYLON from 'babylonjs';

export let objects = {};

export let currentCamera = null;

export class GameObject {
    constructor(name, mesh) {
        // Identical to Roblox
        this.name = name;
        this.meshId = mesh.meshId || null;
        this.meshContent = mesh.mesh || null;
        this.primaryMesh = mesh.mesh || null;
        this.pickMesh = null;
        this.position = mesh.position || new BABYLON.Vector3(0, 0, 0);
        this.orientation = mesh.rotation || new BABYLON.Vector3(0, 0, 0);
        this.size = mesh.size || new BABYLON.Vector3(1, 1, 1);
        this.children = [];
        this.parent = null;
        this.interactive = true;
        this.visible = true;
        this.className = "GameObject";
        objects[name] = this;

        if (SceneManager.getScene()) {
            this.render();
        }

        return this;
    }
    render() {
        const scene = SceneManager.getScene();
        BABYLON.ImportMeshAsync(this.meshId, scene).then((meshes) => {
            this.meshContent = meshes;
            this.primaryMesh = meshes.meshes[0];
            this.pickMesh = meshes.meshes[1];
            this.primaryMesh.position = this.position;
            this.primaryMesh.rotation = this.orientation;
            this.primaryMesh.scaling = this.size;
            this.pickMesh.isPickable = this.interactive;
        }).catch((error) => {
            console.error("Error loading meshes:", error);
        });
    }
    setParent(parentObject) {
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            if (index > -1) {
                this.parent.children.splice(index, 1);
            }
        }
        this.parent = parentObject;
        parentObject.children.push(this);
        this.primaryMesh.parent = parentObject.meshContent;
    }
    setPosition(newPosition) {
        this.position = newPosition;
        if (!this.primaryMesh) return;
        this.primaryMesh.position = newPosition;
    }
    setOrientation(newOrientation) {
        this.orientation = newOrientation;
        if (!this.primaryMesh) return;
        this.primaryMesh.rotation = newOrientation;
    }
    setSize(newSize) {
        this.size = newSize;
        this.primaryMesh.scaling = newSize;
    }
    setTransparency(transparency) {
        if (!this.primaryMesh) return;
        this.primaryMesh.visibility = transparency;
    }
    setInteractive(state) {
        this.interactive = state;
        if (!this.meshContent) return;
        for (let mesh of this.meshContent.meshes) {
            mesh.isPickable = state;
        }
    }

    onMouseClick = {
        connect: (callback) => {
            if (this.interactive) {
                const scene = SceneManager.getScene();
                scene.onPointerObservable.add((pointerInfo) => {
                    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
                        const pickResult = pointerInfo.pickInfo;
                        if (pickResult.hit && pickResult.pickedMesh === this.pickMesh) {
                            callback();
                        }
                    }
                });
            } else {
                console.warn(`Object ${this.name} is not interactive. Set interactive to true to enable click events.`);
            }
        }
    }
    dispose() {
        if (this.primaryMesh) {
            this.primaryMesh.dispose();
        }
        if (this.pickMesh) {
            this.pickMesh.dispose();
        }
        delete objects[this.name];
    }
}


export class GameCamera {
    constructor(name, params) {
        this.name = name;
        this.position = params.position || new BABYLON.Vector3(0, 5, -10);
        this.target = params.target || new BABYLON.Vector3(0, 0, 0);
        this.targetObject = params.targetObject || null;
        this.fov = params.fov || 0.8;
        this.className = "Camera";
        this.cameraContent = null;
        if (SceneManager.getScene()) {
            this.render();
        }
        currentCamera = this;
        return this;
    }
    render() {
        const scene = SceneManager.getScene();
        this.cameraContent = new BABYLON.ArcRotateCamera(this.name, -Math.PI / 2, Math.PI / 2.5, 10, this.target, scene);
        this.cameraContent.setPosition(this.position);
        this.cameraContent.fov = this.fov;
        this.cameraContent.attachControl(scene.getEngine().getRenderingCanvas(), true);
        scene.activeCamera = this.cameraContent;
        scene.activeCamera.attachControl(scene.getEngine().getRenderingCanvas(), true);
}
    setPosition(newPosition) {
        this.position = newPosition;
        this.cameraContent.setPosition(newPosition);
    }
    setTarget(newTarget) {
        this.target = newTarget;
        this.cameraContent.setTarget(newTarget);
    }
    setTargetObject(newTargetObject) {
        this.targetObject = newTargetObject;
        if (newTargetObject && newTargetObject.primaryMesh) {
            this.setTarget(newTargetObject.primaryMesh.position);
        }
    }
    setFov(newFov) {
        this.fov = newFov;
        this.cameraContent.fov = newFov;
    }
    setZoom(distanceFromTarget) {
        this.cameraContent.radius = distanceFromTarget;
    }
    tweenToTarget(newTarget, duration = 1000, zoom) {
        if (!this.target) {
            this.target = newTarget;
        }
        
        const startTarget = this.target.clone();
        const startTime = performance.now();
        const startZoom = this.cameraContent.radius;
        const newZoom = zoom || startZoom;

        const animate = (currentTime) => { 
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / duration, 1);
            const interpolatedTarget = BABYLON.Vector3.Lerp(startTarget, newTarget, t);
            const interpolatedZoom = BABYLON.Scalar.Lerp(startZoom, newZoom, t);
            this.setTarget(interpolatedTarget);
            this.setZoom(interpolatedZoom);
            if (t < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
    tweenToTargetObject(newTargetObject, duration = 1000) {
        if (newTargetObject && newTargetObject.primaryMesh) {
            this.tweenToTarget(newTargetObject.primaryMesh.position, duration, newTargetObject.size.length() * 8);
            this.targetObject = newTargetObject;
        }
    }
}
