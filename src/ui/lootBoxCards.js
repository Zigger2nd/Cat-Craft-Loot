import { SKINS } from "../config/skins.js";
import { state } from "../core/state.js";
import { pickRarity, rollSkin } from "../loot/lootBox.js";
import { LOOT_WEIGHTS } from "../config/balance.js";

const list = document.getElementById("catCardList");

export function initCatCardsList() {
  if (!list) {
    console.error("Cats list not found");
    return;
  }

  for (const [id, skin] of Object.entries(SKINS)) {
    const card = document.createElement("div");

    card.dataset.id = id;
    const image = document.createElement("div");

    image.classList.add("card-img");
    image.style.backgroundImage = `url(${skin.img})`;
    const info = document.createElement("span");

    info.classList.add("cards-info");

    card.appendChild(image);
    card.appendChild(info);
    list.appendChild(card);
  }
  renderCards();
}

export function renderCards() {
  if (!list) {
    return;
  }

  for (const card of list.children) {
    const id = card.dataset.id;
    const skin = SKINS[id];

    const owned = state.ownedSkins.includes(id);
    card.classList.toggle("locked", !owned);

    const info = card.querySelector(".cards-info");
    info.textContent = owned ? skin.name : "???";
  }
}
