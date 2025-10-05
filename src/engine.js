/******************************************************************
 * Exoplanet Survival — Minimal JS Engine (English-only)
 * - Loads design JSON (game config)
 * - Initializes run with planet/crew/components
 * - Applies modules/crew/planet modifiers daily
 * - Applies events and choices
 * - Computes end verdict & 3 metrics: SurvivalScore, ResourceEfficiency, PowerBalance
 ******************************************************************/

const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
const sum = (a = []) => a.reduce((acc, v) => acc + (v || 0), 0);

// Parses small formula strings like "+2_per_crew", "6 * planet.solar", "- hvac_base * planet.hvac * 0.8"
function parseDelta(value, context) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const perCrew = value.match(/^([+\-]?\d+(\.\d+)?)_per_crew$/);
  if (perCrew) return parseFloat(perCrew[1]) * (context.crewCount || 0);

  if (value.includes("planet.")) {
    const planet = context.planet;
    try {
      const expr = value.replace(/planet\.(\w+)/g, (_, key) => {
        const v = planet?.modifiers?.[key] ?? planet?.[key];
        return typeof v === "number" ? String(v) : "0";
      });
      // eslint-disable-next-line no-new-func
      return Function(`"use strict";return (${expr});`)();
    } catch {
      return 0;
    }
  }

  if (value.includes("hvac_base")) {
    const hvac_base = context.hvacBase ?? 0;
    const planet = context.planet;
    try {
      const expr = value
        .replace(/hvac_base/g, String(hvac_base))
        .replace(/planet\.(\w+)/g, (_, key) => {
          const v = planet?.modifiers?.[key] ?? planet?.[key];
          return typeof v === "number" ? String(v) : "1";
        });
      // eslint-disable-next-line no-new-func
      return Function(`"use strict";return (${expr});`)();
    } catch {
      return 0;
    }
  }

  if (/^\s*\d+(\.\d+)?\s*\*\s*planet\.\w+/.test(value)) {
    const planet = context.planet;
    try {
      const expr = value.replace(/planet\.(\w+)/g, (_, key) => {
        const v = planet?.modifiers?.[key] ?? planet?.[key];
        return typeof v === "number" ? String(v) : "1";
      });
      // eslint-disable-next-line no-new-func
      return Function(`"use strict";return (${expr});`)();
    } catch {
      return 0;
    }
  }

  if (!Number.isNaN(parseFloat(value))) return parseFloat(value);
  return 0;
}

