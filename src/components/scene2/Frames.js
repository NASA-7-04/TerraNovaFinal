import React, { useState } from 'react';
import { ComponentPurchaseWindow, ComponentRequirementsWindow, StatusWindow, StatusWindow2 } from './Scene2Windows';

export const WhiteFrameOnRight = ({  children }) => {

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


export const WhiteStatusFrame = ({  children }) => {

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
                width: "15%",
                position: "fixed",
                minWidth: "200px",
                maxWidth: "240px",
                padding: "2rem",
                left: "1vh",
                top: "1vh",
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

export const WhiteStatusFrame2 = ({  children }) => {

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
                width: "10%",
                position: "fixed",
                minWidth: "120px",
                maxWidth: "160px",
                padding: "2rem",
                left: "1vh",
                bottom: "1vh",
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
    const [activeMenu, setActiveMenu] = useState("ComponentRequirementsWindow");
    
    return (
        <>
            <WhiteStatusFrame>
                <StatusWindow visible={true}></StatusWindow>
            </WhiteStatusFrame>
            <WhiteStatusFrame2>
                <StatusWindow2 visible={true}></StatusWindow2>
            </WhiteStatusFrame2>
            <WhiteFrameOnRight>
                <MenuContext.Provider value={{ activeMenu, setActiveMenu }}>
                    <ComponentRequirementsWindow visible={activeMenu === "ComponentRequirementsWindow"}></ComponentRequirementsWindow>
                    <ComponentPurchaseWindow visible={activeMenu === "ComponentPurchaseWindow"}></ComponentPurchaseWindow>
                </MenuContext.Provider>
            </WhiteFrameOnRight>
        </>
    );
}
