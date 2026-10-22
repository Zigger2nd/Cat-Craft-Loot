import { state } from "../../core/state.js";

const BED_IMAGES = [
  "/skins/beds/bedBlue.png",
  "/skins/beds/bedGreen.png",
  "/skins/beds/bedRed.png",
  "/skins/beds/bedGrey.png",
];

export function renderBedGenerator() {
  const container = document.getElementById("generatorBeds");

  if (!container) return;

  const amount = Math.max(0, Math.floor(Number(state.generators?.bed) || 0));

  const visibleAmount = Math.min(amount, 12);

  const currentAmount = Number(container.dataset.amount ?? 0);

  if (currentAmount === visibleAmount) return;

  container.dataset.amount = String(visibleAmount);

  while (container.children.length > visibleAmount) {
    container.lastElementChild.remove();
  }

  while (container.children.length < visibleAmount) {
    const bed = document.createElement("img");

    const randomIndex = Math.floor(Math.random() * BED_IMAGES.length);

    bed.src = BED_IMAGES[randomIndex];
    bed.alt = "Bed generator";
    bed.className = "generator-bed";

    container.appendChild(bed);
  }
}
