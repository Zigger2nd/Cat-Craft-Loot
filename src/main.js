import { state } from './core/state.js';
import {load, save} from './storage/save.js';
import {clickCat, buyClick, getCps} from './core/economy.js';
import {render} from './ui/render.js';
import {initGenerators} from './ui/generators.js';

load();
render();

document.getElementById('clickBtn').addEventListener('click', () => {
  clickCat();
  render();
});

document.getElementById('buyClickBtn').addEventListener('click', ()=>{
  buyClick();
  render();
})

initGenerators(render);

let last = Date.now();
setInterval(() => {
  const now = Date.now();
  state.treats += getCps() * (now - last) / 1000;
  last = now;
  render();
}, 200);

setInterval(save, 5000);
document.addEventListener('visibilitychange', save);
