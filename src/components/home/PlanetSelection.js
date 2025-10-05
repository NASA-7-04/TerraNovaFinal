import React from "react";
import { IconButton2, IconButton3 } from "../ui/Buttons";
import { MenuContext } from "./WhiteFrameOnRight";
import { SelectedPlanetOnMenu } from "../../game/objects/Parameters";
import { loadScreen2 } from "../../scenes/Screen2";

export const PlanetSelection = ({ visible },) => {
    const { setActiveMenu } = React.useContext(MenuContext);
    
    const planetObject = SelectedPlanetOnMenu.getValue();

    if (!visible || !planetObject) {
        return null;
    }

    const name = planetObject.name || "Unknown";
    const description = planetObject.description || "No description available.";
    const difficulty = planetObject.difficulty || "N/A";
    const distFromEarth = planetObject.distFromEarth + " light years" || "N/A";
    const surfaceGravity = planetObject.surfaceGravity || "N/A";
    const temperatureData = planetObject.temperatureData || {min : "N/A", max : "N/A"};
    const star = planetObject.star || "N/A";

    return (
        <>
            <IconButton3 label={"Back"} icon={"fa-solid fa-arrow-left"} onClick={() => {setActiveMenu("WelcomeWindow")}}></IconButton3>
            <div>
                <h1 style={{}}>{name || "Unknown"}</h1>
            </div>

            <p>{description || "No description available."}</p>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
                color: "gray",
            }}>
                <a>● Distance From Earth : {distFromEarth}</a>
                <a>● Difficulty : {difficulty}</a>
                <a>● Surface Gravity : {surfaceGravity}</a>
                <a>● Temperature : {temperatureData.min} - {temperatureData.max} ºC</a>
                <a>● Star : {star}</a>
            </div><IconButton2 label={"Choose Destination"} icon={"fa-solid fa-paper-plane"} onClick={() => { loadScreen2(); }}></IconButton2>
        </>
    )
}


