import { state } from '../core/state.js';
import { GENERATORS } from '../config/generators.js';
import { getGeneratorCost, buyGenerator } from '../core/economy.js';

const list = document.getElementById('generatorList');

export function initGenerators(onChange) {
  for (const [id, g] of Object.entries(GENERATORS)) {
    const btn = document.createElement('button');
    btn.dataset.id = id;
    btn.addEventListener('click', () => {
      buyGenerator(id);
      onChange();
    });
    list.appendChild(btn);
  }
}

export function renderGenerators() {
  for (const btn of list.children) {
    const id = btn.dataset.id;
    const cost = getGeneratorCost(id);
    btn.textContent = `${GENERATORS[id].name} (${state.generators[id] ?? 0}) , cena ${cost}`;
    btn.disabled = state.treats < cost;
  }
}