import { state } from "./core/state.js";
import { load, save } from "./storage/save.js";
import { clickCat, buyClick, getCps } from "./core/economy.js";
import { render } from "./ui/render.js";
import { initGenerators } from "./ui/generators.js";
import { updateEnergy } from "./loot/energy.js";
import { openBox, claimReward } from "./loot/lootBox.js";
import { SKINS } from "./config/skins.js";
import { initCatAnimation } from "./ui/catAnimation.js";
import { initCatCardsList } from "./ui/lootBoxCards.js";
import { buildReelIds, renderReel, spinReel } from "./ui/lootboxreel.js";

load();
if (state.pendingReward) claimReward();
updateEnergy();
initGenerators(render);
initCatCardsList();
initCatAnimation();
render();

document.getElementById("clickBtn").addEventListener("click", () => {
  clickCat();

  render();
});

document.getElementById("buyClickBtn").addEventListener("click", () => {
  buyClick();

  render();
});

let isSpinning = false;
let spinTimer = null;

const dialog = document.getElementById("dialog");
document.getElementById("boxBtn").addEventListener("click", () => {
  dialog.showModal();
});

closeBtn.addEventListener("click", () => {
  if (isSpinning) return;
  dialog.close();
});

document.getElementById("openBoxBtn").addEventListener("click", () => {
  if (isSpinning) {
    return;
  }

  dialog.addEventListener("cancel", (e) => {
    if (isSpinning) e.preventDefault();
  });

  const res = openBox();
  if (!res.ok) return;
  renderReel(buildReelIds(res.id));
  isSpinning = true;
  const ribbon = document.querySelector(".lootbox-ribbon");
  ribbon.addEventListener("transitionend", finishSpin, { once: true });
  spinReel();
  spinTimer = setTimeout(finishSpin, 5200);
});

function finishSpin() {
  if (!isSpinning) {
    return;
  }
  clearTimeout(spinTimer);
  isSpinning = false;
  const result = claimReward();
  if (!result.ok) {
    return;
  }
  const skin = SKINS[result.id];
  document.getElementById("lootResult").textContent = result.duplicate
    ? `${skin.name} (${skin.rarity}): duplicate, +${result.dust} dust`
    : `New skin: ${skin.name} (${skin.rarity})!`;
  render();
}

let last = Date.now();

setInterval(() => {
  const now = Date.now();
  const elapsed = (now - last) / 1000;
  state.treats += getCps() * elapsed;
  last = now;
  updateEnergy();
  render();
}, 200);

setInterval(save, 5000);

//window.addEventListener("beforeunload", save);
