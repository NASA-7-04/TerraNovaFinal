// Objects.js
import { SceneManager } from "../SceneManager";
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { currentCamera, GameObject } from "./ObjectClasses";
import { forceRender } from "../../App";
import { gameResultFrame } from "../../components/scene2/GameResultFrame";
import { gameEventFrame } from "../../components/scene2/GameEventFrame";

export class Planet {
  constructor(data = {}) {
    this.id = data.id || "unknown";

    this.name = data.name || "Unknown Planet";
    this.description = data.description || "No description available.";

    this.difficulty = data.difficulty || 1;
    this.distFromEarth = data.distFromEarth || null;
    this.surfaceGravity = data.surfaceGravity || null;
    this.temperatureData = data.temperatureData || null;
    this.star = data.star || null;

    this.modifiers = {
      metabolism: data.modifiers?.metabolism || 1.0,
      solar: data.modifiers?.solar || 1.0,
      hvac: data.modifiers?.hvac || 1.0,
      water_eff: data.modifiers?.water_eff || 1.0,
      shield_need: data.modifiers?.shield_need || 0.0
    };
    this.start_adjustments = {
      O2: data.start_adjustments?.O2 || 0,
      H2O: data.start_adjustments?.H2O || 0,
      Food: data.start_adjustments?.Food || 0,
      Power: data.start_adjustments?.Power || 0
    };
    this.events = data.events || [];
    this.polarCoordinates = data.polarCoordinates || { ra: 0, dec: 0 };

    this.renderPlanet = data.renderPlanet || null;
    this.renderedPlanetObject = null;


    return this;
  }

  getEventForDay(day) {
    return this.events.find(event => event.day === day);
  }

  calculateHabitatPower(hasThermX = false) {
    const habitatBase = 2;
    const hvacBase = 2;
    const thermxMultiplier = hasThermX ? 0.8 : 1.0;
    
    return habitatBase + (hvacBase * this.modifiers.hvac * thermxMultiplier);
  }

  calculateSolarPower() {
    return 6 * this.modifiers.solar;
  }

  renderPlanetOnMap() {
    const Object = this.renderPlanet();
    const Camera = currentCamera;
    Object.onMouseClick.connect(() => {
        Camera.tweenToTargetObject(Object);
    });
    this.renderedPlanetObject = Object;
    return Object;
  }
}

export class City {
  constructor(data = {}) {
    this.name = data.name || "New Settlement";
    this.population = data.population || 0;
    this.type = data.type || "colony";
    this.Buildings = {};
    this.Crews = {};
  }
}

export class Building {
  constructor(data = {}) {
    this.id = data.id || "unknown_building";
    this.name = data.name || "Unknown Structure";
    this.cost = data.cost || 0;
    this.dailyEffects = data.dailyEffects || {};
    this.capacity = data.capacity || {};
    this.startBonus = data.startBonus || {};
    this.useCosts = data.useCosts || {};
    this.charges = data.charges || null;
    this.notes = data.notes || "";
  }

  getDailyEffects(crewCount = 1, planet = null) {
    const effects = { ...this.dailyEffects };
    
    Object.keys(effects).forEach(resource => {
      const effect = effects[resource];
      if (typeof effect === 'string' && effect.includes('_per_crew')) {
        const baseValue = parseFloat(effect.replace('_per_crew', ''));
        effects[resource] = baseValue * crewCount;
      } else if (typeof effect === 'string' && effect.includes('_team')) {
        const baseValue = parseFloat(effect.replace('_team', ''));
        effects[resource] = baseValue;
      }
    });

    return effects;
  }

  getStartBonus(planet = null) {
    const bonus = { ...this.startBonus };
    
    if (planet && this.id === 'water_tank') {
      bonus.H2O = 200 * planet.modifiers.water_eff;
    }
    
    return bonus;
  }
}

export class Crew {
  constructor(data = {}) {
    this.id = data.id || "crew_member";
    this.name = data.name || "Crew Member";
    this.role = data.role || "generalist";
    this.health = data.health || 100;
    this.morale = data.morale || 100;
  }

  getDailyMetabolism(planet = null) {
    const metabolism = planet ? planet.modifiers.metabolism : 1.0;
    
    return {
      O2: -0.84 * metabolism,
      H2O: -3.0 * metabolism,
      Food: -0.6 * metabolism,
      Power: -1.0 * metabolism,
      Health: -2,
      Morale: -2
    };
  }

  static calculateCrewCost(crewCount) {
    if (crewCount <= 3) {
      return crewCount * 4;
    } else {
      return (3 * 4) + ((crewCount - 3) * 6);
    }
  }
}

export class GameRules {
  constructor() {
    this.units = {
      O2: "kg",
      H2O: "L", 
      Food: "kg",
      Power: "kWh",
      Health: "0-100 per crew",
      Morale: "0-100 team"
    };

    this.baseStocks = {
      O2: 15,
      H2O: 60,
      Food: 12,
      Power: 80,
      Health: 100,
      Morale: 100
    };

    this.dailyUpdateOrder = [
      "apply_event_choice_effects",
      "apply_module_daily_effects",
      "apply_crew_metabolism (× planet.metabolism)",
      "apply_habitat_hvac_power (habitat_base + hvac)",
      "clamp_resources_to_zero_and_check_fail",
      "update_health_morale_and_check_fail"
    ];
  }

