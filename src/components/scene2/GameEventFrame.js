// GameResultFrame.js

import { forceRender } from '../../App';
import { loadScreen1 } from '../../scenes/Screen1';
import { IconButton3, TextButtonWithDescription, TextButtonWithDescriptionSmall } from '../ui/Buttons';
import { DropdownMenu, DropdownMenu2 } from '../ui/MiscellaneousUIElements';

let currentEvent = null;

export const GameEventWindow = ({ visible }) => {
    let mySelection = null;
    const game = require('../../game/objects/Parameters').game;
    
    if (!currentEvent) {
        return null;
    }

    if (!visible) {
        return null;
    }
    return (
        <> 
            <h1>Day {currentEvent.day}</h1>
            <h3>{currentEvent.title}</h3>
            <p>{currentEvent.effect}</p>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                width: "100%",
                height: "100%",
                overflowY: "auto",
            }}>
                <DropdownMenu2 name={"Options"} onChange={(value) => { }}>
                    {currentEvent.choices.map((option, index) => (
                        <TextButtonWithDescriptionSmall
                            key={index} label={`${index + 1}`} description={option.text} onClick={() => {currentEvent.choose(index)}}  /> )) }
                </DropdownMenu2>
            </div>
        </>
    )
}

class GameEventFrame {
    constructor() {
        this.visible = false;

        return this;
    }

    setVisibility(state) {
        this.visible = state;
        forceRender();
    }
    render(event) {
        currentEvent = event;
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
                    <GameEventWindow visible={this.visible} />
                </div>
            </div>
        );
    }
}

export const gameEventFrame = new GameEventFrame();