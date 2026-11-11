import { canClaimDaily } from "../../core/offline.js";

export function renderDailyBanner() {
  const canCLaim = canClaimDaily();

  const banner = document.querySelector(".daily-banner");

  if (banner) {
    banner.hidden = !canCLaim;
  }

  const navDaily = document.querySelector('[data-nav="daily"]');
  if (navDaily) {
    navDaily.classList.toggle("has-badge", canCLaim);
  }
}
