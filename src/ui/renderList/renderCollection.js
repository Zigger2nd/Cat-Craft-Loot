import { state } from "../../core/state.js";
import { SKINS } from "../../config/skins.js";

export function renderCollectionBar() {
  const bar = document.querySelector(".progress-fill--collection");
  const counters = document.querySelectorAll(".collection-value");

  const currentSkinsMax = Object.keys(SKINS).length;
  const currentSkins = Math.max(
    0,
    Math.min(state.ownedSkins.length, currentSkinsMax),
  );

  const ratio = currentSkinsMax > 0 ? currentSkins / currentSkinsMax : 0;

  counters.forEach((el) => {
    el.textContent = `${currentSkins} / ${currentSkinsMax}`;
  });

  if (bar) {
    bar.style.width = `${ratio * 100}%`;
  }
}
