// GameScene.js
import React, {useRef, useEffect} from 'react';
// Load babylon.js
import * as BABYLON from 'babylonjs';

import 'babylonjs-loaders';
import 'babylonjs-materials';
import 'babylonjs-gui';
import 'babylonjs-serializers';
import { AdvancedDynamicTexture, Control, TextBlock } from 'babylonjs-gui';
import { createScene } from './CreateScene';
import { SceneManager } from './SceneManager';

export function GameFrame({ onSceneReady, sceneToLoad }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect( () => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene =  createScene(engine, canvasRef.current);
    if (sceneToLoad) {
      sceneToLoad();
    }
    sceneRef.current = scene;

    // optional callback to parent (expose scene/engine)
    if (onSceneReady) onSceneReady({ scene, engine, canvas: canvasRef.current });

    engine.runRenderLoop(() => {
      if (scene && !scene.isDisposed) scene.render();
    });

    const handleResize = () => {
      try { engine.resize(); } catch (e) {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        scene.dispose();
        engine.dispose();
      } catch (e) {}
      engineRef.current = null;
      sceneRef.current = null;
    };
  }, [onSceneReady]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      touch-action="none"
    />
  );
}