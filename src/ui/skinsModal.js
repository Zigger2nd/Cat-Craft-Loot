import { state } from "../core/state.js";

const skinImages = {
  common: import.meta.glob("/public/skins/cats/common/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),

  rare: import.meta.glob("/public/skins/cats/rare/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),

  epic: import.meta.glob("/public/skins/cats/epic/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),

  legendary: import.meta.glob("/public/skins/cats/legendary/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),
};

const rarities = ["common", "rare", "epic", "legendary"];

let selectedRarity = "common";

export function initSkinsModal() {
  const modal = document.getElementById("skinsModal");
  const openButton = document.getElementById("openSkinsBtn");
  const closeButton = document.getElementById("closeSkinsBtn");
  const skinsList = document.getElementById("ownedSkinsList");
  const rarityButtons = document.querySelectorAll(".rarity-button");

  if (!modal || !openButton || !closeButton || !skinsList) {
    console.error("Skins modal elements not found!");
    return;
  }

  openButton.addEventListener("click", () => {
    renderSkins(skinsList);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    closeButton.focus();
  });

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    openButton.focus();
  }

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  rarityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const rarity = button.dataset.rarity;

      if (!rarities.includes(rarity)) {
        return;
      }

      selectedRarity = rarity;

      rarityButtons.forEach((item) => {
        const isActive = item === button;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      renderSkins(skinsList);
    });
  });

  rarityButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.rarity === selectedRarity),
    );
  });
}

function renderSkins(container) {
  container.replaceChildren();

  const images = skinImages[selectedRarity] ?? {};
  const imageEntries = Object.entries(images);

  if (imageEntries.length === 0) {
    const message = document.createElement("p");

    message.classList.add("no-owned-skins");
    message.textContent = `No ${selectedRarity} skins found.`;

    container.appendChild(message);
    return;
  }

  const ownedSkins = state.ownedSkins ?? [];
  const equippedSkin = state.equippedSkin ?? "catOrigin";

  for (const [filePath, imageUrl] of imageEntries) {
    const filename = filePath.split("/").pop();
    const skinId = filename.replace(/\.png$/i, "");

    const skinName = skinId
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ");

    const isOwned = ownedSkins.includes(skinId);
    const isEquipped = equippedSkin === skinId;

    const card = document.createElement("button");

    card.type = "button";
    card.classList.add("owned-skin-card");
    card.classList.toggle("equipped", isEquipped);
    card.disabled = !isOwned;

    card.setAttribute(
      "aria-label",
      isOwned ? `Equip ${skinName}` : "Locked skin",
    );

    if (isEquipped) {
      card.setAttribute("aria-pressed", "true");
    } else {
      card.setAttribute("aria-pressed", "false");
    }

    const preview = document.createElement("div");

    preview.classList.add("owned-skin-preview");
    preview.style.backgroundImage = `url("${imageUrl}")`;
    preview.style.backgroundPosition = "0 0";
    preview.style.backgroundSize = "300% 400%";
    preview.style.backgroundRepeat = "no-repeat";

    if (!isOwned) {
      preview.classList.add("skin-locked");
    }

    const name = document.createElement("p");
    name.textContent = isOwned ? skinName : "???";

    const rarity = document.createElement("span");

    rarity.classList.add("owned-skin-rarity");
    rarity.textContent =
      selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1);

    card.appendChild(preview);
    card.appendChild(name);
    card.appendChild(rarity);

    if (isOwned) {
      card.addEventListener("click", () => {
        state.equippedSkin = skinId;

        window.dispatchEvent(
          new CustomEvent("skinSelected", {
            detail: {
              skinId,
              imageUrl,
            },
          }),
        );

        renderSkins(container);
      });
    }

    container.appendChild(card);
  }
}