  calculateStartResources(crewCount) {
    const crewScale = crewCount / 3;
    return {
      O2: this.baseStocks.O2 * crewScale,
      H2O: this.baseStocks.H2O * crewScale,
      Food: this.baseStocks.Food * crewScale,
      Power: this.baseStocks.Power * crewScale,
      Health: 100,
      Morale: 100
    };
  }
  calculateDailyMetabolism(crewCount, planet = null) {
    const metabolism = planet ? planet.modifiers.metabolism : 1.0;
    return {
      O2: -0.84 * crewCount * metabolism, 
      H2O: -3.0 * crewCount * metabolism,
      Food: -0.6 * crewCount * metabolism,
      Power: -1.0 * crewCount * metabolism,
      Health: 0,
      Morale: 0,
    };
  } 

  checkFailureConditions(resources) {
    return resources.O2 <= 0 || resources.H2O <= 0 || 
           resources.Food <= 0 || resources.Health <= 0;
  }

  checkSuccessConditions(resources) {
    return resources.Health > 0 && resources.O2 > 0 && 
           resources.H2O > 0 && resources.Food > 0;
  }
}

export class GameEvent {
  constructor(data = {}) {
    this.day = data.day || 1;
    this.title = data.title || "Unknown Event";
    this.effect = data.effect || "";
    this.choices = data.choices || [];
    this.branch = data.branch || null;
  }

  getAvailableChoices(gameState = {}) {
    if (this.branch) {
      if (this.branch.if_sensor_fixed && gameState.sensor_fixed) {
        return this.branch.if_sensor_fixed;
      } else if (this.branch.if_sensor_failed && !gameState.sensor_fixed) {
        return this.branch.if_sensor_failed;
      }
    }
    return this.choices;
  }

  render() {
    gameEventFrame.render(this);
    forceRender();
  }

  choose(index) {
    if (index < 0 || index >= this.choices.length) return;
    const choice = this.choices[index];
    if (choice.effect) {
      choice.effect();
    }
    gameEventFrame.setVisibility(false);
    forceRender();
  }
}

export class ResourceManager {
  constructor(initialResources = {}) {
    this.resources = { ...initialResources };
    this.dailyPowerProduced = [];
    this.dailyPowerConsumed = [];
  }

  applyChanges(changes) {
    Object.keys(changes).forEach(resource => {
      if (this.resources.hasOwnProperty(resource)) {
        this.resources[resource] += changes[resource];
        this.resources[resource] = Math.round(this.resources[resource] * 100) / 100;
      }
    });
  }

  clampAndCheck() {
    const failures = [];
    
    Object.keys(this.resources).forEach(resource => {
      if (this.resources[resource] < 0) {
        this.resources[resource] = 0;
        if (['O2', 'H2O', 'Food', 'Health'].includes(resource)) {
          failures.push(resource);
        }
      }
    });

    return failures;
  }

  getAggregateResources() {
    return this.resources.O2 + this.resources.H2O + 
           this.resources.Food + this.resources.Power;
  }

  getPowerBalance() {
    const produced = this.dailyPowerProduced.reduce((sum, val) => sum + val, 0);
    const consumed = this.dailyPowerConsumed.reduce((sum, val) => sum + val, 0);
    return produced - consumed;
  }
}

export class ScoringSystem {
  constructor(initialResources = {}) {
    this.initialResources = { ...initialResources };
  }

  calculateSurvivalScore(finalResources) {
    const healthScore = Math.max(0, Math.min(100, finalResources.Health));
    const moraleScore = Math.max(0, Math.min(100, finalResources.Morale));
    const resourceEfficiency = this.calculateResourceEfficiency(finalResources);
    
    return Math.round(healthScore + moraleScore + (50 * resourceEfficiency));
  }

  calculateResourceEfficiency(finalResources) {
    const initialTotal = this.getAggregateResources(this.initialResources);
    const finalTotal = finalResources.O2 + finalResources.H2O + 
                      finalResources.Food + finalResources.Power;
    
    return initialTotal > 0 ? finalTotal / initialTotal : 0;
  }

  getVerdict(survivalScore, powerBalance, success) {
    if (survivalScore >= 200 && powerBalance >= 0) {
      return "Excellent";
    } else if (success) {
      return "Survived";
    } else {
      return "Failed";
    }
  }

  getAggregateResources(resources) {
    return resources.O2 + resources.H2O + resources.Food + resources.Power;
  }
}

