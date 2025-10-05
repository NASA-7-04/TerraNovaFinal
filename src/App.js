// App.js
import './assets/css/stylesheet.css';
import './assets/css/App.css';
import { screen1 } from './scenes/Screen1.js';
import { screen2 } from './scenes/Screen2.js';
import React, { useState } from 'react';
import { loadingScreen } from './scenes/LoadingScreen.js';

let _forceRender = () => {};

export function forceRender() {
  _forceRender();
}

function App() {
  const [_, update] = useState(0);

  _forceRender = () => update(x => x + 1);

  return (
    <div className="App">
      {screen1.render()}
      {screen2.render()}
      {loadingScreen.render()}
    </div>
  );
}

export default App;
