// GameResultFrame.js

import { forceRender } from '../../App';
import { loadScreen1 } from '../../scenes/Screen1';
import { IconButton3, TextButtonWithDescription, TextButtonWithDescriptionSmall } from '../ui/Buttons';
import { DropdownMenu, DropdownMenu2 } from '../ui/MiscellaneousUIElements';


export const GameResultWindow = ({ visible }) => {
    const game = require('../../game/objects/Parameters').game;
    const gameResult = game.value ? game.value.gameResult : null;
    if (!gameResult) {
        return null;
    }

    if (!visible) {
        return null;
    }
    return (
        <> 
            <h1>{gameResult.success ? "Success!" : "Game Over"}</h1>
            <h3>{gameResult.planetFlavor ? gameResult.planetFlavor : ""}</h3>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                width: "100%",
                height: "100%",
                overflowY: "auto",
            }}>
                <DropdownMenu2 name={"Status"} onChange={(value) => { }}>
                    <TextButtonWithDescription
                        key={"survivalScore"} label={"Survival Score"} description={gameResult.survivalScore}
                        onClick={() => { }}></TextButtonWithDescription>
                    <TextButtonWithDescription
                        key={"powerBalance"} label={"Power Balance"} description={gameResult.powerBalance}
                        onClick={() => { }}></TextButtonWithDescription>
                    <TextButtonWithDescription
                        key={"verdict"} label={"Verdict"} description={gameResult.verdict}
                        onClick={() => { }}></TextButtonWithDescription>
                </DropdownMenu2>
                <IconButton3 label={"Return To Menu"} icon={"fa-solid fa-paper-plane"}
                    onClick={() => {loadScreen1();  }}></IconButton3>
            </div>
        </>
    )
}

class GameResultFrame {
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
                backgroundColor: "rgba(0,0,0,0)",
                height: "100%",
                width: "100%",
                position: "fixed",
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 100,
            }}>
                <div style={{
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    color: "rgba(0,0,0,1)",
                    width : "50%",
                    height : "50%",
                    top : "25%",
                    left : "25%",
                    padding: "2rem",
                    position: "fixed",

                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    pointerEvents: "all",

                    zIndex: 100,
                }}>
                    <GameResultWindow visible={this.visible} />
                </div>
            </div>
        );
    }
}

export const gameResultFrame = new GameResultFrame();