export class Component {
  constructor(data = {}) {
    this.id = data.id || "unknown_component";
    this.name = data.name || "Unknown Component";
    this.cost = data.cost || 0;
    this.dailyEffects = data.dailyEffects || {};
    this.capacity = data.capacity || {};
    this.startBonus = data.startBonus || {};
    this.useCosts = data.useCosts || {};
    this.charges = data.charges || null;
    this.notes = data.notes || "";

    this.model = data.model || null;
    this.size = data.size || {x:1, y:1, z:1};
    this.position = data.position || new BABYLON.Vector3(0,0,0);
    this.rotation = data.rotation || new BABYLON.Vector3(0,0,0);

    this.renderedModel = null;

    return this;
  }
  getDailyEffects(crewCount = 1, planet = null) {
    const effects = { ...this.dailyEffects };
    Object.keys(effects).forEach(resource => {
      const effect = effects[resource];
      if (typeof effect === "function") {
        effects[resource] = effect(planet);
      }else if (typeof effect === 'string' && effect.includes('_per_crew')) {
        const baseValue = parseFloat(effect.replace('_per_crew', ''));
        effects[resource] = baseValue * crewCount;
      } else if (typeof effect === 'string' && effect.includes('_team')) {
        const baseValue = parseFloat(effect.replace('_team', ''));
        effects[resource] = baseValue;
      } 

    });
    return effects;
  }
  getStartBonus(planet = null) {
    const bonus = { ...this.startBonus };
    if (planet && this.id === 'water_tank') {
      bonus.H2O = 200 * planet.modifiers.water_eff;
    }

    return bonus;
  }
  render() {
    if (!this.model) return null;
    this.renderedModel = new GameObject(this.id,{
      meshId : this.model,
      position : this.position,
      rotation : this.rotation,
    });
    return this.renderedModel;
  }

}

export const GAME_METADATA = {
  version: "1.0",
  game: {
    title: "TerraNova",
    days: 5,
    points_budget: 100
  }
};

export const PRODUCTION_BASELINES = {
  Solar_per_array_kwh_per_day: function(planet) { return 6 * planet.modifiers.solar; },
  NGen_kwh_per_day: 15,
  LSS_Bio: { O2: 1.0, H2O: 2.0, Power: -5 },
  Greenhouse_small: { Food: 0.5, O2: 0.2, H2O: -1, Power: -3 }
};

export const PlanetData = {
  kepler22b: {
    id: "kepler22b",
    name: "Kepler-22b",
    description: `
  Kepler-22b is a vast ocean planet orbiting a sun-like star. With roughly twice Earth’s gravity and likely global seas, 
  it’s an inviting but challenging destination for first missions. Weather can shift quickly, and salt-laden winds test 
  solar power and habitat integrity. 
  You’ll need to manage increased metabolic demands from higher gravity, secure reliable water recycling, and keep power 
  stable despite unpredictable weather. Low radiation makes it safer than most worlds, but storms can still cripple energy
  production if you’re unprepared.`,

    difficulty: 1,
    distFromEarth: 620,
    surfaceGravity: 2.06,
    temperatureData: { min: -23, max: -6 },
    star: "Sun-like G-type",

    events : Events.kepler22b,

    modifiers: { metabolism: 1.15, solar: 1.0, hvac: 1.0, water_eff: 1.2, shield_need: 0.0 },
    start_adjustments: { O2: 0, H2O: 0, Food: 0, Power: 0 },
    polarCoordinates: {"ra":285.679421, "dec":47.898941},
    renderPlanet: () => {
        return new GameObject("Kepler_22b",{
            meshId : "./game/assets/models/Kepler_22b.glb",
            position : new BABYLON.Vector3(100,100,100),
        });
    },
  },
  trappist1e: {
    id: "trappist1e", 
    name: "TRAPPIST-1e",
    

    description: `
TRAPPIST-1e orbits deep within a system of seven rocky worlds. Its small red sun flares often, 
bathing the planet in bursts of radiation and sometimes dimming solar power for days. Gravity 
is slightly lighter than Earth’s, making movement easier but survival tricky.
Reliable shielding and backup power are essential. Solar output fluctuates unpredictably, and 
frequent stellar flares can threaten crew health if you’re unprepared.`,

    difficulty: 2,
    distFromEarth: 39,
    surfaceGravity: 0.82,
    temperatureData: { min: -27, max: -23},
    star: "Cold but close star M-type",

    events : Events.trappist1e,

    modifiers: { metabolism: 0.9, solar: 0.6, hvac: 1.2, water_eff: 1.0, shield_need: 0.1 },
    start_adjustments: { O2: 0, H2O: 0, Food: 0, Power: 0 },
    polarCoordinates: {"ra":346.625000, "dec":-5.041000},
    renderPlanet: () => {
      return new GameObject("Trappist1E",{
              meshId : "./game/assets/models/Trappist_1e.glb",
              position : new BABYLON.Vector3(1,201,-255),
          });
       
    },
  },
  kepler452b: {
    id: "kepler452b",
    name: "Kepler-452b", 

    modifiers: { metabolism: 1.05, solar: 1.1, hvac: 1.1, water_eff: 1.0, shield_need: 0.0 },
    start_adjustments: { O2: 0, H2O: 0, Food: 0, Power: 0 },
    polarCoordinates: {"ra":285.681718, "dec":44.373902},

    events : Events.kepler452b,

    renderPlanet: () => {
      return new GameObject("Kepler_452b",{
              meshId : "./game/assets/models/Kepler_452b.glb",
              position : new BABYLON.Vector3(118,201,-0),
          });
    },
  },
  proximab: {
    id: "proximab",
    name: "Proxima Centauri b",

    modifiers: { metabolism: 1.0, solar: 0.5, hvac: 1.4, water_eff: 1.0, shield_need: 0.2 },
    start_adjustments: { O2: 2, H2O: 0, Food: 0, Power: -10 },
    polarCoordinates: {"ra":217.429200, "dec":-62.679500},
    events : Events.proximab,

    renderPlanet: () => {
      return new GameObject("Proxima_centauri_b",{
              meshId : "./game/assets/models/Proxima_centauri_b.glb",
              position : new BABYLON.Vector3(-30,189-403),
          });
    },
  },


  "55cancrie": {
    id: "55cancrie",
    name: "55 Cancri e",
    description: "",

    modifiers: { metabolism: 1.15, solar: 2.0, hvac: 2.0, water_eff: 0.7, shield_need: 0.3 },
    start_adjustments: { O2: 5, H2O: 40, Food: 0, Power: 20 },
    polarCoordinates: {"ra":133.151000, "dec":28.330000},


    events : Events["55cancrie"],

    renderPlanet: () => {
       return new GameObject("Planet55CancriE",{
                meshId : "./game/assets/models/55_cancri_e.glb",
                position : new BABYLON.Vector3(103,-391,102),
            });
    },
  }
};

