// Scene2Windows.js
import React, { useRef } from "react";
import { MenuContext } from "./Frames";
import { IconButton3 } from "../ui/Buttons";
import { CheckboxButton, CheckboxButtonWithDescription, IconButton1, IconButton2, TextButton1, TextButtonWithDescription, TextButtonWithDescriptionSmall } from "../ui/Buttons";
import { DropdownMenu } from "../ui/MiscellaneousUIElements";
import { game, SelectedComponentOnGameMenu, SelectedPlanetOnMenu } from "../../game/objects/Parameters";
import { Components } from "../../game/objects/Objects";



export const ComponentRequirementsWindow = ({ visible }) => {
    const { setActiveMenu } = React.useContext(MenuContext);

    let ComponentsButton = [];
    for (const component in Components) {
        const componentData = Components[component];
        ComponentsButton.push(<TextButton1 key={componentData.id}
            label={componentData.name} onClick={() => { SelectedComponentOnGameMenu.setValue(componentData) }}></TextButton1>);
    }


    if (!visible) {
        return null;
    }

    return (
        <>
            <div>
                <h1 style={{}}>Needed Components</h1>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
            }}>
                <CheckboxButtonWithDescription
                    description={"Only Show Insufficient Components"}
                />
                <CheckboxButtonWithDescription
                    description={"Sort By Price"}
                />
            </div>


            <DropdownMenu name={"Components"} onChange={(value) => { }}>
                {ComponentsButton.map((button) => button)}
            </DropdownMenu>

            <IconButton2 label={"View Component Details"} icon={"fa-solid fa-paper-plane"}
                onClick={() => { setActiveMenu("ComponentPurchaseWindow") }}></IconButton2>
        </>
    )
}

export const ComponentPurchaseWindow = ({ visible }) => {
    const { setActiveMenu } = React.useContext(MenuContext);
    
    const componentObject = SelectedComponentOnGameMenu.getValue();

    if (!visible || !componentObject) {
        return null;
    }

    const name = componentObject.name || "Unknown";
    const description = componentObject.notes || "No description available.";
    const cost = componentObject.cost || "N/A";

    return (
        <>
            <IconButton3 label={"Back"} icon={"fa-solid fa-arrow-left"} onClick={() => {setActiveMenu("ComponentRequirementsWindow")}}></IconButton3>
            <div style={{}}>
                <h1 style={{}}>{name || "Unknown"}</h1>
            </div>
            
            <p>{description || "No description available."}</p>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
                color: "gray",
            }}>
                <a>● Cost : {cost}</a>
            </div>
            <IconButton2 label={"Purchase"} icon={"fa-solid "} onClick={async () => {
                await game.value.purchaseComponent(componentObject); 
                setActiveMenu("ComponentRequirementsWindow")
             }}></IconButton2>
        </>
    )
}

export const StatusWindow = ({ visible }) => {
    let StatusIndicator = [];
    if (!game.value) return null;
    for (const component in game.value.resources.resources) {
        const componentData = game.value.resources.resources[component];
        StatusIndicator.push(<TextButtonWithDescriptionSmall
            key={componentData.id} label={componentData} description={component}
            onClick={() => { }}></TextButtonWithDescriptionSmall>);
    }
        StatusIndicator.push(<TextButtonWithDescriptionSmall
            key={"Crews"} label={game.value.crews.length} description={"Crews"}
            onClick={() => { }}></TextButtonWithDescriptionSmall>);

    if (!visible) {
        return null;
    }
    return (
        <>
            {StatusIndicator.map((button) => button)}
        </>
    )
}

export const StatusWindow2 = ({ visible }) => {
    let StatusIndicator = [];
    if (!game.value) return null;
    StatusIndicator.push(<TextButtonWithDescriptionSmall
        key={"DAY"} label={"DAY"} description={game.value.day}
        onClick={() => { }}></TextButtonWithDescriptionSmall>);

    if (!visible) {
        return null;
    }
    return (
        <>
            {StatusIndicator.map((button) => button)}
        </>
    )
}