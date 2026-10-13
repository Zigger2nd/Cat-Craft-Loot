import { state } from './core/state.js';
import {load, save} from './storage/save.js';
import {clickCat, buyClick, getCps} from './core/economy.js';
import {render} from './ui/render.js';
import {initGenerators} from './ui/generators.js';
import { updateEnergy } from './loot/energy.js';
import { openBox } from './loot/lootBox.js';
import { SKINS } from './config/skins.js';
import { initCatAnimation } from './ui/catAnimation.js';
import { initSkinsModal } from './ui/skinsModal.js';
load();
updateEnergy();
render();


document.getElementById('clickBtn').addEventListener('click', () => {

    clickCat();

    render();

});


document.getElementById('buyClickBtn').addEventListener('click', () => {

    buyClick();

    render();

});

document.getElementById('openBoxBtn').addEventListener('click', ()=>{
  const res = openBox();
  if(!res.ok) return;
  const skin = SKINS[res.id];
  document.getElementById('lootResult').textContent = res.duplicate
    ? `${skin.name} (${skin.rarity}): duplicate, +${res.dust} dust`
    : `New skin: ${skin.name} (${skin.rarity})!`;
  render();
})

initGenerators(render);

initCatAnimation();

initSkinsModal();

let last = Date.now();

setInterval(() => {
    const now = Date.now();
    const elapsed = (now - last) / 1000;
    state.treats += getCps() * elapsed;
    last = now;
    updateEnergy();
    render();
}, 200);


setInterval(save, 5000);

document.addEventListener('visibilitychange', () => {

    if (document.visibilityState === 'hidden') {
        save();
    }

});

window.addEventListener('beforeunload', save);