import "./styles2/index.css";
import { initRouter } from "./ui/router.js";
import { load, save } from "./storage/save.js";
import { renderHeader } from "./ui/renderList/header.js";
import { renderHome } from "./ui/renderList/home.js";
import { updateEnergy } from "./loot/energy.js";
import { state } from "./core/state.js";
import { renderRageBar } from "./ui/renderList/rageBar.js";
import { renderCollectionBar } from "./ui/renderList/renderCollection.js";
import { renderDailyBanner } from "./ui/renderList/daily.js";
import { initClick } from "./ui/click/clickCat.js";
import { startGameLoop } from "./core/gameLoop.js";
import { notifyAchievements } from "./core/achievements.js";
import { applyOfflineGains } from "./core/offline.js";
import { initOfflineModal } from "./ui/offline/offlineModal.js";
import { initGenerators, renderGenerators } from "./ui/generators.js";
import { initContainerItems } from "./ui/container/containerItems.js";
import { initCatAnimation } from "./ui/catAnimation.js";
import { initEquipSkin, applyEquippedSkin } from "./ui/skins/equipSkin.js";
import { initBubbleEvents } from "./events/bubbleEvents.js";
import { applyBackground } from "./ui/renderList/scene.js";
import { initUfoEvent, triggerUfoEvent } from "./events/ufoEvent.js";
import { initGoldenCoinEvent } from "./events/goldenCoinEvent.js";
import { initSkinsModal } from "./ui/skins/skinsModal.js";
import { initSecretCatsPage } from "./ui/secrets/secretCollection.js";
import { initIntroductionPage } from "./ui/introduction.js";
import {
  initAchievementsPage,
  renderAchievements,
} from "./ui/achievements/achievementsList.js";
import { initDailyPage } from "./ui/daily/dailyRewards.js";
import { initLootboxFlow } from "./loot/lootboxFlow.js";
import { initBoxPoolList } from "./ui/boxpoollist.js";
import { initShop } from "./ui/shop.js";

function renderAll() {
  renderHeader();
  renderHome();
  renderRageBar();
  renderCollectionBar();
  renderGenerators();
  renderDailyBanner();
  renderAchievements();
}

load();
const offlineGained = applyOfflineGains();
initOfflineModal(offlineGained);
updateEnergy();
renderAll();
initLootboxFlow(renderAll);
initContainerItems();
applyEquippedSkin();
initEquipSkin(renderAll);
applyBackground();
initUfoEvent(renderAll);
initGoldenCoinEvent();
initCatAnimation();
initGenerators(renderAll);
initClick(renderAll);
initSkinsModal(renderAll);
initBoxPoolList();
initAchievementsPage();
initBubbleEvents(() => {
  renderAll();
  notifyAchievements();
});
initSecretCatsPage({
  saveGame: save,
});
initIntroductionPage();
initDailyPage();
initShop(renderAll);

startGameLoop({ render: renderAll, notifyAchievements });
initRouter();
if (import.meta.env.DEV) {
  window.debugGameState = state;
  window.applyBackground = applyBackground;
  window.triggerUfoEvent = triggerUfoEvent;
}

// ############################Save Changes##################################
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    save();
  }
});

window.addEventListener("pagehide", save);
window.addEventListener("beforeunload", save);
