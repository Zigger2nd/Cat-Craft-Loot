import { state } from "../../core/state.js";
import { BACKGROUNDS } from "../../config/backgrounds.js";
import { assetUrl } from "../../config/paths.js";

export function applyBackground() {
  const catContainer = document.querySelector(".cat-container");
  if (!catContainer) return;
  const background = BACKGROUNDS[state.equippedBackground];

  if (!background) {
    console.error("Background not found:", state.equippedBackground);
    return;
  }

  catContainer.style.backgroundImage = `url("${assetUrl(background.image)}")`;

  catContainer.style.backgroundSize = "cover";
  catContainer.style.backgroundPosition = "center";
  catContainer.style.backgroundRepeat = "no-repeat";
}