export const Planets = {
  kepler22b: new Planet(PlanetData.kepler22b),
  trappist1e: new Planet(PlanetData.trappist1e),
  kepler452b: new Planet(PlanetData.kepler452b),
  proximab: new Planet(PlanetData.proximab),
  "55cancrie": new Planet(PlanetData["55cancrie"])
}

export const COMPONENT_DATA = {
  hab_dome: {
    id: "hab_dome",
    name: "Habitat Dome (required)",
    cost: 20,
    capacity: { crew: 4 },
    dailyEffects: { Power: -2 },
    notes: "Pressurization/ventilation baseline. HVAC separate.",
    size: {x : 2, y: 2, z: 2},
    model : "./game/assets/models/house1.glb",
  },
  therm_x: {
    id: "therm_x", 
    name: "Therm-X (Thermal Control)",
    cost: 8,
    dailyEffects: { Power: "- hvac_base * planet.hvac * 0.8" },
    notes: "Reduces HVAC energy ~20%."
  },
  lss_bio: {
    id: "lss_bio",
    name: "LSS-Bio", 
    cost: 15,
    dailyEffects: { O2: 1.0, H2O: 2.0, Power: -5 }
  },
  water_tank: {
    id: "water_tank",
    name: "Water Tank (200 L)",
    cost: 7,
    dailyEffects: { Power: -0.5 },
    startBonus: { H2O: "200 * planet.water_eff" },
    notes: "Also usable as radiation shielding mass.",
    size: {x : 2, y: 2, z: 2},
    model : "./game/assets/models/WaterTank.glb",
  },
  shield_reg: {
    id: "shield_reg",
    name: "Shield-Reg",
    cost: 12,
    dailyEffects: { Power: -2 },
    notes: "Planet radiation requirement varies.",
    size: {x : 1, y:1, z: 1},
    model : "./game/assets/models/EVALock.glb",
  },
  battery: {
    id: "battery",
    name: "Battery Pack (50 kWh)",
    cost: 6,
    startBonus: { Power: 50 },
    size: {x : 1, y: 1, z: 1},
    model : "./game/assets/models/Electricity.glb",
  },
  
  solar_array: {
    id: "solar_array",
    name: "Solar Array (~20 m²)",
    cost: 8,
    dailyEffects: { Power: function(planet) { return 6 * planet.modifiers.solar; } },
    size: {x : 1, y: 1, z: 1},
    model : "./game/assets/models/SolarPanel.glb",
  },
  n_gen: {
    id: "n_gen",
    name: "N-Gen (RTG/Nuclear equiv.)",
    cost: 22,
    dailyEffects: { Power: 15 },
    size: {x : 1, y:1, z: 1},
    model : "./game/assets/models/Ngen.glb",
  },
  
  airlock: {
    id: "airlock",
    name: "EVA Airlock",
    cost: 6,
    dailyEffects: { Power: -0.5 },
    useCosts: { EVA_cycle: { Power: -2 } },
    size: {x : 1, y:1, z: 1},
    model : "./game/assets/models/EVALock.glb",
  },
  workshop: {
    id: "workshop",
    name: "Workshop",
    cost: 8,
    dailyEffects: { Power: -2 }
  },
  spares: {
    id: "spares",
    name: "Spares Pack",
    cost: 4,
    charges: 3,
    notes: "Allows 3 repairs.",
    size: {x : 1, y:1, z: 1},
    model : "./game/assets/models/TreasureBox.glb",
  },
  
  agri_pod: {
    id: "agri_pod",
    name: "Agri-Pod (Small Greenhouse)",
    cost: 12,
    dailyEffects: { Food: 0.5, O2: 10, H2O: -1, Power: -3 },
    size: {x : 2, y:2, z: 2},
    model : "./game/assets/models/PlantingMachine.glb",
  },
  
  quarters: {
    id: "quarters",
    name: "Private Quarters",
    cost: 5,
    dailyEffects: { Power: -1, Morale: "+2_per_crew" },
    size: {x : 8, y:8, z: 8},
    model : "./game/assets/models/LargeHouse.glb",
  },
  bathroom: {
    id: "bathroom",
    name: "Bathroom / Hygiene",
    cost: 6,
    dailyEffects: { Power: -1, H2O: "-2_per_crew", Health: "+3_per_crew" },
    size: {x : 8, y:8, z: 8},
    model : "./game/assets/models/ContainerBox.glb",
  },
  community: {
    id: "community",
    name: "Community / Mess",
    cost: 8,
    dailyEffects: { Power: -2, H2O: "-1_per_crew", Food: "-0.1_per_crew", Morale: "+5_team" },
    size: {x : 8, y:8, z: 8},
    model : "./game/assets/models/LargeHouse.glb",
  },
  exercise: {
    id: "exercise",
    name: "Exercise Area",
    cost: 6,
    dailyEffects: { Power: -1, Food: "+0.1_per_crew", Health: "+3_per_crew", Morale: "+2_per_crew" },
    size: {x : 8, y:8, z: 8},
    model : "./game/assets/models/LargeHouse.glb",
  },
  medbay: {
    id: "medbay",
    name: "Medical Bay",
    cost: 10,
    dailyEffects: { Power: -2 },
    onUse: { Power: -5, Health: "+10_target" }
  },
  comms: {
    id: "comms",
    name: "Communication Hub",
    cost: 5,
    dailyEffects: { Power: -1, Morale: "+4_team" }
  },
  window: {
    id: "window",
    name: "Observation Window",
    cost: 3,
    dailyEffects: { Power: -0.5, Morale: "+2_team" }
  },
  green_relax: {
    id: "green_relax",
    name: "Greenhouse Relax Zone",
    cost: 10,
    dailyEffects: { Power: -3, H2O: -1, O2: 0.1, Morale: "+5_team" }
  }
};

