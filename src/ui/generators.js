import { state } from "../core/state.js";
import { GENERATORS } from "../config/generators.js";
import { getGeneratorCost, buyGenerator } from "../core/economy.js";
import { save } from "../storage/save.js";

const list = document.getElementById("generatorList");

export function initGenerators(onChange) {
  if (!list) {
    console.error("Generator list not found!");
    return;
  }

  list.innerHTML = "";

  for (const [id, generator] of Object.entries(GENERATORS)) {
    const row = document.createElement("div");
    row.classList.add("generator-row");

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("generator-button");
    button.dataset.id = id;

    const image = document.createElement("img");
    image.src = generator.image;
    image.alt = generator.name;
    image.classList.add("generator-img");

    const info = document.createElement("div");
    info.classList.add("generator-info");

    const name = document.createElement("h4");
    name.classList.add("generator-name");
    name.textContent = generator.name;

    const costInfo = document.createElement("div");
    costInfo.classList.add("cost-info");

    const costText = document.createElement("p");
    costText.append("Cost: ");

    const cost = document.createElement("span");
    cost.classList.add("generator-cost");

    costText.appendChild(cost);

    const foodImage = document.createElement("img");
    foodImage.src = "/skins/food.png";
    foodImage.alt = "Treats";
    foodImage.classList.add("food-img");

    costInfo.appendChild(costText);
    costInfo.appendChild(foodImage);

    info.appendChild(name);
    info.appendChild(costInfo);

    const level = document.createElement("div");
    level.classList.add("generator-level");
    level.append("Level ");

    const levelCount = document.createElement("span");
    levelCount.classList.add("generator-level-count");

    level.appendChild(levelCount);

    button.appendChild(image);
    button.appendChild(info);
    button.appendChild(level);

    const productionInfo = document.createElement("div");
    productionInfo.classList.add("next-level-info");

    const productionText = document.createElement("p");

    productionText.append("+");

    const cps = document.createElement("span");
    cps.classList.add("generator-cps");

    productionText.appendChild(cps);
    productionText.append(" treats");
    productionText.appendChild(document.createElement("br"));
    productionText.append("per second");

    productionInfo.appendChild(productionText);

    row.appendChild(button);
    row.appendChild(productionInfo);

    button.addEventListener("click", () => {
      const purchased = buyGenerator(id);

      if (purchased) {
        save();
        onChange();
      }
    });

    list.appendChild(row);
  }

  renderGenerators();
}

export function renderGenerators() {
  if (!list) return;

  for (const row of list.children) {
    const button = row.querySelector(".generator-button");

    if (!button) continue;

    const id = button.dataset.id;
    const generator = GENERATORS[id];

    if (!generator) continue;

    const level = state.generators[id] ?? 0;
    const cost = getGeneratorCost(id);

    row.querySelector(".generator-cost").textContent = cost;

    row.querySelector(".generator-level-count").textContent = level;

    const nextLevelCps = (level + 1) * generator.cps;

    row.querySelector(".generator-cps").textContent = nextLevelCps.toFixed(1);

    button.disabled = state.treats < cost;
  }
}
