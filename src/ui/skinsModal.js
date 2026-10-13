import { state } from '../core/state.js';
import { SKINS } from '../config/skins.js';

export function initSkinsModal() {
    const modal = document.getElementById('skinsModal');
    const openButton = document.getElementById('openSkinsBtn');
    const closeButton = document.getElementById('closeSkinsBtn');
    const skinsList = document.getElementById('ownedSkinsList');

    if (!modal || !openButton || !closeButton || !skinsList) {
        console.error(
            'Skins modal elements not found!',
            {
                modal,
                openButton,
                closeButton,
                skinsList
            }
        );

        return;
    }

    openButton.addEventListener('click', () => {
        renderOwnedSkins(skinsList);

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');

        closeButton.focus();
    });

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');

        openButton.focus();
    }

    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            modal.classList.contains('open')
        ) {
            closeModal();
        }
    });
}

function renderOwnedSkins(container) {
    container.replaceChildren();

    const ownedSkins = state.ownedSkins ?? [];

    if (ownedSkins.length === 0) {
        const message = document.createElement('p');

        message.classList.add('no-owned-skins');
        message.textContent = 'You do not own any skins yet.';

        container.appendChild(message);

        return;
    }

    let displayedSkins = 0;

    for (const skinId of ownedSkins) {
        const skin = SKINS[skinId];

        if (!skin) {
            console.warn(
                `Skin "${skinId}" was not found in the SKINS catalogue.`
            );

            continue;
        }

        const card = document.createElement('div');
        card.classList.add('owned-skin-card');

        const preview = document.createElement('img');
        preview.classList.add('owned-skin-preview');

        preview.src = skin.image;
        preview.alt = skin.name ?? skinId;
        preview.loading = 'lazy';

        preview.addEventListener('error', () => {
            console.error(
                `Failed to load image for skin "${skinId}".`,
                'Image path:',
                skin.image
            );

            preview.alt = 'Skin image could not be loaded';
            preview.classList.add('skin-image-error');
        });

        const name = document.createElement('p');
        name.textContent = skin.name ?? skinId;

        const rarity = document.createElement('span');

        if (skin.rarity) {
            rarity.classList.add('owned-skin-rarity');
            rarity.textContent = skin.rarity;
        }

        card.appendChild(preview);
        card.appendChild(name);

        if (skin.rarity) {
            card.appendChild(rarity);
        }

        container.appendChild(card);

        displayedSkins++;
    }

    if (displayedSkins === 0) {
        const message = document.createElement('p');

        message.classList.add('no-owned-skins');
        message.textContent = 'No available skin previews.';

        container.appendChild(message);
    }
}