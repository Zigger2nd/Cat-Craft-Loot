import { state } from '../core/state.js';
import { getClickCost, getClickPower } from '../core/economy.js';
import { renderGenerators } from '../ui/generators.js';
import { LOOTBOX, ENERGY } from '../config/balance.js';


export function render() {
  document.querySelector('.treats-count').textContent = Math.floor(state.treats);
  document.querySelector('.clicker-cost').textContent = getClickCost();
  document.getElementById('buyClickBtn').disabled = state.treats < getClickCost();
  document.querySelector('.click-level').textContent = state.clickLevel;
  document.querySelector('.click-power').textContent = getClickPower();
  document.querySelector('.energy-count').textContent = `${state.energy}/${ENERGY.max}`;
  document.querySelector('.dust-count').textContent = state.dust;
  document.getElementById('openBoxBtn').disabled = state.energy < LOOTBOX.energyCost;
  renderGenerators();
}