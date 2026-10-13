import { state } from './core/state.js';

import { load, save } from './storage/save.js';

import {
    clickCat,
    buyClick,
    getCps
} from './core/economy.js';

import { render } from './ui/render.js';

import { initGenerators } from './ui/generators.js';

import { initCatAnimation } from './ui/catAnimation.js';

load();

render();


document.getElementById('clickBtn').addEventListener('click', () => {

    clickCat();

    render();

});


document.getElementById('buyClickBtn').addEventListener('click', () => {

    buyClick();

    render();

});

initGenerators(render);

initCatAnimation();

let last = Date.now();

setInterval(() => {

    const now = Date.now();

    const elapsed = (now - last) / 1000;

    state.treats += getCps() * elapsed;

    last = now;

    render();

}, 200);


setInterval(save, 5000);

document.addEventListener('visibilitychange', () => {

    if (document.visibilityState === 'hidden') {
        save();
    }

});

window.addEventListener('beforeunload', save);