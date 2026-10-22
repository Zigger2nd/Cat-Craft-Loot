import { state } from "../core/state.js";

const BALL_IMAGES = [
  "/skins/balls/ball.png",
  "/skins/balls/ballSmall.png",
  "/skins/balls/ballBlue.png",
  "/skins/balls/ballBlueSmall.png",
  "/skins/balls/ballSky.png",
  "/skins/balls/ballSkySmall.png",
  "/skins/balls/ballYellow.png",
  "/skins/balls/ballYellowSmall.png",
];

export function renderBallGenerator() {
  const container = document.getElementById("generatorBalls");

  if (!container) {
    return;
  }

  const amount = Math.max(0, Math.floor(Number(state.generators?.toy) || 0));

  const visibleAmount = Math.min(amount, 12);

  const currentAmount = Number(container.dataset.amount ?? 0);

  if (currentAmount === visibleAmount) {
    return;
  }

  container.dataset.amount = String(visibleAmount);

  while (container.children.length > visibleAmount) {
    container.lastElementChild.remove();
  }

  while (container.children.length < visibleAmount) {
    const ball = document.createElement("img");

    const randomIndex = Math.floor(Math.random() * BALL_IMAGES.length);

    ball.src = BALL_IMAGES[randomIndex];
    ball.alt = "Ball toy";
    ball.className = "generator-ball";

    container.appendChild(ball);
  }
}
