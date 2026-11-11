import { state } from "../core/state.js";
import { GENERATORS } from "../config/generators.js";
import {
  getGeneratorCost,
  buyGenerator,
  getGeneratorCps,
  buyClick,
  getClickCost,
  getClickPower,
} from "../core/economy.js";
import { assetUrl } from "../config/paths.js";
import { save } from "../storage/save.js";
import { initContainerItems } from "./container/containerItems.js";

const list = document.getElementById("generatorList");
const tpl = document.getElementById("generatorCardTpl");

const generatorSounds = {
  toy: new Audio(assetUrl("/sounds/toy2.mp3")),
  bowl: new Audio(assetUrl("/sounds/bowl2.mp3")),
  bed: new Audio(assetUrl("/sounds/sleep.mp3")),
};

function createCard(id, name, image, onBuy) {
  const card = tpl.content.firstElementChild.cloneNode(true);
  card.dataset.id = id;

  card.querySelector(".gen-img").src = assetUrl(image);
  card.querySelector(".gen-name").textContent = name;
  card.querySelector(".gen-buy").addEventListener("click", onBuy);
  list.appendChild(card);
}

export function initGenerators(onChange) {
  if (!list) {
    console.error("Generator list not found!");
    return;
  }

  list.innerHTML = "";

  createCard("click", "Clicker", "/skins/click.png", () => {
    if (!buyClick()) return;
    save();
    onChange();
    renderGenerators();
  });

  for (const [id, generator] of Object.entries(GENERATORS)) {
    createCard(id, generator.name, generator.image, () => {
      const purchased = buyGenerator(id);

      if (!purchased) {
        return;
      }

      const sound = generatorSounds[id];

      if (sound) {
        sound.currentTime = 0;

        sound.play().catch((error) => {
          console.warn("Could not play generator sound:", error);
        });
      }

      initContainerItems();

      if (typeof onChange === "function") {
        onChange();
      }

      renderGenerators();
    });
  }

  renderGenerators();
}

export function renderGenerators() {
  if (!list) {
    return;
  }

  for (const card of list.querySelectorAll(".gen-card")) {
    const id = card.dataset.id;

    let level, cost, effectText;

    if (id === "click") {
      level = state.clickLevel;
      cost = getClickCost();
      effectText = `+${getClickPower().toLocaleString("en-US", { maximumFractionDigits: 1 })} treats / click`;
    } else {
      level = state.generators[id] ?? 0;
      cost = getGeneratorCost(id);
      const totalCps = level * getGeneratorCps(id);
      effectText = `+${totalCps.toLocaleString("en-US", { maximumFractionDigits: 1 })} treats / sec`;
    }

    card.querySelector(".gen-level").textContent = `LV. ${level}`;
    card.querySelector(".gen-cost").textContent = cost.toLocaleString("en-US");
    card.querySelector(".gen-cps").textContent = effectText;
    card.querySelector(".gen-buy").disabled = state.treats < cost;
  }
}
