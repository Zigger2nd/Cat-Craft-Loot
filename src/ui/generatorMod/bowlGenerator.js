import { state } from "../../core/state.js";

const BOWL_IMAGES = [
  "/skins/bowls/bowlBlue.png",
  "/skins/bowls/bowlGreen.png",
  "/skins/bowls/bowlRed.png",
  "/skins/bowls/bowlSky.png",
  "/skins/bowls/bowlWhite.png",
  "/skins/bowls/bowlYellow.png",
];

export function renderBowlGenerator() {
  const container = document.getElementById("generatorBowls");

  if (!container) return;

  const amount = Math.max(0, Math.floor(Number(state.generators?.bowl) || 0));

  const visibleAmount = Math.min(amount, 12);

  const currentAmount = Number(container.dataset.amount ?? 0);

  if (currentAmount === visibleAmount) return;

  container.dataset.amount = String(visibleAmount);

  while (container.children.length > visibleAmount) {
    container.lastElementChild.remove();
  }

  while (container.children.length < visibleAmount) {
    const bowl = document.createElement("img");

    const randomIndex = Math.floor(Math.random() * BOWL_IMAGES.length);

    bowl.src = BOWL_IMAGES[randomIndex];
    bowl.alt = "Bowl generator";
    bowl.className = "generator-bowl";

    container.appendChild(bowl);
  }
}