export const Components = {
  hab_dome: new Component(COMPONENT_DATA.hab_dome),
  therm_x: new Component(COMPONENT_DATA.therm_x),
  lss_bio: new Component(COMPONENT_DATA.lss_bio),
  water_tank: new Component(COMPONENT_DATA.water_tank),
  shield_reg: new Component(COMPONENT_DATA.shield_reg),
  battery: new Component(COMPONENT_DATA.battery),
  solar_array: new Component(COMPONENT_DATA.solar_array),
  n_gen: new Component(COMPONENT_DATA.n_gen),
  airlock: new Component(COMPONENT_DATA.airlock),
  workshop: new Component(COMPONENT_DATA.workshop),
  spares: new Component(COMPONENT_DATA.spares),
  agri_pod: new Component(COMPONENT_DATA.agri_pod),
  quarters: new Component(COMPONENT_DATA.quarters),
  bathroom: new Component(COMPONENT_DATA.bathroom),
  community: new Component(COMPONENT_DATA.community),
  exercise: new Component(COMPONENT_DATA.exercise),
  medbay: new Component(COMPONENT_DATA.medbay),
  comms: new Component(COMPONENT_DATA.comms),
  window: new Component(COMPONENT_DATA.window),
  green_relax: new Component(COMPONENT_DATA.green_relax)
};


export const createPlanet = (planetId) => {
  const data = PlanetData[planetId];
  return data ? new Planet(data) : null;
};

export const createComponent = (componentId) => {
  const data = COMPONENT_DATA[componentId];
  return data ? new Component(data) : null;
};

export const getAllPlanets = () => {
  return Object.keys(PlanetData).map(id => createPlanet(id));
};

export const getAllComponents = () => {
  return Object.keys(COMPONENT_DATA).map(id => createComponent(id));
};

export const START_BONUSES = {
  water_tank: { H2O: "200 * planet.water_eff" },
  battery: { Power: 50 },
  lss_bio: { O2: 5, H2O: 10 },
  agri_pod: { Food: 2 },
  n_gen: { Power: 20 },
  solar_array: { Power: "10 * planet.solar" }
};

