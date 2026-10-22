import { state } from "./core/state.js";
import { load, save } from "./storage/save.js";
import { clickCat, buyClick, getCps, getClickPower } from "./core/economy.js";
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
import { initShop } from "./ui/shop.js";
import { initDailyModal } from "./ui/dailyModal.js";
import { initDailyList } from "./ui/dailyRewards.js";
import { checkAchievements } from "./core/achievements.js";
import { showToast } from "./ui/toast.js";
import { initAchievementsList } from "./ui/achievementsList.js";
import { initAchievementsModal } from "./ui/achievemenetsModal.js";
import { assetUrl } from "./config/paths.js";
import { initInstructions } from "./ui/instructions.js";
import { showClickEffect } from "./ui/clickEffect.js";
import { showSkinReward } from "./ui/skinReward.js";
import { renderBallGenerator } from "./ui/ballGenerator.js";

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

const catMeow = new Audio("/sounds/cat_meow.mp3");
catMeow.volume = 0.5;
let lastMeowTime = 0;

const lootboxSound = new Audio("/sounds/lootbox.mp3");
lootboxSound.volume = 0.5;

const achievementSound = new Audio("/sounds/achievement.mp3");
achievementSound.volume = 1;

// ###################MAIN##########################
let isSpinning = false;
let spinTimer = null;

const dialog = document.getElementById("dialog");
const offlineDialog = document.getElementById("offlineDialog");

function notifyAchievements() {
  const unlocked = checkAchievements();

  for (const a of unlocked) {
    showToast("Achievement unlocked!", a.name);

    achievementSound.currentTime = 0;

    achievementSound.play().catch((error) => {
      console.warn("Could not play achievement sound:", error);
    });
  }

  if (unlocked.length > 0) {
    save();
    render();
  }
}

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

function loadReelPreview() {
  const skinIds = Object.keys(SKINS);

  if (skinIds.length === 0) {
    console.error("No skins are configured for the loot box.");
    return;
  }

  const previewIds = Array.from({ length: 45 }, () => {
    return skinIds[Math.floor(Math.random() * skinIds.length)];
  });

  renderReel(previewIds);
}

// #############################INTERFACE INTIALIZATION######################
initInstructions();
initGenerators(() => {
  render();
  renderBallGenerator();
});
initShop(render);
initSkinsModal();
initAchievementsList();
initAchievementsModal();
initCatAnimation();
applyEquippedSkin();
initAdModal(render);
initLootboxModal();
loadReelPreview();
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
    const now = Date.now();

    if (now - lastMeowTime >= 300) {
      lastMeowTime = now;
      catMeow.currentTime = 0;

      catMeow.play().catch((error) => {
        console.warn("Could not play cat meow:", error);
      });
    }
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

// ######################LOOTBOX##########################
window.addEventListener("lootboxOpening", loadReelPreview);

const openBoxBtn = document.getElementById("openBoxBtn");

if (openBoxBtn && dialog) {
  openBoxBtn.addEventListener("click", () => {
    if (isSpinning) {
      return;
    }

    const res = openBox();

    if (!res || !res.ok) {
      return;
    }
    save();
    render();

    renderReel(buildReelIds(res.id));

    isSpinning = true;
    dialog.dataset.spinning = "true";

    const ribbon = document.querySelector(".lootbox-ribbon");

    if (ribbon) {
      ribbon.addEventListener("transitionend", finishSpin, { once: true });
    }

    spinReel();

    spinTimer = setTimeout(finishSpin, 5200);
  });
}

function finishSpin() {
  if (!isSpinning) {
    return;
  }

  clearTimeout(spinTimer);
  isSpinning = false;

  if (dialog) {
    dialog.dataset.spinning = "false";
  }

  const result = claimReward();

  if (!result || !result.ok) {
    save();
    render();
    return;
  }

  const skin = SKINS[result.id];
  const lootResult = document.getElementById("lootResult");

  if (skin && lootResult) {
    lootResult.textContent = result.duplicate
      ? `${skin.name} (${skin.rarity}): duplicate, +${result.dust} dust`
      : `New skin: ${skin.name} (${skin.rarity})!`;

    if (!result.duplicate) {
      lootboxSound.currentTime = 0;
      lootboxSound.play().catch((error) => {
        console.warn("Could not play lootbox sound:", error);
      });

      showSkinReward({
        ...skin,
        image: assetUrl(skin.img),
      });
    }
  }

  save();
  render();
  notifyAchievements();
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
/*document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    save();
  }
});

window.addEventListener("pagehide", save);
window.addEventListener("beforeunload", save);*/
