import { state } from "../core/state.js";
import { save } from "../storage/save.js";
import { BACKGROUNDS } from "../config/backgrounds.js";
import { assetUrl } from "../config/paths.js";
import { triggerUfoEvent } from "../events/ufoEvent.js";

export function initShop(onChange) {
  const shopPage = document.querySelector('[data-view="shop"]');
  const backgroundList = document.getElementById("backgroundList");
  const shopDustCount = document.getElementById("shopDustCount");
  const catContainer = document.querySelector(".cat-container");

  if (!shopPage || !backgroundList || !shopDustCount) {
    console.error("Shop elements are missing from index.html.", {
      shopPage,
      backgroundList,
      shopDustCount,
    });
    return;
  }

  if (!Array.isArray(state.ownedBackgrounds)) {
    state.ownedBackgrounds = ["cozy_room"];
  }

  state.ownedBackgrounds = [
    ...new Set(
      state.ownedBackgrounds.filter((id) => Object.hasOwn(BACKGROUNDS, id)),
    ),
  ];

  if (!state.ownedBackgrounds.includes("cozy_room")) {
    state.ownedBackgrounds.unshift("cozy_room");
  }

  if (
    !Object.hasOwn(BACKGROUNDS, state.equippedBackground) ||
    !state.ownedBackgrounds.includes(state.equippedBackground)
  ) {
    state.equippedBackground = "cozy_room";
  }

  function applyShopBackground() {
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

  function renderShop() {
    shopDustCount.textContent = Math.floor(state.dust);

    backgroundList.replaceChildren();

    for (const [id, background] of Object.entries(BACKGROUNDS)) {
      const owned = state.ownedBackgrounds.includes(id);
      const equipped = state.equippedBackground === id;

      // Card
      const card = document.createElement("article");
      card.classList.add("background-card");

      // Preview
      const image = document.createElement("img");

      image.src = assetUrl(background.image);
      image.alt = background.name;
      image.classList.add("background-preview");
      image.loading = "lazy";

      image.addEventListener("error", () => {
        console.error(
          "Background image failed to load:",
          background.image,
          "Resolved URL:",
          image.src,
        );
      });

      // Name
      const name = document.createElement("h3");
      name.classList.add("background-name");
      name.textContent = background.name;

      // Price
      const price = document.createElement("p");
      price.classList.add("background-price");

      price.textContent =
        background.price === 0 ? "Free" : `${background.price} dust`;

      // Action button
      const button = document.createElement("button");

      button.type = "button";
      button.classList.add("btn", "btn-primary", "background-action");

      if (equipped) {
        button.textContent = "Equipped";
        button.disabled = true;
      } else if (owned) {
        button.textContent = "Equip";
      } else {
        button.textContent = "Buy";
        button.disabled = state.dust < background.price;
      }

      button.addEventListener("click", () => {
        const alreadyOwned = state.ownedBackgrounds.includes(id);

        if (!alreadyOwned) {
          if (state.dust < background.price) {
            return;
          }

          state.dust -= background.price;
          state.ownedBackgrounds.push(id);
        }

        state.equippedBackground = id;

        applyShopBackground();

        triggerUfoEvent();

        save();

        renderShop();

        if (typeof onChange === "function") {
          onChange();
        }
      });

      // Assemble card
      card.append(image, name, price, button);

      backgroundList.appendChild(card);
    }
  }

  applyShopBackground();
  renderShop();

  return {
    render: renderShop,
  };
}
