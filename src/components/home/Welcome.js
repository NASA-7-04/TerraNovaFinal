import React, { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import { CheckboxButton, CheckboxButtonWithDescription, IconButton1, IconButton2, TextButton1 } from "../ui/Buttons";
import { DropdownMenu } from "../ui/MiscellaneousUIElements";
import { MenuContext } from "./WhiteFrameOnRight";
import { Planets } from "../../game/objects/Objects";
import { SceneManager } from "../../game/SceneManager";
import { currentCamera } from "../../game/objects/ObjectClasses";
import { SelectedPlanetOnMenu } from "../../game/objects/Parameters";



export const WelcomeWindow = forwardRef(({visible }, ref) => {
    const { setPlanet, planet, activeMenu, setActiveMenu } = React.useContext(MenuContext);

    const setPlanetHelper = (selectedPlanet) => {
        const Camera = currentCamera;
        setPlanet(selectedPlanet);
        SelectedPlanetOnMenu.setValue(selectedPlanet);
        Camera.tweenToTargetObject(selectedPlanet.renderedPlanetObject);
    }

    let PlanetButtons = [];
    for (const planetName in Planets) {
        let selectedPlanet =  Planets[planetName];
        PlanetButtons.push(<TextButton1 key={selectedPlanet.id} label={selectedPlanet.name} onClick={() => setPlanetHelper(selectedPlanet)}></TextButton1>);
    }
    if (!visible) {
        return null;
    }

    return (
        <>
            <div  ref={ref}>
                <h1 style={{}}>Choose Your Destination</h1>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
            }}>
                <CheckboxButtonWithDescription
                    description={"Show Fast Travel Locations"}
                />
                <CheckboxButtonWithDescription
                    description={"Show Habitable Zones"}
                />
            </div>


            <DropdownMenu name={"Planets"} onChange= {(value) => {setPlanet(value)}}>
                {PlanetButtons.map((button) => button)}
            </DropdownMenu>

            <IconButton2 label={"View Details"} icon={"fa-solid fa-paper-plane"}
                onClick={() => {if (!planet) {return;} setActiveMenu("PlanetSelection")}}></IconButton2>
        </>
    )
})

