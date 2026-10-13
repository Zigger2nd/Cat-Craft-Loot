import { state } from '../core/state.js';

const NUMBER_FIELDS = [
    'treats',
    'dust',
    'energy',
    'clickLevel'
];

export function save() {

    if (NUMBER_FIELDS.some(field => !Number.isFinite(state[field]))) {
        return;
    }

    state.lastSeen = Date.now();

    localStorage.setItem('save', JSON.stringify(state));

}

export function load() {

    try {

        const savedData = JSON.parse(localStorage.getItem('save'));

        if (savedData && typeof savedData === 'object') {

            Object.assign(state, savedData);

        }

    } catch (error) {

        console.error('Could not load saved game:', error);

    }


    for (const field of NUMBER_FIELDS) {

        const value = Number(state[field]);

        state[field] = Number.isFinite(value) ? value : 0;

    }

    if (!state.generators || typeof state.generators !== 'object') {

        state.generators = {};

    }

    for (const id of ['toy', 'bowl', 'tower']) {

        const level = Number(state.generators[id] ?? 0);

        state.generators[id] =
            Number.isInteger(level) && level >= 0 ? level : 0;

    }

}