import { state } from "./state.js";
import { ACHIEVEMENTS } from "../config/achievements.js";
import { SKINS } from "../config/skins.js";

const STATS = {
  totalClicks: () => state.stats.totalClicks,
  boxesOpened: () => state.stats.boxesOpened,
  totalTreats: () => state.stats.totalTreats,
  skinsOwned: () => state.ownedSkins.length,
  legendaryOwned: () =>
    state.ownedSkins.filter((id) => SKINS[id]?.rarity === "legendary").length,
  dailyStreak: () => state.dailyStreak,
};

export function getStat(name) {
  return STATS[name]?.() ?? 0;
}

export function checkAchievements() {
  const unlocked = [];

  for (const a of ACHIEVEMENTS) {
    if (state.achievements.includes(a.id)) {
      continue;
    }
    if (getStat(a.stat) < a.target) {
      continue;
    }
    state.achievements.push(a.id);
    if (a.reward) {
      for (const [key, amount] of Object.entries(a.reward)) {
        state[key] += amount;
      }
    }
    unlocked.push(a);
  }

  return unlocked;
}
