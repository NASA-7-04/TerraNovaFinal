// App.js
import '../assets/css/stylesheet.css';
import '../assets/css/App.css';
import { Menu1, WhiteFrameOnRight } from '../components/scene2/Frames.js';
import {GameFrame} from '../game/GameScene.js';
import { initialize } from '../game/maps/Scene2.js';
import { forceRender } from '../App.js';
import { screen1 } from './Screen1.js';
import { loadingScreen } from './LoadingScreen.js';
import { ComponentPreviewerObject, game, Game } from '../game/objects/Parameters.js';
import { Components, Component, ComponentPreviewer } from '../game/objects/Objects.js';
import * as BABYLON from 'babylonjs';
import { SceneManager } from '../game/SceneManager.js';
import { GameObject } from '../game/objects/ObjectClasses.js';
import { gameResultFrame } from '../components/scene2/GameResultFrame.js';

function addComponentToGame(component, position, rotation) {
    const newComponent = new Component(component);
    newComponent.position = position;
    newComponent.rotation = rotation;
    game.value.addComponent(newComponent);
}

function onSceneReady() {
  
    game.start();

    addComponentToGame(Components.hab_dome, new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,0,0));
    addComponentToGame(Components.battery, new BABYLON.Vector3(10,0,0), new BABYLON.Vector3(0,0,0));
    addComponentToGame(Components.solar_array, new BABYLON.Vector3(15,0,0), new BABYLON.Vector3(0,0,0));
}


class Screen2 {
   constructor() {
    this.visible = false;

    return this;
   }

   setVisibility(state) {
    this.visible = state;
    forceRender();
   }
   render() {
    if (!this.visible) return null;

    return (
    <div className="App">
        {gameResultFrame.render()}
      <Menu1 />
      <div style = {{
        width : "75%",
        height : "100vh",
        position: "fixed",
        zIndex : -1,
      }}>
        <GameFrame sceneToLoad={initialize} onSceneReady={onSceneReady}/>
      </div>
    </div>
  );
   }
}

export const screen2 = new Screen2();

export const loadScreen2 = () => {
  screen1.setVisibility(false);
  loadingScreen.setVisibility(true);
  setTimeout(() => {
    loadingScreen.setVisibility(false);
    screen2.setVisibility(true);
  }, 3000);
};

