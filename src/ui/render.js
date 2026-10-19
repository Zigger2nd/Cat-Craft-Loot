import { state } from "../core/state.js";
import { getClickCost, getClickPower, getCps } from "../core/economy.js";
import { renderGenerators } from "../ui/generators.js";
import { LOOTBOX, ENERGY } from "../config/balance.js";

export function render() {
  document.querySelector(".treats-count").textContent = Math.floor(
    state.treats,
  );

  document.querySelector(".clicker-cost").textContent = getClickCost();
  document.querySelector(".click-level").textContent = state.clickLevel;

  document.querySelectorAll(".click-power").forEach((element) => {
    element.textContent = getClickPower();
  });

  const totalCps = document.getElementById("totalCps");

  if (totalCps) {
    totalCps.textContent = getCps().toFixed(1);
  }

  document.querySelector(".energy-count").textContent =
    `${state.energy}/${ENERGY.max}`;

  document.querySelector(".dust-count").textContent = Math.floor(state.dust);

  document.getElementById("openBoxBtn").disabled =
    state.energy < LOOTBOX.energyCost;

  const secondsLeft = Math.ceil((state.adReadyAt - Date.now()) / 1000);

  document.getElementById("watchAddBtn").disabled = secondsLeft > 0;

  renderGenerators();
}
