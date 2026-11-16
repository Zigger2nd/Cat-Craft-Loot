import { ACHIEVEMENTS } from "../../config/achievements.js";
import { state } from "../../core/state.js";
import { assetUrl } from "../../config/paths.js";
import { getStat } from "../../core/achievements.js";
import { onViewShow } from "../router.js";

const list = document.getElementById("achievementsList");
const tpl = document.getElementById("achievementCardTpl");

let currentFilter = "all";

export function initAchievementsPage() {
  if (!list || !tpl) return;

  for (const item of ACHIEVEMENTS) {
    const card = tpl.content.firstElementChild.cloneNode(true);
    card.dataset.id = item.id;

    card.querySelector(".ach-img").src = assetUrl(item.img);
    card.querySelector(".ach-name").textContent = item.name;
    card.querySelector(".ach-desc").textContent = item.desc;

    const reward = card.querySelector(".ach-reward");
    const [type, amount] = Object.entries(item.reward ?? {})[0] ?? [];
    if (type) {
      card
        .querySelector(".ach-reward-icon")
        .classList.add(`stat-icon--${type}`);
      card.querySelector(".ach-reward-value").textContent = `+${amount}`;
    } else {
      reward.hidden = true;
    }

    list.appendChild(card);
  }
  document.querySelectorAll(".ach-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      currentFilter = tab.dataset.filter;
      renderAchievements();
    });
  });

  onViewShow("achievements", renderAchievements);
}

export function renderAchievements() {
  if (!list) return;

  let doneCount = 0;
  for (const card of list.querySelectorAll(".ach-card")) {
    const a = ACHIEVEMENTS.find((item) => item.id === card.dataset.id);

    const done = state.achievements.includes(a.id);
    const current = Math.min(getStat(a.stat), a.target);

    if (done) doneCount++;

    card.classList.toggle("is-done", done);
    card.querySelector(".ach-status").textContent = done
      ? "Completed"
      : "In progress";
    card.querySelector(".ach-fill").style.width =
      `${(current / a.target) * 100}%`;
    card.querySelector(".ach-progress-text").textContent =
      `${current.toLocaleString("en-US")} / ${a.target.toLocaleString("en-US")} ${a.unit ?? ""}`;

    card.hidden =
      (currentFilter === "done" && !done) ||
      (currentFilter === "progress" && done);
  }

  const total = ACHIEVEMENTS.length;
  const counts = { all: total, progress: total - doneCount, done: doneCount };

  document.querySelectorAll(".ach-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.filter === currentFilter);
    tab.querySelector(".ach-tab-count").textContent =
      counts[tab.dataset.filter];
  });
  document.querySelector(".ach-done-count").textContent = doneCount;

  document.querySelector(".ach-count").textContent = `${doneCount} / ${total}`;
  document.querySelector(".progress-fill--achievements").style.width =
    `${(doneCount / total) * 100}%`;
}
