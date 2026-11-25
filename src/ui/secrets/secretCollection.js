import { state } from "../../core/state.js";
import { SKINS } from "../../config/skins.js";
import { assetUrl, skinBackgroundSize } from "../../config/paths.js";

const HINT_COST = 25;

const SECRET_HINTS = {
  secretCat:
    "Not everything is as ordinary as it seems. Keep your eyes open and look for something unusual.",

  alienCat:
    "When the forest lights up at night, something mysterious might appear in the sky.",
};

export function initSecretCatsPage(options = {}) {
  const secretsView = document.querySelector('[data-view="secrets"]');
  const secretsList = document.getElementById("secretCatsList");

  if (!secretsView || !secretsList) {
    console.error("Secret Cats page elements not found!");
    return;
  }

  state.secretHints ??= {};

  const secretsNav = document.querySelectorAll('[data-nav="secrets"]');

  secretsNav.forEach((button) => {
    button.addEventListener("click", () => {
      renderSecretCats(secretsList, options);
    });
  });

  renderSecretCats(secretsList, options);
}

function renderSecretCats(container, options = {}) {
  container.replaceChildren();

  const entries = Object.entries(SKINS).filter(
    ([, skin]) => skin.rarity === "secret",
  );

  const ownedSkins = state.ownedSkins ?? [];
  const equippedSkin = state.equippedSkin ?? "default";

  const discoveredCount = entries.filter(([skinId]) =>
    ownedSkins.includes(skinId),
  ).length;

  const totalCount = entries.length;

  const overallProgress = totalCount
    ? Math.round((discoveredCount / totalCount) * 100)
    : 0;

  updateDiscoveryProgress(discoveredCount, totalCount, overallProgress);

  updateDustCount();

  if (entries.length === 0) {
    const message = document.createElement("p");
    message.classList.add("no-owned-skins");
    message.textContent = "No secret cats found.";

    container.appendChild(message);
    return;
  }

  for (const [skinId, skin] of entries) {
    const imageUrl = assetUrl(skin.img);

    const skinName = skin.name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ");

    const isDiscovered = ownedSkins.includes(skinId);
    const isEquipped = equippedSkin === skinId;

    const hint = state.secretHints[skinId];

    const card = document.createElement("div");

    card.classList.add("secret-skin-card");
    card.classList.add(isDiscovered ? "discovered" : "locked");

    const previewSection = document.createElement("div");
    previewSection.classList.add("secret-skin-preview");

    const discoveryStatus = document.createElement("div");
    discoveryStatus.classList.add("secret-skin-discovery-status");

    const badge = document.createElement("span");
    badge.classList.add("secret-skin-badge");

    const badgeText = document.createElement("span");
    badgeText.textContent = isDiscovered ? "DISCOVERED" : "UNDISCOVERED";

    badge.appendChild(badgeText);
    discoveryStatus.appendChild(badge);

    const preview = createSecretPreview(skin, imageUrl);
    preview.classList.add("secret-skin-portrait");

    if (!isDiscovered) {
      preview.classList.add("skin-locked");
    }

    previewSection.append(discoveryStatus, preview);

    const infoSection = document.createElement("div");
    infoSection.classList.add("secret-skin-info");

    const name = document.createElement("p");
    name.classList.add("secret-skin-name");
    name.textContent = isDiscovered ? skinName : "???";

    const { current, total } = getSecretProgress(skinId);

    const progressSection = document.createElement("div");
    progressSection.classList.add("secret-skin-progress");

    const progressLabel = document.createElement("p");
    progressLabel.classList.add("secret-skin-progress-label");
    progressLabel.textContent = `Discovery progress: ${current}/${total}`;

    const progressTrack = document.createElement("div");
    progressTrack.classList.add("secret-skin-progress-track");

    const progressFill = document.createElement("div");
    progressFill.classList.add("secret-skin-progress-fill");

    const progressPercentage = Math.min((current / total) * 100, 100);

    progressFill.style.width = `${progressPercentage}%`;

    progressTrack.appendChild(progressFill);

    progressSection.append(progressLabel, progressTrack);

    const actionButton = document.createElement("button");

    actionButton.type = "button";
    actionButton.classList.add(
      "btn",
      "btn-block",
      "btn-status",
      "secret-skin-action",
    );

    if (!isDiscovered) {
      actionButton.textContent = hint ? "Hint Revealed" : "Reveal Hint";

      if (hint) {
        // same look as "Locked" on the Skins page
        actionButton.disabled = true;
        actionButton.classList.add("btn-muted");
      } else {
        actionButton.classList.add("btn-primary");

        // .btn is a flex row: its gap separates the two parts, a leading space would be trimmed
        const cost = document.createElement("span");
        cost.textContent = `· ${HINT_COST} Dust`;

        actionButton.appendChild(cost);

        actionButton.addEventListener("click", (event) => {
          event.stopPropagation();

          revealHint(skinId, container, options);
        });
      }
    } else if (isEquipped) {
      actionButton.textContent = "Equipped";
      actionButton.disabled = true;
      actionButton.classList.add("btn-primary");
    } else {
      actionButton.classList.add("btn-secondary");
      actionButton.textContent = "Equip";

      actionButton.addEventListener("click", (event) => {
        event.stopPropagation();

        equipSecretSkin(skinId, skin, container, options);
      });
    }

    infoSection.append(name, progressSection, actionButton);

    if (!isDiscovered && hint) {
      const hintSection = document.createElement("div");
      hintSection.classList.add("secret-cat-hint");

      const hintTitle = document.createElement("span");
      hintTitle.textContent = "Your hint";

      const hintText = document.createElement("p");
      hintText.textContent = hint;

      hintSection.append(hintTitle, hintText);

      card.append(previewSection, infoSection, hintSection);
    } else {
      card.append(previewSection, infoSection);
    }

    container.appendChild(card);
  }
}

