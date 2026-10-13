import { state } from '../core/state.js';
import { SKINS } from '../config/skins.js';
import { LOOT_WEIGHTS, DUST_FOR_DUPLICATE, LOOTBOX } from '../config/balance.js';
import { updateEnergy } from './energy.js';

function pickRarity(){
    const total = Object.values(LOOT_WEIGHTS).reduce((a,b)=> a+b,0);
    let r = Math.random() * total;
    for(const [rarity,weight] of Object.entries(LOOT_WEIGHTS)){
        if(r<weight) return rarity;
        r-=weight;
    }
}

function roolSkin(){
    const rarity = pickRarity();
    const pool = Object.keys(SKINS).filter(
        (id)=>id !=='default' && SKINS[id].rarity===rarity
    );
    const ids = pool.length ? pool : Object.keys(SKINS).filter((id) => id !== 'default');
  return ids[Math.floor(Math.random() * ids.length)];
}

export function openBox(){
    updateEnergy();
    if(state.energy<LOOTBOX.energyCost) return {ok:false};

    state.energy -=LOOTBOX.energyCost;
    const id = roolSkin();
    const rarity = SKINS[id].rarity;
    
    if(state.ownedSkins.includes(id)){
        const dust = DUST_FOR_DUPLICATE[rarity];
        state.dust +=dust;
        return {ok:true,id, duplicate:false};
    }

    state.ownedSkins.push(id);
    return {ok:true, id ,duplicate: false};
}