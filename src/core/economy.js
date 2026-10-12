import {state} from '../core/state.js';
import {CLICK_UPGRADE} from '../config/upgrades.js'
import {GENERATORS} from '../config/generators.js'

export function clickCat() {
    state.treats += getClickPower();
}

export function getClickPower() {
return 1 + state.clickLevel * CLICK_UPGRADE.powerPerLevel;
}

export function getClickCost() {
    return Math.floor(CLICK_UPGRADE.baseCost * CLICK_UPGRADE.growth ** state.clickLevel);
}

export function buyClick() {
    const cost = getClickCost();
    if(state.treats < cost) return false;

    
    state.treats -=cost;
    state.clickLevel += 1;
    return true;
}

export function getGeneratorCost(id){
    const g = GENERATORS[id];
    return Math.floor(g.baseCost * g.growth ** (state.generators[id] ?? 0))
}

export function buyGenerator(id) {
    const cost = getGeneratorCost(id);
    if(state.treats < cost) return false;

    state.treats -=cost;
    state.generators[id] = (state.generators[id] ?? 0) +1 ;
    return true;
}

export function getCps(){
    let total = 0;
    for(const [id, g] of Object.entries(GENERATORS)){
        total +=(state.generators[id]?? 0) * g.cps;
    }
    return total;
}