function getSecretProgress(skinId) {
  if (skinId === "secretCat") {
    const current = Math.min(state.foundSecretCats?.length ?? 0, 10);

    return {
      current,
      total: 10,
    };
  }

  if (skinId === "alienCat") {
    return {
      current: state.ufoEventCompleted ? 1 : 0,
      total: 1,
    };
  }

  return {
    current: 0,
    total: 1,
  };
}

function createSecretPreview(skin, imageUrl) {
  if (skin.img.toLowerCase().endsWith(".gif")) {
    const preview = document.createElement("img");

    preview.src = imageUrl;
    preview.alt = skin.name;

    return preview;
  }

  const preview = document.createElement("div");

  preview.style.backgroundImage = `url("${imageUrl}")`;
  preview.style.backgroundPosition = "0 0";
  preview.style.backgroundSize = skinBackgroundSize(skin);
  preview.style.backgroundRepeat = "no-repeat";

  return preview;
}

function updateDiscoveryProgress(discovered, total, progress) {
  const countElement = document.getElementById("secretDiscoveredCount");
  const progressText = document.getElementById("secretProgressText");
  const progressBar = document.getElementById("secretProgressBar");

  if (countElement) {
    countElement.textContent = `${discovered}/${total}`;
  }

  if (progressText) {
    progressText.textContent = `${progress}%`;
  }

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

function updateDustCount() {
  const dustElement = document.getElementById("secretDustCount");

  if (dustElement) {
    dustElement.textContent = Math.floor(state.dust ?? 0);
  }
}

function revealHint(skinId, container, options = {}) {
  state.secretHints ??= {};

  if (state.secretHints[skinId]) {
    return;
  }

  if ((state.dust ?? 0) < HINT_COST) {
    showFeedback(`You need ${HINT_COST} Dust to reveal a hint.`);
    return;
  }

  const hint = SECRET_HINTS[skinId];

  if (!hint) {
    showFeedback("No hint is available for this cat yet.");
    return;
  }

  state.dust -= HINT_COST;
  state.secretHints[skinId] = hint;

  saveProgress(options);

  renderSecretCats(container, options);

  showFeedback(`You spent ${HINT_COST} Dust and revealed a hint!`);
}

function equipSecretSkin(skinId, skin, container, options = {}) {
  if (!(state.ownedSkins ?? []).includes(skinId)) {
    return;
  }

  const imageUrl = assetUrl(skin.img);

  state.equippedSkin = skinId;

  saveProgress(options);

  window.dispatchEvent(
    new CustomEvent("skinSelected", {
      detail: {
        skinId,
        imageUrl,
      },
    }),
  );

  renderSecretCats(container, options);

  showFeedback(`${skin.name} is now equipped!`);
}

function saveProgress(options = {}) {
  if (typeof options.saveGame === "function") {
    options.saveGame();
    return;
  }

  if (typeof window.debugSaveGame === "function") {
    window.debugSaveGame();
  }
}

function showFeedback(message) {
  const feedback = document.getElementById("secretPageFeedback");

  if (!feedback) return;

  feedback.textContent = message;
}
