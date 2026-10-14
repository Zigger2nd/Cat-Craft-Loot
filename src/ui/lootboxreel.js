import { SKINS } from "../config/skins.js";
import { rollSkin } from "../loot/lootBox.js";

const ribbon = document.querySelector(".lootbox-ribbon");

export function buildReelIds(winnerId) {
  const lootBoxReel = [];

  for (let i = 0; i < 45; i++) {
    lootBoxReel.push(i === 35 ? winnerId : rollSkin());
  }
  return lootBoxReel;
}

function createCard(id) {
  const skin = SKINS[id];
  const card = document.createElement("div");

  card.dataset.id = id;
  const image = document.createElement("div");

  image.classList.add("card-img");
  image.style.backgroundImage = `url(${skin.img})`;
  card.classList.add("reel-card");
  card.classList.add(`rarity-${skin.rarity}`);
  card.appendChild(image);

  return card;
}

export function renderReel(ids) {
  if (!ribbon) {
    return;
  }
  ribbon.innerHTML = "";
  for (const id of ids) {
    const card = createCard(id);
    ribbon.appendChild(card);
  }
}

export function spinReel() {
  const card = document.querySelector(".reel-card");
  const view = document.querySelector(".lootbox-container");

  const targetPosition =
    35 * card.offsetWidth + card.offsetWidth / 2 - view.offsetWidth / 2;

  ribbon.style.transition = "none";
  ribbon.style.transform = "translateX(0)";
  ribbon.offsetWidth;

  console.log(targetPosition, card.offsetWidth, view.offsetWidth);

  ribbon.style.transition = "transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)";
  ribbon.style.transform = `translateX(-${targetPosition}px)`;
}
