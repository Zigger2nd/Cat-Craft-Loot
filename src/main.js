import { state } from "./core/state.js";
import { load, save } from "./storage/save.js";
import { clickCat, buyClick, getCps, getClickPower } from "./core/economy.js";
import { render } from "./ui/render.js";
import { initGenerators } from "./ui/generators.js";
import { updateEnergy } from "./loot/energy.js";
import { claimReward } from "./loot/lootBox.js";
import { SKINS } from "./config/skins.js";
import { initCatAnimation } from "./ui/catAnimation.js";
import { initSkinsModal } from "./ui/skinsModal.js";
import { applyOfflineGains } from "./core/offline.js";
import { initAdModal } from "./ui/adModal.js";
import { initLootboxModal } from "./ui/lootboxModal.js";
import { initShop } from "./ui/shop.js";
import { initDailyModal } from "./ui/dailyModal.js";
import { initDailyList } from "./ui/dailyRewards.js";
import { notifyAchievements } from "./core/achievements.js";
import { initAchievementsList } from "./ui/achievementsList.js";
import { initAchievementsModal } from "./ui/achievemenetsModal.js";
import { assetUrl } from "./config/paths.js";
import { initInstructions } from "./ui/instructions.js";
import { showClickEffect } from "./ui/clickEffect.js";
import { initLootboxFlow } from "./loot/lootboxFlow.js";

load();

if (import.meta.env.DEV) {
  window.debugGameState = state;
  window.debugSaveGame = save;
}

if (state.pendingReward) {
  claimReward();
}

const offlineGained = applyOfflineGains();
updateEnergy();

// ###################MAIN##########################

const offlineDialog = document.getElementById("offlineDialog");

function applyEquippedSkin() {
  const sprite = document.getElementById("clickBtn");

  if (!sprite) {
    console.error("Cat sprite element #clickBtn was not found.");
    return;
  }

  const skin = SKINS[state.equippedSkin] ?? SKINS.default;

  if (!skin || !skin.img) {
    console.error("The equipped skin has no valid image:", state.equippedSkin);
    return;
  }

  sprite.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
  sprite.style.backgroundSize = "300% 400%";
  sprite.style.backgroundPosition = "0 0";
  sprite.style.backgroundRepeat = "no-repeat";
}

// #############################INTERFACE INTIALIZATION######################
initInstructions();
initGenerators(render);
initShop(render);
initSkinsModal();
initAchievementsList();
initAchievementsModal();
initCatAnimation();
applyEquippedSkin();
initAdModal(render);
initLootboxModal();
initLootboxFlow(render);
render();
notifyAchievements();

const offlineAmount = document.getElementById("offline-amount");
const offlineCloseBtn = document.getElementById("offlineCloseBtn");

if (
  offlineGained.gained > 0 &&
  offlineGained.elapsed > 60 &&
  offlineDialog &&
  offlineAmount
) {
  offlineAmount.textContent = Math.floor(offlineGained.gained);
  offlineDialog.showModal();
}

if (offlineCloseBtn && offlineDialog) {
  offlineCloseBtn.addEventListener("click", () => offlineDialog.close());
}

// #####################DAILY##########################
initDailyList();
initDailyModal(() => {
  render();
  notifyAchievements();
});

// ############CLICKS AND UPGRADES######################
const clickBtn = document.getElementById("clickBtn");

if (clickBtn) {
  clickBtn.addEventListener("click", (event) => {
    const power = getClickPower();
    clickCat();
    showClickEffect(event, power);
    notifyAchievements();
    render();
  });
}

const buyClickBtn = document.getElementById("buyClickBtn");

if (buyClickBtn) {
  buyClickBtn.addEventListener("click", () => {
    if (buyClick()) {
      save();
      render();
    }
  });
}

// #####################EQUIP SKIN########################################
window.addEventListener("skinSelected", (event) => {
  const skinId = event.detail?.skinId;

  if (!skinId || !SKINS[skinId]) {
    console.error("Cannot equip unknown skin:", skinId);
    return;
  }

  if (!state.ownedSkins.includes(skinId)) {
    console.error("Cannot equip unowned skin:", skinId);
    return;
  }

  state.equippedSkin = skinId;

  applyEquippedSkin();
  save();
  render();
});

// ###########################Timers####################################
let last = Date.now();

setInterval(notifyAchievements, 2000);

setInterval(() => {
  const now = Date.now();
  const elapsed = Math.max((now - last) / 1000, 0);
  last = now;

  const gained = getCps() * elapsed;
  state.treats += gained;
  state.stats.totalTreats += gained;

  updateEnergy();
  render();
}, 200);

setInterval(save, 5000);

// ############################Save Changes##################################
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    save();
  }
});

window.addEventListener("pagehide", save);
window.addEventListener("beforeunload", save);
