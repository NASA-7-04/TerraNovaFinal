// App.js
import '../assets/css/stylesheet.css';
import '../assets/css/App.css';
import { forceRender } from '../App.js';

class LoadingScreen {
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
            <div style={{
                position: "absolute",
                width: "100%",
                height: "100vh",
                backgroundColor: "black",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
            }}>
                <h1>Now Loading...</h1>
                <a>Tip : Nah</a>
            </div>
        );
    }
}

export const loadingScreen = new LoadingScreen();