function createEngine(design) {
  const rules = design.rules;
  const DAYS = design.game.days;

  function initializeRun({ planetKey, crewCount, pickedComponents }) {
    const planet = design.planets[planetKey];
    if (!planet) throw new Error(`Unknown planet: ${planetKey}`);

    const crewScale = (crewCount || 3) / 3;
    const base = rules.base_stocks_for_3_crew_5_days;

    const state = {
      day: 1,
      daysTotal: DAYS,
      crew: crewCount,
      planetKey,
      planet,
      O2: base.O2 * crewScale,
      H2O: base.H2O * crewScale,
      Food: base.Food * crewScale,
      Power: base.Power * crewScale,
      Health: 100,
      Morale: 100,
      dailyPowerProduced: [],
      dailyPowerConsumed: [],
      successfulChoices: 0,
      countedChoices: 0,
      ongoing: { O2_per_day: 0, Health_per_day: 0 },
      flags: {},
      modules: pickedComponents.slice()
    };

    const adj = planet.start_adjustments || {};
    state.O2 += adj.O2 || 0;
    state.H2O += adj.H2O || 0;
    state.Food += adj.Food || 0;
    state.Power += adj.Power || 0;

    applyStartBonuses(state, design);
    return state;
  }

  function applyStartBonuses(state, design) {
    for (const compId of state.modules) {
      const comp = findComponentById(design, compId);
      if (!comp) continue;
      const bonuses = comp.start_bonus || design.start_bonuses?.[compId] || comp.startBonus;
      if (!bonuses) continue;
      for (const [k, v] of Object.entries(bonuses)) {
        const val = parseDelta(v, { planet: state.planet });
        if (["O2", "H2O", "Food", "Power"].includes(k)) state[k] += val;
      }
    }
  }

  function findComponentById(design, id) {
    for (const group of Object.values(design.components)) {
      if (!Array.isArray(group)) continue;
      const f = group.find(x => x.id === id);
      if (f) return f;
    }
    return null;
  }

  function dailyTick(state, { eventChoiceId } = {}) {
    const planetMods = state.planet.modifiers || {};
    const metabolismK = planetMods.metabolism ?? 1.0;

    let produced = 0;
    let consumed = 0;

    // 1) Event (apply before metabolism)
    const event = (design.events[state.planetKey] || []).find(e => e.day === state.day);
    if (event) {
      if (event.branch) {
        if (state.flags.sensor_fixed && event.branch.if_sensor_fixed) {
          const selected = pickChoice(event.branch.if_sensor_fixed, eventChoiceId);
          applyChoiceDelta(state, selected);
        } else if (!state.flags.sensor_fixed && event.branch.if_sensor_failed) {
          const selected = pickChoice(event.branch.if_sensor_failed, eventChoiceId);
          applyChoiceDelta(state, selected);
        }
      } else if (event.choices) {
        const selected = pickChoice(event.choices, eventChoiceId);
        applyChoiceDelta(state, selected);
      }
    }

    // 2) Module daily effects
    const hvacBase = (rules.hvac?.hvac_base_power_kwh_per_day || 0);
    let moduleFoodDelta = 0, moduleO2Delta = 0, moduleH2ODelta = 0, modulePowerDelta = 0;

    for (const compId of state.modules) {
      const comp = findComponentById(design, compId);
      if (!comp) continue;

      const de = comp.daily_effects || {};
      const context = { crewCount: state.crew, planet: state.planet, hvacBase };
      for (const [k, v] of Object.entries(de)) {
        const val = parseDelta(v, context);
        if (k === "O2") moduleO2Delta += val;
        if (k === "H2O") moduleH2ODelta += val;
        if (k === "Food") moduleFoodDelta += val;
        if (k === "Power") modulePowerDelta += val;
        if (k === "Health") state.Health += val;
        if (k === "Morale") state.Morale += val;
      }
    }

    state.O2 += moduleO2Delta;
    state.H2O += moduleH2ODelta;
    state.Food += moduleFoodDelta;
    state.Power += modulePowerDelta;

    produced += Math.max(modulePowerDelta, 0);
    consumed += Math.max(-modulePowerDelta, 0);

    // 3) Crew metabolism
    const per = rules.per_person_daily_metabolism;
    const crew = state.crew;
    const dO2 = -per.O2 * crew * metabolismK;
    const dH2O = -per.H2O * crew * metabolismK;
    const dFood = -per.Food * crew * metabolismK;
    const dPow = -per.Power * crew; // keep fixed

    state.O2 += dO2;
    state.H2O += dH2O;
    state.Food += dFood;
    state.Power += dPow;
    consumed += Math.max(-dPow, 0);

    // 4) Baseline Health/Morale decay
    state.Health += per.Health_delta;
    state.Morale += per.Morale_delta;

    // 5) Ongoing per-day penalties
    if (state.ongoing.O2_per_day) state.O2 += state.ongoing.O2_per_day;
    if (state.ongoing.Health_per_day) state.Health += state.ongoing.Health_per_day;

    // 6) Clamp & log
    clampState(state);
    state.dailyPowerProduced.push(produced);
    state.dailyPowerConsumed.push(consumed);

    // Next day
    state.day += 1;
    return state;
  }

  function pickChoice(choices, wantedId) {
    if (wantedId) {
      const found = choices.find(c => c.id === wantedId);
      if (found) return found;
    }
    return choices[0]; // default
  }

  function applyChoiceDelta(state, choice) {
    if (!choice) return;
    const d = choice.delta || {};

    if (d.risk && typeof d.risk.prob === "number" && d.risk.onFail) {
      const r = Math.random();
      if (r < d.risk.prob) {
        applyChoiceDelta(state, d.risk.onFail);
        state.countedChoices += 1;
        return;
      } else {
        state.successfulChoices += 1;
        state.countedChoices += 1;
      }
    }

    for (const [k, v] of Object.entries(d)) {
      if (k === "risk") continue;
      if (k.endsWith("_per_day")) {
        state.ongoing[k] = (state.ongoing[k] || 0) + v;
      } else if (k.endsWith("_next_day")) {
        state.flags[k] = (state.flags[k] || 0) + v;
      } else if (k === "sacrifice_module") {
        // naive: remove last non-required module if any (adjust for your UI rules)
        const required = new Set(["hab_dome"]);
        for (let i = state.modules.length - 1; i >= 0; i--) {
          if (!required.has(state.modules[i])) {
            state.modules.splice(i, 1);
            break;
          }
        }
      } else if (["O2", "H2O", "Food", "Power", "Health", "Morale"].includes(k)) {
        state[k] += v;
      }
    }

    if (choice.flags) Object.assign(state.flags, choice.flags);
  }

  function applyNextDayFlags(state) {
    for (const [k, v] of Object.entries(state.flags)) {
      if (k.endsWith("_next_day")) {
        const resKey = k.replace("_next_day", "");
        if (["O2", "H2O", "Food", "Power"].includes(resKey)) state[resKey] += v;
        state.flags[k] = 0;
      }
    }
  }

  function clampState(state) {
    state.Health = clamp(state.Health, 0, 100);
    state.Morale = clamp(state.Morale, 0, 100);
    state.O2 = Math.max(state.O2, 0);
    state.H2O = Math.max(state.H2O, 0);
    state.Food = Math.max(state.Food, 0);
    state.Power = Math.max(state.Power, 0);
  }

  function computeMetrics(design, runState, initialSnapshot) {
    const init = initialSnapshot;
    const fin = { O2: runState.O2, H2O: runState.H2O, Food: runState.Food, Power: runState.Power };

    const initRes = (init.O2 + init.H2O + init.Food + init.Power);
    const finalRes = (fin.O2 + fin.H2O + fin.Food + fin.Power);
    const R = finalRes / Math.max(initRes, 1e-9);

    const SurvivalScore =
      clamp(runState.Health, 0, 100) +
      clamp(runState.Morale, 0, 100) +
      50 * R;

    const ResourceEfficiency = 100 * R;
    const PowerBalance = sum(runState.dailyPowerProduced) - sum(runState.dailyPowerConsumed);

    const success =
      runState.day > design.game.days &&
      runState.Health > 0 && runState.O2 > 0 && runState.H2O > 0 && runState.Food > 0;

    const verdict =
      !success ? "Failed" :
      (SurvivalScore >= 200 && PowerBalance >= 0 ? "Excellent" : "Survived");

    return {
      SurvivalScore: +SurvivalScore.toFixed(1),
      ResourceEfficiency: +ResourceEfficiency.toFixed(1),
      PowerBalance: +PowerBalance.toFixed(1),
      verdict
    };
  }

  return {
    initializeRun,
    dailyTick,
    applyNextDayFlags,
    computeMetrics
  };
}

// Example (Node/Browser):
// import design from "./design.json" assert { type: "json" };
// const engine = createEngine(design);
// const run = engine.initializeRun({
//   planetKey: "kepler22b",
//   crewCount: 3,
//   pickedComponents: ["hab_dome","therm_x","lss_bio","water_tank","solar_array","battery","airlock","workshop","community"]
// });
// const initial = { O2: run.O2, H2O: run.H2O, Food: run.Food, Power: run.Power };
// while (run.day <= 5) {
//   engine.applyNextDayFlags(run);
//   engine.dailyTick(run, { eventChoiceId: undefined }); // pass "A"/"B" from UI
//   if (run.day <= 5 && (run.Health<=0 || run.O2<=0 || run.H2O<=0 || run.Food<=0)) break;
// }
// const metrics = engine.computeMetrics(design, run, initial);
// console.log({ run, metrics });

export { createEngine };