import { SKINS } from "../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../config/paths.js";

const POOL_SIZE = 6;
const list = document.getElementById("boxPoolList");
const tpl = document.getElementById("boxPoolCardTpl");

function createCard(id, skin) {
  const card = tpl.content.firstElementChild.cloneNode(true);
  card.dataset.id = id;

  card.classList.add(`rarity-${skin.rarity}`);

  const image = card.querySelector(".pool-card-img");
  image.style.backgroundImage = `url("${assetUrl(skin.img)}")`;
  image.style.backgroundSize = skinBackgroundSize(skin);

  card.querySelector(".pool-card-name").textContent = skin.name;
  card.querySelector(".pool-card-rarity").textContent = skin.rarity;

  list.appendChild(card);
}

export function initBoxPoolList() {
  if (!list) {
    console.error("Generator list not found!");
    return;
  }
  const pool = Object.entries(SKINS).filter(
    ([id, skin]) => id !== "default" && skin.rarity !== "secret",
  );

  const picked = shuffle(pool).slice(0, POOL_SIZE);
  for (const [id, skin] of picked) createCard(id, skin);
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
