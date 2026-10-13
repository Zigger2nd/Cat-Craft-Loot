import { state } from '../core/state.js';

import {
    getClickCost,
    getClickPower
} from '../core/economy.js';

import { renderGenerators } from './generators.js';


export function render() {

    document.querySelector('.treats-count').textContent =
        Math.floor(state.treats);


    const clickCost = getClickCost();

    document.querySelector('.clicker-cost').textContent =
        clickCost;


    document.querySelector('.click-level').textContent =
        state.clickLevel;


    document.querySelectorAll('.click-power').forEach(element => {

        element.textContent = getClickPower();

    });

    document.getElementById('buyClickBtn').disabled =
        state.treats < clickCost;


    renderGenerators();

}