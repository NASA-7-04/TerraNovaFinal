// App.js
import '../assets/css/stylesheet.css';
import '../assets/css/App.css';
import { Menu1, WhiteFrameOnRight } from '../components/home/WhiteFrameOnRight.js';
import {GameFrame} from '../game/GameScene.js';
import { initialize } from '../game/maps/Scene1.js';
import { loadingScreen } from './LoadingScreen.js';
import { forceRender } from '../App.js';
import { screen2 } from './Screen2.js';

class Screen1 {
   constructor() {
    this.visible = true;
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
      <Menu1 />
      <div style = {{
        width : "75%",
        height : "100vh",
        position: "fixed",
        zIndex : -1,
      }}>
      <GameFrame sceneToLoad={initialize} />
      </div>
    </div>
  );
   }
}

export const screen1 = new Screen1();


export const loadScreen1 = () => {
  screen2.setVisibility(false);
  loadingScreen.setVisibility(true);
  setTimeout(() => {
    loadingScreen.setVisibility(false);
    screen1.setVisibility(true);
  }, 3000);
};