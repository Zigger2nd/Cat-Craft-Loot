import { state } from "../../core/state.js";
import { getClickPower, getCps } from "../../core/economy.js";
import { LOOTBOX } from "../../config/balance.js";

export function renderHome() {
  document.querySelectorAll(".click-power").forEach((el) => {
    el.textContent = getClickPower().toLocaleString("en-US");
  });
  const totalCpsElement = document.getElementById("totalCps");

  if (totalCpsElement) {
    totalCpsElement.textContent = getCps().toLocaleString("en-US", {
      maximumFractionDigits: 1,
    });
  }

  document.querySelector(".lifetime-clicks").textContent = Math.floor(
    state.stats.totalClicks,
  ).toLocaleString("en-US");

  document.querySelector(".energy-cost").textContent =
    `· ${LOOTBOX.energyCost} energy`;
}
