import { state } from "./core/state.js";
import { load, save } from "./storage/save.js";
import { clickCat, buyClick, getCps } from "./core/economy.js";
import { render } from "./ui/render.js";
import { initGenerators } from "./ui/generators.js";
import { updateEnergy } from "./loot/energy.js";
import { openBox, claimReward } from "./loot/lootBox.js";
import { SKINS } from "./config/skins.js";
import { initCatAnimation } from "./ui/catAnimation.js";
import { buildReelIds, renderReel, spinReel } from "./ui/lootboxreel.js";
import { initSkinsModal } from "./ui/skinsModal.js";
import { applyOfflineGains } from "./core/offline.js";
import { initAdModal } from "./ui/adModal.js";
import { initLootboxModal } from "./ui/lootboxModal.js";
import { initDailyModal } from "./ui/dailyModal.js";
import { initDailyList } from "./ui/dailyRewards.js";

load();
if (state.pendingReward) claimReward();
const offlineGained = applyOfflineGains();
updateEnergy();
initGenerators(render);
initSkinsModal();
initCatAnimation();
render();

let isSpinning = false;
let spinTimer = null;

const dialog = document.getElementById("dialog");
const offlineDialog = document.getElementById("offlineDialog");

if (offlineGained.gained > 0 && offlineGained.elapsed > 60) {
  document.getElementById("offline-amount").textContent = Math.floor(
    offlineGained.gained,
  );
  offlineDialog.showModal();
}

initDailyList();
initDailyModal(render);

loadReelPreview();
document.getElementById("offlineCloseBtn").addEventListener("click", () => {
  offlineDialog.close();
});

document.getElementById("clickBtn").addEventListener("click", () => {
  clickCat();

  render();
});

document.getElementById("buyClickBtn").addEventListener("click", () => {
  buyClick();

  render();
});

document.getElementById("openBoxBtn").addEventListener("click", () => {
  if (isSpinning) {
    return;
  }

  const res = openBox();

  if (!res.ok) {
    return;
  }

  renderReel(buildReelIds(res.id));

  isSpinning = true;
  dialog.dataset.spinning = "true";

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

  const result = claimReward();

  if (!result.ok) {
    isSpinning = false;
    dialog.dataset.spinning = "false";
    return;
  }
  if (!result.ok) {
    return;
  }
  const skin = SKINS[result.id];
  document.getElementById("lootResult").textContent = result.duplicate
    ? `${skin.name} (${skin.rarity}): duplicate, +${result.dust} dust`
    : `New skin: ${skin.name} (${skin.rarity})!`;
  render();

  document.getElementById("lootResult").textContent =
    document.getElementById("lootResult").textContent;

  isSpinning = false;
  dialog.dataset.spinning = "false";
}

function loadReelPreview() {
  const previewIds = Array.from({ length: 45 }, () => {
    const ids = Object.keys(SKINS);
    return ids[Math.floor(Math.random() * ids.length)];
  });

  renderReel(previewIds);
}

window.addEventListener("lootboxOpening", loadReelPreview);

initAdModal(render);
initLootboxModal();

window.addEventListener("skinSelected", (event) => {
  const { skinId, imageUrl } = event.detail;
  const sprite = document.getElementById("clickBtn");

  if (!sprite) {
    return;
  }

  sprite.style.backgroundImage = `url("${imageUrl}")`;
  sprite.style.backgroundSize = "300% 400%";
  sprite.style.backgroundPosition = "0 0";
  sprite.style.backgroundRepeat = "no-repeat";

  state.equippedSkin = skinId;

  save();
});

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

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    save();
  }
});

window.addEventListener("beforeunload", save);