export const EVENT_DATA = {
  kepler22b: [
    { day: 1, title: "Oceanic Winds", effect: "Solar -10% today",
      choices: [
        { id: "A", text: "Reinforce habitat exterior", delta: { Power: -6 } },
        { id: "B", text: "Ignore and hope it calms", delta: { Health: -5 } }
      ]
    },
    { day: 2, title: "Water System Leak",
      choices: [
        { id: "A", text: "Repair with spares", delta: { Power: -5, Health: -2 }, flags: { stop_leak: true } },
        { id: "B", text: "Delay repair", delta: { H2O: -20, Health: -5 } }
      ]
    },
    { day: 3, title: "Science Mission: Ocean Probe",
      choices: [
        { id: "A", text: "Launch probe", delta: { Power: -8, O2: 5, Morale: 10 } },
        { id: "B", text: "Skip mission", delta: { Morale: -5 } }
      ]
    },
    { day: 4, title: "Solar Array Dusting", effect: "Solar -20% today",
      choices: [
        { id: "A", text: "EVA clean panels", delta: { Power: -6, Health: -3 } },
        { id: "B", text: "Do nothing", delta: { Power: -6 } }
      ]
    },
    { day: 5, title: "Night Storm", effect: "Solar halved",
      choices: [
        { id: "A", text: "Emergency shutdown", delta: { Power: 5, Morale: -5 } },
        { id: "B", text: "Burn backup cells", delta: { Power: -15 } }
      ]
    }
  ],
  trappist1e: [
    { day: 1, title: "Minor Stellar Flare",
      choices: [
        { id: "A", text: "Stay inside & power shielding", delta: { Power: -8 } },
        { id: "B", text: "Ignore", delta: { Health: -5 } }
      ]
    },
    { day: 2, title: "Weak Sunlight", effect: "Solar -40% today",
      choices: [
        { id: "A", text: "Conserve power", delta: { Power: 5, Morale: -3, Health: -1 } },
        { id: "B", text: "Use backup battery", delta: { Power: -8 } }
      ]
    },
    { day: 3, title: "Sensor Malfunction",
      choices: [
        { id: "A", text: "EVA repair", delta: { Power: -5, Health: -3 }, flags: { sensor_fixed: true } },
        { id: "B", text: "Skip repair", delta: {}, flags: { sensor_fixed: false } }
      ]
    },
    { day: 4, title: "Major Stellar Flare",
      branch: {
        if_sensor_fixed: [
          { id: "A", text: "Full lockdown", delta: { Power: -10 } },
          { id: "B", text: "Stay active for lab", delta: { Health: -10, O2: 5, Food: 5 } }
        ],
        if_sensor_failed: [
          { id: "AUTO", text: "Surprised by flare", delta: { Health: -8, Power: -5 } }
        ]
      }
    },
    { day: 5, title: "Psychological Strain",
      choices: [
        { id: "A", text: "Host morale activity", delta: { Power: -5, Food: -5, Health: 10, Morale: 10 } },
        { id: "B", text: "Push through", delta: { Health: -7, Morale: -5 } }
      ]
    }
  ],
  kepler452b: [
    { day: 1, title: "Heavy Landing Shock",
      choices: [
        { id: "A", text: "Inspect & reinforce seals", delta: { Power: -5, Health: -2 }, flags: { leak_prevented: true } },
        { id: "B", text: "Ignore warning", delta: { O2_next_day: -5, Health: -2 } }
      ]
    },
    { day: 2, title: "Increased Metabolic Demand",
      choices: [
        { id: "A", text: "Push rations & exercise", delta: { Food: -6, O2: -6, Health: 5 } },
        { id: "B", text: "Calorie restriction", delta: { Food: -3, Health: -6, Morale: -4 } }
      ]
    },
    { day: 3, title: "Minor Meteor Shower",
      choices: [
        { id: "A", text: "EVA quick patch", delta: { Power: -5, Health: -3 } },
        { id: "B", text: "Delay repairs", delta: { O2_per_day: -2, Health_per_day: -3 } }
      ]
    },
    { day: 4, title: "Research Opportunity",
      choices: [
        { id: "A", text: "Set up small greenhouse", delta: { Power: -6, H2O: -5, Food_end_bonus: 10, Morale: 5 } },
        { id: "B", text: "Stay focused on survival", delta: {} }
      ]
    },
    { day: 5, title: "Long Cold Night", effect: "Solar -50% today",
      choices: [
        { id: "A", text: "Use backup battery", delta: { Power: -12 } },
        { id: "B", text: "Low-power survival mode", delta: { Power: 5, Health: -8, Morale: -5 } }
      ]
    }
  ],
  proximab: [
    { day: 1, title: "Sudden Stellar Flare",
      choices: [
        { id: "A", text: "Activate emergency shielding", delta: { Power: -10 } },
        { id: "B", text: "Ride it out", delta: { Health: -8 } }
      ]
    },
    { day: 2, title: "Solar Interference", effect: "Solar -50% today",
      choices: [
        { id: "A", text: "Power ration", delta: { Power: 5, Health: -3, Morale: -3 } },
        { id: "B", text: "Use RTG/batteries", delta: { Power: -10 } }
      ]
    },
    { day: 3, title: "Life Support Failure",
      choices: [
        { id: "A", text: "EVA repair", delta: { Power: -6, Health: -3 } },
        { id: "B", text: "Ignore warning", delta: { O2_next_day: -10, Health: -5 } }
      ]
    },
    { day: 4, title: "Major Flare Storm",
      choices: [
        { id: "A", text: "Deep shelter lockdown", delta: { Power: -15 } },
        { id: "B", text: "Stay semi-active", delta: { Power: -5, Health: -6, Food: 5 } }
      ]
    },
    { day: 5, title: "Communications Blackout",
      choices: [
        { id: "A", text: "Run emergency comm beacon", delta: { Power: -6, Health: 5, Morale: 5 } },
        { id: "B", text: "Wait it out", delta: { Health: -5, Morale: -5 } }
      ]
    }
  ],
  "55cancrie": [
    { day: 1, title: "Lava Vent Eruption",
      choices: [
        { id: "A", text: "Emergency cooling boost", delta: { Power: -15 } },
        { id: "B", text: "Seal and retreat", delta: { Health: -8 } }
      ]
    },
    { day: 2, title: "Volcanic Glass Storm", effect: "Solar -60% today",
      choices: [
        { id: "A", text: "EVA clean & patch sensors", delta: { Power: -8, Health: -5 } },
        { id: "B", text: "Stay sheltered", delta: { Power: -10 } }
      ]
    },
    { day: 3, title: "Toxic Gas Intrusion",
      choices: [
        { id: "A", text: "Flush air & scrub", delta: { Power: -10, O2: -10 } },
        { id: "B", text: "Ignore leak", delta: { Health: -10 } }
      ]
    },
    { day: 4, title: "Reactor Instability",
      choices: [
        { id: "A", text: "Divert coolant", delta: { Power: -8 } },
        { id: "B", text: "Push reactor harder", delta: { Power: 10, risk: { prob: 0.25, onFail: { Power: -20, Health: -10 } } } }
      ]
    },
    { day: 5, title: "Mega Thermal Surge",
      choices: [
        { id: "A", text: "Full lockdown & deep cooling", delta: { Power: -20 } },
        { id: "B", text: "Abandon part of the outpost", delta: { Power: -5, Morale: -5, sacrifice_module: true } }
      ]
    }
  ]
};

