import { assetUrl } from "../../config/paths.js";
import { PUZZLE } from "../../config/puzzle.js";
import { findSecretCat } from "../../core/puzzle.js";
import { state } from "../../core/state.js";
import { save } from "../../storage/save.js";
export function initSecretPuzzle() {
  const secretElements = document.querySelectorAll(".hidden-secret-cat");

  if (secretElements.length === 0) {
    console.warn("No secret cats found in HTML!");
    return;
  }

  for (const element of secretElements) {
    const catId = element.dataset.catId;

    if (!catData) {
      console.error("Unknown secret cat:", catId);
      continue;
    }

    const catData = PUZZLE.find((item) => item.id === catId);

    element.src = assetUrl(catData.img);

    const isFound = state.foundSecretCats.includes(catId);

    if (isFound) {
      element.style.display = "none";
      continue;
    }
    findSecretCat(catId);
    element.addEventListener("click", () => {
      if (!state.foundSecretCats.includes(catId)) {
        state.foundSecretCats.push(catId);

        element.style.display = "none";

        save();

        console.log(
          `Секретный кот найден! (${state.foundSecretCats.length}/${PUZZLE.length})`,
        );
      }
    });
  }
}
