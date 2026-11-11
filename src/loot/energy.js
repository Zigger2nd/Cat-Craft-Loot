import { state } from "../core/state.js";
import { ENERGY } from "../config/balance.js";
import { getSkillBonus } from "../core/skillTree.js";

function getMaxEnergy() {
  const baseMax = ENERGY.max ?? 10;
  const bonusMax = getSkillBonus("maxEnergy");
  return baseMax + bonusMax;
}

export function updateEnergy() {
  const now = Date.now();
  const stepMs = ENERGY.regenSeconds * 1000;
  const currentMax = getMaxEnergy();

  if (!state.energyUpdatedAt) {
    state.energyUpdatedAt = now;
  }

  if (state.energy >= currentMax) {
    state.energy = currentMax;
    state.energyUpdatedAt = now;
  } else {
    const gained = Math.floor((now - state.energyUpdatedAt) / stepMs);

    if (gained > 0) {
      state.energy = Math.min(currentMax, state.energy + gained);

      state.energyUpdatedAt += gained * stepMs;
    }
  }

  renderEnergyBar();
}

function renderEnergyBar() {
  const bar = document.querySelector(".progress-fill--energy");
  const counters = document.querySelectorAll(".energy-count");

  const currentMax = getMaxEnergy();
  const currentEnergy = Math.max(0, Math.min(state.energy, currentMax));

  const ratio = currentMax > 0 ? currentEnergy / currentMax : 0;

  counters.forEach((el) => {
    el.textContent = `${currentEnergy} / ${currentMax}`;
  });

  if (bar) {
    bar.style.width = `${ratio * 100}%`;
  }
}

export function addEnergy(amount) {
  const currentMax = getMaxEnergy();
  state.energy = Math.min(currentMax, state.energy + amount);
  updateEnergy();
}