export const Events = {
  kepler22b: EVENT_DATA.kepler22b.map(e => new Event(e)),
  trappist1e: EVENT_DATA.trappist1e.map(e => new Event(e)),
  kepler452b: EVENT_DATA.kepler452b.map(e => new Event(e)),
  proximab: EVENT_DATA.proximab.map(e => new Event(e)),
  "55cancrie": EVENT_DATA["55cancrie"].map(e => new Event(e))
}

export const ENDING_MESSAGES = {
  success_generic: "You endured the mission. Systems held; the crew survived.",
  failure_generic: "The outpost failed. Resources dwindled and systems collapsed.",
  by_cause: {
    O2: "The final breath was taken — oxygen reserves ran out.",
    H2O: "Dehydration overcame the crew — water was exhausted.",
    Food: "Starvation halted all activity — rations were gone.",
    Power: "With no power left to run life support, the habitat went dark.",
    Health: "Critical injuries and stress pushed the crew beyond survival.",
    Morale: "Isolation broke the crew's spirit — operations ceased."
  },
  planet_flavor: {
    kepler22b: {
      success: "You endured Kepler-22b's alien seas and unpredictable winds. A calm blue horizon stretches ahead.",
      failure: "The ocean world claimed your fragile outpost. Endless storms silenced your crew."
    },
    trappist1e: {
      success: "You outlasted TRAPPIST-1e's flares and dim skies. The dome lights glow with quiet resilience.",
      failure: "Relentless stellar flares crippled life support and broke morale."
    },
    kepler452b: {
      success: "On Kepler-452b you mastered gravity and cold nights. Growth is now possible.",
      failure: "Micro-fractures and shortages cascaded into failure beneath a heavier sky."
    },
    proximab: {
      success: "Against Proxima's fury you found shelter and discipline — your team made it.",
      failure: "Flares and darkness overwhelmed the base before help could arrive."
    },
    "55cancrie": {
      success: "Amid searing heat and glass storms, your systems held. A miracle of engineering.",
      failure: "The lava world's thermal onslaught consumed the outpost."
    }
  }
};

export const getPlanetEvents = (planetId) => {
  return EVENT_DATA[planetId] || [];
};

export const createPlanetWithEvents = (planetId) => {
  const planet = createPlanet(planetId);
  if (planet) {
    planet.events = getPlanetEvents(planetId);
  }
  return planet;
};


export class Game {
  constructor(planet,) {
    this.planet = planet;
    this.city = new City();
    this.components = [];
    this.crews = [];
    this.resources = new ResourceManager(new GameRules().calculateStartResources(3));
    this.day = 1;
    this.gameState = {};
    this.previewer = null;
    this.resources.applyChanges(this.planet.start_adjustments);
    this.resources.clampAndCheck();
    this.gameResult = null;
    this.timeConnection = this.connect();

    return this;
  }
  
  addComponent(component) {
    if (component) {
      this.components.push(component);
      const startBonus = component.getStartBonus(this.planet);
      this.resources.applyChanges(startBonus);
      component.render();
    }
  }
  
  addCrew(crew) {
    if (crew) {
      this.crews.push(crew);
      const metabolism = crew.getDailyMetabolism(this.planet);
      this.resources.applyChanges(metabolism);
    }
  }

  async purchaseComponent(component) {
    // Preview component
    this.previewer.beginPreview(component);
    await this.previewer.waitUntilendOfPreview();
    // Place Item
    const newComponent = new Component(component);
    newComponent.position = this.previewer.itemPosition;
    newComponent.rotation = this.previewer.itemRotation;
    
    this.addComponent(newComponent);
  }


