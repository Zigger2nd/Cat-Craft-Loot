import { RAGE } from "../config/balance.js";
import { state } from "../core/state.js";
import { getRageCooldownLeft } from "../core/rage.js";
import { assetUrl } from "../config/paths.js";
const RAGE_STATES = [
  { min: 0.9, img: "/skins/rageBar/bar_8.png" },
  { min: 0.8, img: "/skins/rageBar/bar_7.png" },
  { min: 0.7, img: "/skins/rageBar/bar_6.png" },
  { min: 0.6, img: "/skins/rageBar/bar_5.png" },
  { min: 0.5, img: "/skins/rageBar/bar_4.png" },
  { min: 0.4, img: "/skins/rageBar/bar_3.png" },
  { min: 0.3, img: "/skins/rageBar/bar_2.png" },
  { min: 0.2, img: "/skins/rageBar/bar_1.png" },
  { min: 0.1, img: "/skins/rageBar/bar_0.png" },
];

export function renderRageBar() {
  const bar = document.querySelector(".rage-bar");
  const counter = document.querySelector(".rage-count");

  if (!bar) return;

  const maxRage = RAGE.max;
  const current = Math.max(0, Math.min(state.rage, RAGE.max));

  const ratio = current / RAGE.max;

  const selectedState =
    RAGE_STATES.find((item) => ratio >= item.min) ?? RAGE_STATES[8];

  bar.style.backgroundImage = `url(${assetUrl(selectedState.img)})`;

  bar.setAttribute("aria-valuemax", maxRage);
  bar.setAttribute("aria-valuenow", Math.floor(current));
  bar.classList.toggle("is-active", state.ragePhase === "active");
  bar.classList.toggle("is-cooldown", state.ragePhase === "cooldown");
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
