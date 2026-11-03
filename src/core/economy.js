import { state } from "./state.js";
import { CLICK_UPGRADE } from "../config/upgrades.js";
import { GENERATORS } from "../config/generators.js";
import { addRage, isRageActive } from "./rage.js";
import { RAGE } from "../config/balance.js";
import { getSkinBonuses } from "./skinBonuses.js";

const GOLDEN_CAT_MULTIPLIER = 10;

export function clickCat() {
  const basePower = getClickPower();
  const multiplier = state.goldenCatActive ? GOLDEN_CAT_MULTIPLIER : 1;

  const amount = basePower * multiplier;

  state.treats += amount;
  state.stats.totalTreats += amount;
  state.stats.totalClicks += 1;

  addRage();

  return amount;
}

export function getClickPower() {
  const base = 1 + state.clickLevel * CLICK_UPGRADE.powerPerLevel;

  return isRageActive() ? base * RAGE.clickMultiplier : base;
}

export function getClickCost() {
  const bonuses = getSkinBonuses();
  const discount = bonuses.clickDiscount ?? 0;

  const baseCost =
    CLICK_UPGRADE.baseCost * CLICK_UPGRADE.growth ** state.clickLevel;

  return Math.floor(baseCost * (1 - discount));
}

export function buyClick() {
  const cost = getClickCost();

  if (state.treats < cost) return false;

  state.treats -= cost;
  state.clickLevel += 1;

  return true;
}

export function getGeneratorCost(id) {
  const generator = GENERATORS[id];

  if (!generator) return Infinity;

  const level = state.generators[id] ?? 0;
  const bonuses = getSkinBonuses();
  const discount = bonuses.generatorDiscount ?? 0;

  const baseCost = generator.baseCost * generator.growth ** level;

  return Math.floor(baseCost * (1 - discount));
}

export function buyGenerator(id) {
  const cost = getGeneratorCost(id);

  if (state.treats < cost) return false;

  state.treats -= cost;
  state.generators[id] = (state.generators[id] ?? 0) + 1;

  return true;
}

export function getGeneratorCps(id) {
  const generator = GENERATORS[id];

  if (!generator) return 0;

  const bonuses = getSkinBonuses();

  let multiplier = bonuses.cpsMultiplier ?? 1;

  if (id === "toy") {
    multiplier *= bonuses.toyCpsMultiplier ?? 1;
  }

  if (id === "bowl") {
    multiplier *= bonuses.bowlCpsMultiplier ?? 1;
  }

  return generator.cps * multiplier;
}

export function getCps() {
  let totalCps = 0;

  for (const id of Object.keys(GENERATORS)) {
    const owned = state.generators[id] ?? 0;

    totalCps += owned * getGeneratorCps(id);
  }

  return totalCps;
}
