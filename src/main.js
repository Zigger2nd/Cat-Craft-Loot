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
import { initShop } from "./ui/shop.js";
import { initDailyModal } from "./ui/dailyModal.js";
import { initDailyList } from "./ui/dailyRewards.js";
import { assetUrl } from "./config/paths.js";
import { initInstructions } from "./ui/instructions.js";
import { showClickEffect } from "./ui/clickEffect.js";
import { showSkinReward } from "./ui/skinReward.js";

load();

window.debugGameState = state;
window.debugSaveGame = save;

if (state.pendingReward) {
  claimReward();
}

const offlineGained = applyOfflineGains();

updateEnergy();
save();

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

  const imageUrl = assetUrl(skin.img);

  sprite.style.backgroundImage = `url("${imageUrl}")`;
  sprite.style.backgroundSize = "300% 400%";
  sprite.style.backgroundPosition = "0 0";
  sprite.style.backgroundRepeat = "no-repeat";
}

initInstructions();
initGenerators(render);
initShop(render);
initSkinsModal();
applyEquippedSkin();
initCatAnimation();
render();

const offlineDialog = document.getElementById("offlineDialog");
const offlineAmount = document.getElementById("offline-amount");
const offlineCloseBtn = document.getElementById("offlineCloseBtn");

if (
  offlineGained.elapsed > 60 &&
  offlineGained.gained > 0 &&
  offlineDialog &&
  offlineAmount
) {
  offlineAmount.textContent = Math.floor(offlineGained.gained);

  if (!offlineDialog.open) {
    offlineDialog.showModal();
  }
}

if (offlineCloseBtn && offlineDialog) {
  offlineCloseBtn.addEventListener("click", () => {
    offlineDialog.close();
  });
}

initDailyList();
initDailyModal(render);

const clickBtn = document.getElementById("clickBtn");

if (clickBtn) {
  clickBtn.addEventListener("click", () => {
    clickCat();
    render();

    const clickPower = Number(
      document.querySelector(".click-power")?.textContent ?? 1,
    );

    showClickEffect(event, clickPower);
  });
}
const clickerCard = document.querySelector(".upgrade");
const buyClickBtn = document.getElementById("buyClickBtn");

function purchaseClickUpgrade() {
  const purchased = buyClick();

  if (purchased) {
    save();
    render();
  }
}

if (buyClickBtn) {
  buyClickBtn.addEventListener("click", purchaseClickUpgrade);
} else if (clickerCard) {
  clickerCard.addEventListener("click", purchaseClickUpgrade);
}

let isSpinning = false;
let spinTimer = null;

const dialog = document.getElementById("dialog");

if (dialog) {
  const boxBtn = document.getElementById("boxBtn");
  const closeBtn = document.getElementById("closeBtn");
  const openBoxBtn = document.getElementById("openBoxBtn");

  if (boxBtn) {
    boxBtn.addEventListener("click", () => {
      if (!dialog.open) {
        dialog.showModal();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (isSpinning) {
        return;
      }

      dialog.close();
    });
  }

  dialog.addEventListener("cancel", (event) => {
    if (isSpinning) {
      event.preventDefault();
    }
  });

  if (openBoxBtn) {
    openBoxBtn.addEventListener("click", () => {
      if (isSpinning) {
        return;
      }

      const result = openBox();

      if (!result || !result.ok) {
        return;
      }

      save();
      render();

      renderReel(buildReelIds(result.id));

      isSpinning = true;
      dialog.dataset.spinning = "true";

      const ribbon = document.querySelector(".lootbox-ribbon");

      if (ribbon) {
        ribbon.addEventListener("transitionend", finishSpin, {
          once: true,
        });
      }

      spinReel();

      spinTimer = setTimeout(finishSpin, 5200);
    });
  }
}

function finishSpin() {
  if (!isSpinning) {
    return;
  }

  clearTimeout(spinTimer);

  const result = claimReward();

  if (!result || !result.ok) {
    isSpinning = false;

    if (dialog) {
      dialog.dataset.spinning = "false";
    }

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
      showSkinReward({
        ...skin,
        image: assetUrl(skin.img),
      });
    }
  }

  isSpinning = false;

  if (dialog) {
    dialog.dataset.spinning = "false";
  }

  save();
  render();
}

function loadReelPreview() {
  const skinIds = Object.keys(SKINS);

  if (skinIds.length === 0) {
    console.error("No skins are configured for the loot box.");
    return;
  }

  const previewIds = Array.from({ length: 45 }, () => {
    const randomIndex = Math.floor(Math.random() * skinIds.length);
    return skinIds[randomIndex];
  });

  renderReel(previewIds);
}

loadReelPreview();

window.addEventListener("lootboxOpening", loadReelPreview);

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

initAdModal(render);
initLootboxModal();

let last = Date.now();

setInterval(() => {
  const now = Date.now();
  const elapsed = (now - last) / 1000;

  const safeElapsed = Math.min(Math.max(elapsed, 0), 1);

  state.treats += getCps() * safeElapsed;

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

function saveBeforeLeaving() {
  save();
}

window.addEventListener("pagehide", saveBeforeLeaving);
window.addEventListener("beforeunload", saveBeforeLeaving);

window.debugGameState = state;
window.debugSaveGame = save;
