import { RAGE } from "../../config/balance.js";
import { state } from "../../core/state.js";
import { getRageCooldownLeft } from "../../core/rage.js";

export function renderRageBar() {
  const bar = document.querySelector(".progress-fill--rage");
  const counter = document.querySelector(".rage-count");

  const current = Math.max(0, Math.min(state.rage, RAGE.max));
  const ratio = current / RAGE.max;
  const fillRatio = state.ragePhase === "active" ? 1 : ratio;

  if (bar) {
    bar.style.width = `${fillRatio * 100}%`;
    bar.classList.toggle("is-active", state.ragePhase === "active");
    bar.classList.toggle("is-cooldown", state.ragePhase === "cooldown");
  }

  if (counter) {
    counter.textContent =
      state.ragePhase === "cooldown"
        ? `Rage cooldown ${formatTime(getRageCooldownLeft())}`
        : `${Math.floor(current)} / ${RAGE.max}`;
  }
}

function formatTime(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}
