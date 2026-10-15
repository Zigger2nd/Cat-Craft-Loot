import { state } from "../core/state.js";
import { GENERATORS } from "../config/generators.js";

import { getGeneratorCost, buyGenerator } from "../core/economy.js";

const list = document.getElementById("generatorList");

export function initGenerators(onChange) {
  if (!list) {
    console.error("Generator list not found!");
    return;
  }

  for (const [id, generator] of Object.entries(GENERATORS)) {
    const button = document.createElement("button");

    button.dataset.id = id;

    const image = document.createElement("img");

    image.src = generator.image;
    image.alt = generator.name;
    image.classList.add("generator-img");

    const info = document.createElement("span");

    info.classList.add("generator-info");

    button.appendChild(image);
    button.appendChild(info);

    button.addEventListener("click", () => {
      const purchased = buyGenerator(id);

      if (purchased) {
        onChange();
      }
    });

    list.appendChild(button);
  }

  renderGenerators();
}

export function renderGenerators() {
  if (!list) {
    return;
  }

  for (const button of list.children) {
    const id = button.dataset.id;
    const generator = GENERATORS[id];

    const level = state.generators[id] ?? 0;
    const cost = getGeneratorCost(id);

    const info = button.querySelector(".generator-info");

    info.textContent = `${generator.name} (${level}) - Cost: ${cost}`;

    button.disabled = state.treats < cost;
  }
}
