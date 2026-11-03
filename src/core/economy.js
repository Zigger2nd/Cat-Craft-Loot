import { state } from "./state.js";
import { CLICK_UPGRADE } from "../config/upgrades.js";
import { GENERATORS } from "../config/generators.js";
import { addRage, isRageActive } from "./rage.js";
import { RAGE, CRIT } from "../config/balance.js";
import { getSkillBonus, getSkillMultiplier } from "./skillTree.js";

export function getCritChance() {
  return Math.min(
    CRIT.maxChance,
    CRIT.baseChance + getSkillBonus("critChance"),
  );
}
export function getCritMultiplier() {
  return CRIT.baseMultiplier + getSkillBonus("critDamage");
}

export function clickCat(multiplier = 1) {
  const isCrit = Math.random(1) < getCritChance();
  const amount =
    getClickPower() * multiplier * (isCrit ? getCritMultiplier() : 1);

  state.treats += amount;
  state.stats.totalTreats += amount;
  state.stats.totalClicks += 1;
  addRage();

  return { amount, isCrit };
}

export function getClickPower() {
  const base = 1 + state.clickLevel * CLICK_UPGRADE.powerPerLevel;
  return (
    base *
    (1 + getSkillBonus("clickBonus")) *
    (isRageActive() ? RAGE.clickMultiplier : 1)
  );
}

export function getClickCost() {
  return Math.floor(
    CLICK_UPGRADE.baseCost * CLICK_UPGRADE.growth ** state.clickLevel,
  );
}

export function buyClick() {
  const cost = getClickCost();

  if (state.treats < cost) {
    return false;
  }

  state.treats -= cost;
  state.clickLevel += 1;

  return true;
}

export function getGeneratorCost(id) {
  const generator = GENERATORS[id];

  if (!generator) {
    return Infinity;
  }

  const level = state.generators[id] ?? 0;

  return Math.floor(generator.baseCost * generator.growth ** level);
}

export function buyGenerator(id) {
  const cost = getGeneratorCost(id);

  if (state.treats < cost) {
    return false;
  }

  state.treats -= cost;

  state.generators[id] = (state.generators[id] ?? 0) + 1;

  return true;
}

export function getGeneratorCps(id) {
  const generator = GENERATORS[id];

  if (!generator) return 0;

  let multiplier = 1;
  if (id === "toy") {
    multiplier *= getSkillMultiplier("ballCpsBonus") || 1;
  }

  if (id === "bowl") {
    multiplier *= getSkillMultiplier("bowlCpsBonus") || 1;
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
