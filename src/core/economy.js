import { state } from "./state.js";
import { CLICK_UPGRADE } from "../config/upgrades.js";
import { GENERATORS } from "../config/generators.js";
import { addRage, isRageActive } from "./rage.js";
import { getSkinBonuses } from "./skinBonuses.js";
import { RAGE, CRIT, GOLDEN_CAT_MULTIPLIER } from "../config/balance.js";
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

  const hasExponentialClick = getSkillBonus("exponentialClick") > 0;

  let totalTreatsBonus = 0;
  if (hasExponentialClick && state.stats?.totalTreats > 0) {
    totalTreatsBonus = Math.floor(Math.log10(state.stats.totalTreats + 1) * 15);
  }

  return (
    (base + totalTreatsBonus) *
    (1 + getSkillBonus("clickBonus")) *
    (isRageActive()
      ? RAGE.clickMultiplier * getSkillMultiplier("rageEffect")
      : 1) *
    (state.goldenCatActive ? GOLDEN_CAT_MULTIPLIER : 1)
  );
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
  let multiplier = 1;

  if (id === "toy") {
    multiplier *=
      (1 + getSkillBonus("ballCpsBonus")) * (bonuses.toyCpsMultiplier ?? 1);
  }
  if (id === "bowl") {
    multiplier *=
      (1 + getSkillBonus("bowlCpsBonus")) * (bonuses.bowlCpsMultiplier ?? 1);
  }
  if (id === "bed") {
    multiplier *=
      (1 + getSkillBonus("bedCpsBonus")) * (bonuses.bedCpsMultiplier ?? 1);
  }

  return generator.cps * multiplier;
}

export function getCps() {
  let totalCps = 0;
  const bonuses = getSkinBonuses();

  for (const id of Object.keys(GENERATORS)) {
    totalCps += (state.generators[id] ?? 0) * getGeneratorCps(id);
  }

  return (
    totalCps * (1 + getSkillBonus("cpsBonus")) * (bonuses.cpsMultiplier ?? 1)
  );
}
