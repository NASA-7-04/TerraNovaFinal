import React, { useState } from 'react';
import { PlanetSelection } from './PlanetSelection';
import {WelcomeWindow} from './Welcome';

export const WhiteFrameOnRight = ({name, description, children}) => {

    return (
        <div style={{
            backgroundColor: "rgba(0,0,0,0)",
            height: "100%",
            width: "100%",
            position: "fixed",
            userSelect: "none",
            pointerEvents: "none", 
        }}>

            <div style={{
                backgroundColor: "rgba(255, 255, 255, 1)",
                color: "rgba(0,0,0,1)",
                height: "100%",
                width: "25%",
                position: "fixed",
                minWidth: "360px",
                maxWidth: "480px",
                padding: "2rem",
                right: "0%",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                pointerEvents: "all", 
            }}>
            {children}
            </div>
        </div>
    )
}

export const MenuContext = React.createContext();

export const Menu1 = () => {
    const [activeMenu, setActiveMenu] = useState("WelcomeWindow");
    const [planet, setPlanet] = useState();

  return (
    <WhiteFrameOnRight>
        <MenuContext.Provider value={{ activeMenu, setActiveMenu, planet, setPlanet}}>
            <WelcomeWindow visible={activeMenu === "WelcomeWindow"}/>
            <PlanetSelection visible={activeMenu === "PlanetSelection"}/>
        </MenuContext.Provider>
    </WhiteFrameOnRight>
  );
}