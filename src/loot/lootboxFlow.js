import { save } from "../storage/save.js";
import { openBox, claimReward } from "./lootBox.js";
import {
  renderReel,
  buildReelIds,
  spinReel,
} from "../ui/lootbox/lootboxreel.js";
import { SKINS } from "../config/skins.js";
import { showSkinReward } from "../ui/skins/skinReward.js";
import { assetUrl } from "../config/paths.js";
import { notifyAchievements } from "../core/achievements.js";

const lootboxSound = new Audio(assetUrl("/sounds/lootbox.mp3"));
lootboxSound.volume = 0.5;

export function initLootboxFlow(render) {
  const dialog = document.getElementById("lootboxDialog");
  const openBoxBtn = document.getElementById("openBoxBtn");
  const closeBtn = document.getElementById("lootboxCloseBtn");
  const lootResult = document.getElementById("lootResult");

  if (!dialog || !openBoxBtn || !closeBtn || !lootResult) return;

  let isSpinning = false;
  let spinTimer = null;

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
    lootResult.textContent = "";
    dialog.showModal();
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

  function finishSpin() {
    if (!isSpinning) {
      return;
    }

    clearTimeout(spinTimer);
    isSpinning = false;
    dialog.dataset.spinning = "false";

    const result = claimReward();

    if (!result || !result.ok) {
      save();
      render();
      return;
    }

    const skin = SKINS[result.id];

    if (skin) {
      lootResult.textContent = result.duplicate
        ? `${skin.name} (${skin.rarity}): duplicate, +${result.dust} dust`
        : `New skin: ${skin.name} (${skin.rarity})!`;

      if (!result.duplicate) {
        lootboxSound.currentTime = 0;
        lootboxSound.play().catch((error) => {
          console.warn("Could not play lootbox sound:", error);
        });
        dialog.close();
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

  dialog.addEventListener("cancel", (event) => {
    if (dialog.dataset.spinning === "true") {
      event.preventDefault();
    }
  });
  closeBtn.addEventListener("click", () => {
    if (dialog.dataset.spinning === "true") return;
    dialog.close();
  });
}