  nextDay() {
    this.day += 1;
    const rules = new GameRules();
    const crewCount = this.crews.length;
    
    this.components.forEach(component => {
      const dailyEffects = component.getDailyEffects(crewCount, this.planet);
      console.log(dailyEffects);
      this.resources.applyChanges(dailyEffects);
    }
    );
    
    const dailyMetabolism = rules.calculateDailyMetabolism(crewCount, this.planet);
    this.resources.applyChanges(dailyMetabolism);
    const failures = this.resources.clampAndCheck();
    if (failures.length > 0) {
      failures.forEach(resource => {
        if (resource === 'O2' || resource === 'H2O' || resource === 'Food') {
          this.resources.applyChanges({ Health: -10 });
        }
        if (resource === 'Health') {
          this.resources.applyChanges({ Morale: -10 });
        }
      }
      );
    }

    // Check if gameover
    if (this.isGameOver()) {
      this.endGame();
      return;
    }
    
    // Apply event
    const event = this.getCurrentEvent();
    if (event) {
      let choices = event.choices;
      if (event.branch) {
        if (this.gameState.sensor_fixed === false && event.branch.if_sensor_failed) {
          choices = event.branch.if_sensor_failed;
        }
        if (this.gameState.sensor_fixed === true && event.branch.if_sensor_fixed) {
          choices = event.branch.if_sensor_fixed;
        }
      }
      event.choices = choices;
      event.selectedChoice = null;
      event.render();
    }

    // Render React
    forceRender();
  }
  getCurrentEvent() {
    return this.planet.getEventForDay(this.day);
  }
  applyEventChoice(choice) {
    if (choice && choice.delta) {
      this.resources.applyChanges(choice.delta);
      if (choice.flags) {
        Object.assign(this.gameState, choice.flags);
      }
    }
  }
  isGameOver() {
    const rules = new GameRules();
    return rules.checkFailureConditions(this.resources.resources) || this.day > GAME_METADATA.game.days;

  }
  endGame() {
    if (this.timeConnection) {
      this.timeConnection();
      this.timeConnection = null;
    }
    
    this.gameResult = this.getFinalScore();
    gameResultFrame.setVisibility(true);
    gameResultFrame.render();
    
    forceRender();
  }

  getFinalScore() {
    const rules = new GameRules();
    const scoring = new ScoringSystem(new GameRules().calculateStartResources(Object.keys(this.crews).length));
    const survivalScore = scoring.calculateSurvivalScore(this.resources.resources);
    const powerBalance = this.resources.getPowerBalance();
    const success = rules.checkSuccessConditions(this.resources.resources);
    const verdict = scoring.getVerdict(survivalScore, powerBalance, success);
    const message = success ? ENDING_MESSAGES.success_generic : ENDING_MESSAGES.failure_generic;
    let planetFlavor = ENDING_MESSAGES.planet_flavor[this.planet.id];
    planetFlavor = planetFlavor && (success ? planetFlavor.success : planetFlavor.failure);
    return { survivalScore, powerBalance, success, verdict, message, planetFlavor };
  }
  connect() {

    forceRender();
    this.previewer = new ComponentPreviewer();
    this.previewer.connect();

    // While 120 seconds it becomes next day
    const day = setInterval(() => {
      this.nextDay();
    }, 120000);
    return () => clearInterval(day);
  }
}

export class ComponentPreviewer {
  constructor(scene) {
    this.scene = scene || SceneManager.getScene();
    this.itemPosition = new BABYLON.Vector3(0, 0, 0);
    this.itemRotation = new BABYLON.Vector3(0, 0, 0);
    this.previewComponent = null;
  } 
  beginPreview(component) {
    if (this.previewComponent) {
      this.endPreview();
    }
    this.previewComponent = new Component(component).render();
    if (this.previewComponent) {
      this.previewComponent.setInteractive(false);
      this.previewComponent.setTransparency(0.5);
      this.itemRotation = this.previewComponent.orientation.clone();
      console.log(this.previewComponent);
    }
  } 
  onMouseMove() {
    if (this.previewComponent) {
      this.previewComponent.setInteractive(false);
      const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
      if (pickResult.hit) {
        const point = pickResult.pickedPoint;
        this.previewComponent.setPosition(point);
        this.itemPosition = point;
      }
    }
    return;
  }
  endPreview() {
    if (this.previewComponent) {
      this.previewComponent.dispose();
      this.previewComponent = null;
    }
  }

  connect() {
    if (!this.scene) {
      this.scene = SceneManager.getScene();
    }
    this.scene.onPointerMove = () => this.onMouseMove();

    this.scene.onPointerDown = (evt) => {
      if (evt.button === 0 && this.previewComponent) {
        this.endPreview();
      } else if (evt.button === 1 && this.previewComponent) {
        this.itemRotation = this.previewComponent.orientation.add(new BABYLON.Vector3(0, Math.PI / 2, 0));
        this.previewComponent.setOrientation(this.itemRotation);
      }
    }
  }

  waitUntilendOfPreview() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.previewComponent) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
} 