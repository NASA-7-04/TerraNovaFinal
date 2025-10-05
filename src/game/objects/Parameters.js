// Parameters.js

import { Game, Planets } from "./Objects";

export const SelectedPlanetOnMenu = {
    value : Planets.kepler22b,
    setValue(newValue) {
        this.value = newValue;
    },
    getValue() {
        return this.value;
    }
}

export const SelectedComponentOnGameMenu = {
    value : null,
    setValue(newValue) {
        this.value = newValue;
    },
    getValue() {
        return this.value;
    }
}

export const game = {
    value : null,
    start() {
        this.value = new Game(SelectedPlanetOnMenu.value);
    }
}
