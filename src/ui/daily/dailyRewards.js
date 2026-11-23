import { DAILY_REWARDS, REWARD_ICONS } from "../../config/dailyrewards.js";

import { checkDailyCount, claimDaily } from "../../core/offline.js";

import { assetUrl } from "../../config/paths.js";
import { save } from "../../storage/save.js";

const list = document.getElementById("dailyRewardList");
const claimButton = document.getElementById("dailyClaimButton");

const totalDays = Object.keys(DAILY_REWARDS).length;

let isInitialized = false;
let onChangeCallback = () => {};

function createRewardRow(key, value, preview = false) {
  const row = document.createElement("div");
  row.classList.add(preview ? "daily-preview-reward" : "daily-reward-row");

  const icon = document.createElement("img");
  icon.classList.add("daily-reward-icon");
  icon.src = assetUrl(REWARD_ICONS[key]);
  icon.alt = "";

  const amount = document.createElement("span");
  amount.classList.add("daily-reward-amount");
  amount.textContent = `+${Number(value).toLocaleString("en-US")}`;

  const label = document.createElement("span");
  label.classList.add("daily-reward-type");
  label.textContent = key.charAt(0).toUpperCase() + key.slice(1);

  row.append(icon, label, amount);

  return row;
}

function createRewardCard(id, reward) {
  const card = document.createElement("article");
  card.classList.add("daily-reward-card");
  card.dataset.id = id;

  const header = document.createElement("div");
  header.classList.add("daily-card-header");

  const day = document.createElement("span");
  day.classList.add("daily-card-day");
  day.textContent = `DAY ${Number(id) + 1}`;

  const status = document.createElement("span");
  status.classList.add("daily-card-status");

  header.append(day, status);

  const rewards = document.createElement("div");
  rewards.classList.add("daily-card-rewards");

  for (const [key, value] of Object.entries(reward)) {
    rewards.appendChild(createRewardRow(key, value));
  }

  card.append(header, rewards);

  return card;
}

function renderCurrentReward(todayIndex, canClaim) {
  const badge = document.getElementById("dailyCurrentDayBadge");
  const readyBadge = document.getElementById("dailyReadyBadge");
  const preview = document.getElementById("dailyRewardPreview");

  if (!badge || !readyBadge || !preview) return;

  const rewardEntries = Object.entries(DAILY_REWARDS);

  if (!rewardEntries.length) return;

  const safeIndex = Math.max(0, Math.min(todayIndex, rewardEntries.length - 1));

  const [id, reward] = rewardEntries[safeIndex];
  const dayNumber = Number(id) + 1;

  badge.textContent = `TODAY'S LITTLE GIFT · DAY ${dayNumber}`;

  readyBadge.textContent = canClaim
    ? `DAY ${dayNumber} IS READY`
    : `DAY ${dayNumber} COLLECTED`;

  preview.replaceChildren();

  for (const [key, value] of Object.entries(reward)) {
    preview.appendChild(createRewardRow(key, value, true));
  }

  const previewDay = document.getElementById("dailyPreviewDay");

  if (previewDay) {
    previewDay.textContent = `DAY ${dayNumber}`;
  }
}

function renderProgress(claimedCount) {
  const count = document.getElementById("dailyProgressCount");
  const fill = document.getElementById("dailyProgressFill");

  const safeCount = Math.min(claimedCount, totalDays);

  if (count) {
    count.textContent = `${safeCount} of ${totalDays} rewards collected`;
  }

  if (fill) {
    fill.style.width = `${(safeCount / totalDays) * 100}%`;
  }
}

export function initDailyPage(onChange = () => {}) {
  if (!list || !claimButton) {
    console.error("Daily rewards page elements not found!");
    return;
  }

  onChangeCallback = onChange;

  if (isInitialized) {
    renderDailyList();
    return;
  }

  list.replaceChildren();

  for (const [id, reward] of Object.entries(DAILY_REWARDS)) {
    list.appendChild(createRewardCard(id, reward));
  }

  claimButton.addEventListener("click", handleClaim);

  isInitialized = true;

  renderDailyList();
}

function handleClaim() {
  const result = claimDaily();

  if (!result.ok) return;

  save();

  renderDailyList();
  onChangeCallback();
}

export function renderDailyList() {
  if (!list) return;

  const { claimedCount, todayIndex, canClaim } = checkDailyCount();

  for (const card of list.children) {
    const index = Number(card.dataset.id);

    const claimed = index < claimedCount;
    const today = index === todayIndex && !claimed;
    const future = !claimed && !today;

    card.classList.toggle("is-claimed", claimed);
    card.classList.toggle("is-today", today);
    card.classList.toggle("is-future", future);

    const status = card.querySelector(".daily-card-status");

    if (status) {
      status.textContent = claimed
        ? "Collected"
        : today
          ? "Today"
          : "Coming up";
    }
  }

  renderProgress(claimedCount);
  renderCurrentReward(todayIndex, canClaim);

  claimButton.disabled = !canClaim;

  if (canClaim) {
    claimButton.textContent = "Claim my reward";
  } else if (claimedCount >= totalDays) {
    claimButton.textContent = "All rewards collected!";
  } else {
    claimButton.textContent = "Already collected";
  }
}
