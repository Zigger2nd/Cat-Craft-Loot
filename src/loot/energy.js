import { state } from '../core/state.js';
import { ENERGY } from '../config/balance.js';


export function updateEnergy(){
const now = Date.now();
const stepMs = ENERGY.regenSeconds * 10;

if(state.energy >= ENERGY.max){
    state.energy = ENERGY.max
    state.energyUpdatedAt = now;
    return;
}

const gained = Math.floor((now - state.energyUpdatedAt)/stepMs);

if(gained>0){
    state.energy = Math.min(ENERGY.max, state.energy+gained)
    state.energyUpdatedAt += gained+stepMs;
}
}


