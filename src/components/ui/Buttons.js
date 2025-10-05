import React, { forwardRef } from 'react';
import "../../assets/css/stylesheet.css"

export const RadioButton = ({ label, name, value, checked, onChange }) => (
    <label style={{ marginRight: '1rem' }}>
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            style={{
                marginRight: '0.5rem',
                width: "1.5rem",
                height: "1.5rem"
            }}
        />
        {label}
    </label>
);

export const CheckboxButton = ({ label, name, value, checked, onChange }) => (
    <label style={{ marginRight: '1rem' }}>
        <input
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            style={{
                width: "1.5rem",
                height: "1.5rem"
            }}
        />
        {label}
    </label>
);

export const CheckboxButtonWithDescription = ({ label, description, name, value, checked, onChange }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
    }}>
        <CheckboxButton label={label} name={name} value={value} checked={checked} onChange={onChange} />
        <span>{description}</span>
    </div>
);

export const TextButton1 = ({ label, onClick, isSelected}) => {
    return (
    <button style={{
        borderBottom: "0.1rem solid rgba(196, 196, 196, 1)",
        textAlign: "left",
        background: "none",
        backgroundColor: isSelected ? "rgba(61, 61, 61, 1)" : "rgba(0,0,0,0)",
    }}
    onClick={onClick}>
        <a style={{ color: isSelected ? "white" : "black", margin: 0,}}>{label}</a>
    </button>
)
};

export const TextButtonWithDescription = ({ label, description, icon, onClick,}) => {
    return (
    <button style={{
        borderBottom: "0.1rem solid rgba(196, 196, 196, 1)",
        textAlign: "left",
        background: "none",
        backgroundColor:  "rgba(0,0,0,0)",
        display: "flex",
        flexDirection: "row",
    }}
    onClick={onClick}>
        {icon && <i className={icon} style={{ fontSize: "1.5rem",}}></i>}
        <h3 style={{ color:  "black", margin: 0, justifySelf :"flex-start"}}>{label}</h3>
        <span style={{ marginLeft: "1rem",  justifySelf :"flex-end"}}>{description}</span>
    </button>
)
};

export const TextButtonWithDescriptionSmall = ({ label, description, icon, onClick,}) => {
    return (
    <button style={{
        borderBottom: "0.1rem solid rgba(196, 196, 196, 1)",
        textAlign: "left",
        background: "none",
        backgroundColor:  "rgba(0,0,0,0)",
        display: "flex",
        flexDirection: "row",
        padding: "0",
    }}
    onClick={onClick}>
        {icon && <i className={icon} style={{ fontSize: "1.5rem",}}></i>}
        <h3 style={{ color:  "black", margin: 0, justifySelf :"flex-start"}}>{label}</h3>
        <span style={{ marginLeft: "1rem",  justifySelf :"flex-end"}}>{description}</span>
    </button>
)
};

export const IconButton1 = ({ label, icon, onClick}) => {
    return (
    <button className = "IconButton" style={{
        textAlign: "center",
        border: "2px solid rgba(73, 73, 73, 1)",
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        alignItems: "center",
    }}
    onClick={onClick}>
        <img src={icon} style={{ width: "1.5rem", height: "1.5rem"}}/>
        <h3 style={{margin: 0,}}>{label}</h3>
    </button>
)
};

// fas fa-
export const IconButton2 = forwardRef(({ label, icon, onClick}, ref) => {
    return (
    <button className = "IconButton" style={{
        textAlign: "center",
        border: "2px solid rgba(73, 73, 73, 1)",
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        alignItems: "center",
    }}
    onClick={onClick}>
        <i className={icon} style={{ fontSize: "1.5rem",}}></i>
        <h3 style={{ margin: 0,}}>{label}</h3>
    </button>
)
});


export const IconButton3 = forwardRef(({ label, icon, onClick}, ref) => {
    return (
    <button className = "IconButton" style={{
        textAlign: "center",
        border: "none",
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        alignItems: "center",
    }}
    onClick={onClick}>
        <i className={icon} style={{ fontSize: "1.5rem",}}></i>
        <h3 style={{ margin: 0,}}>{label}</h3>
    </button>
)
});