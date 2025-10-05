// Initialize.js
import { GameCamera, GameObject, } from '../objects/ObjectClasses';
import * as BABYLON from 'babylonjs';
import { Planets } from '../objects/Objects';

export function initialize() {
    const Skybox = new GameObject("Skybox",{
        meshId : "./game/assets/models/Skybox.glb",
        size : new BABYLON.Vector3(1000,1000,1000),
    });
    const Camera = new GameCamera("Camera",{
        position : new BABYLON.Vector3(0,5,-10),
        target : new BABYLON.Vector3(0,0,0),
        fov : 0.8,
    });

    
    const Earth = new GameObject("Earth",{
        meshId : "./game/assets/models/Earth.glb",
    });
    Earth.onMouseClick.connect(() => {
        Camera.tweenToTargetObject(Earth);
    });

    for (const planetName in Planets) {
        let planet = Planets[planetName];
        planet.renderPlanetOnMap();
    }
}