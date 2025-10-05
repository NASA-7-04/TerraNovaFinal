// CreateScene.js
import React, { useRef, useEffect } from 'react';
// Load babylon.js
import * as BABYLON from 'babylonjs';

import 'babylonjs-loaders';
import 'babylonjs-materials';
import 'babylonjs-gui';
import 'babylonjs-serializers';
import { AdvancedDynamicTexture, Control, TextBlock } from 'babylonjs-gui';
import { SceneManager } from './SceneManager';

export function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    SceneManager.init(scene);

    return scene;
}

export function loadScene(initializeFunction) {
    initializeFunction();
}