import { state } from "../../core/state.js";
import { SKINS } from "../../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../../config/paths.js";

const rarities = ["all", "common", "rare", "epic", "legendary"];

let selectedRarity = "all";

export function initSkinsModal() {
  const skinsView = document.querySelector('[data-view="skins"]');
  const skinsList = document.getElementById("ownedSkinsList");

  if (!skinsView || !skinsList) {
    console.error("Skins view elements not found!");
    return;
  }

  const rarityButtons = skinsView.querySelectorAll(".rarity-button");

  function updateRarityButtons() {
    rarityButtons.forEach((button) => {
      const isActive = button.dataset.rarity === selectedRarity;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  rarityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const rarity = button.dataset.rarity;

      if (!rarities.includes(rarity)) return;

      selectedRarity = rarity;

      updateRarityButtons();
      renderSkins(skinsList);
    });
  });

  document.querySelectorAll('[data-nav="skins"]').forEach((button) => {
    button.addEventListener("click", () => {
      renderSkins(skinsList);
    });
  });

  updateRarityButtons();
  renderSkins(skinsList);
}

function renderSkins(container) {
  container.replaceChildren();

  const entries = Object.entries(SKINS).filter(([, skin]) => {
    if (skin.rarity === "secret") return false;

    return selectedRarity === "all" || skin.rarity === selectedRarity;
  });

  if (entries.length === 0) {
    const message = document.createElement("p");
    message.classList.add("no-owned-skins");
    message.textContent =
      selectedRarity === "all"
        ? "No skins found."
        : `No ${selectedRarity} skins found.`;

    container.appendChild(message);
    return;
  }

  const ownedSkins = state.ownedSkins ?? [];
  const equippedSkin = state.equippedSkin ?? "default";

  for (const [skinId, skin] of entries) {
    const imageUrl = assetUrl(skin.img);

    const skinName = skin.name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ");

    const isOwned = ownedSkins.includes(skinId);
    const isEquipped = equippedSkin === skinId;

    const card = document.createElement("div");
    card.classList.add("owned-skin-card");
    card.classList.toggle("equipped", isEquipped);

    const previewSection = document.createElement("div");
    previewSection.classList.add(
      "owned-skin-preview-section",
      `rarity-${skin.rarity}`,
    );

    const preview = document.createElement("div");
    preview.classList.add("owned-skin-preview");

    preview.style.backgroundImage = `url("${imageUrl}")`;
    preview.style.backgroundPosition = "0 0";
    preview.style.backgroundSize = skinBackgroundSize(skin);
    preview.style.backgroundRepeat = "no-repeat";

    if (!isOwned) {
      preview.classList.add("skin-locked");
    }

    const rarity = document.createElement("span");
    rarity.classList.add("owned-skin-rarity");
    rarity.textContent =
      skin.rarity.charAt(0).toUpperCase() + skin.rarity.slice(1);

    previewSection.append(preview, rarity);

    const infoSection = document.createElement("div");
    infoSection.classList.add("owned-skin-info");

    const infoTop = document.createElement("div");
    infoTop.classList.add("owned-skin-info-top");

    const name = document.createElement("p");
    name.classList.add("owned-skin-name");
    name.textContent = isOwned ? skinName : "???";

    const status = document.createElement("span");
    status.classList.add("owned-skin-status");

    if (isOwned) {
      status.textContent = "OWNED";
    } else {
      status.textContent = "NOT OWNED";
      status.classList.add("locked-status");
    }

    infoTop.append(name, status);

    const equipButton = document.createElement("button");
    equipButton.type = "button";
    equipButton.classList.add("btn", "equip-skin-btn");

    if (!isOwned) {
      equipButton.textContent = "Locked";
      equipButton.disabled = true;
      equipButton.classList.add("locked");
    } else if (isEquipped) {
      equipButton.textContent = "Equipped";
      equipButton.disabled = true;
      equipButton.classList.add("currently-equipped");
    } else {
      equipButton.textContent = "Equip";
      equipButton.classList.add("available");
    }

    infoSection.append(infoTop, equipButton);
    card.append(previewSection, infoSection);

    equipButton.addEventListener("click", (event) => {
      event.stopPropagation();

      if (!isOwned || isEquipped) return;

      state.equippedSkin = skinId;

      window.dispatchEvent(
        new CustomEvent("skinSelected", {
          detail: { skinId, imageUrl },
        }),
      );

      renderSkins(container);
    });

    container.appendChild(card);
  }
}
