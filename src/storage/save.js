import { state } from '../core/state.js';

const NUMBER_FIELDS = ['treats', 'dust', 'energy', 'clickLevel'];

export function save() {
  if (NUMBER_FIELDS.some((k) => !Number.isFinite(state[k]))) return;

  state.lastSeen = Date.now();
  localStorage.setItem('save', JSON.stringify(state));
}

export function load() {
  try {
    const data = JSON.parse(localStorage.getItem('save'));
    if (data) Object.assign(state, data);
  } catch {
  }

  for (const k of NUMBER_FIELDS) {
    const n = Number(state[k]);
    state[k] = Number.isFinite(n) ? n : 0;
  }
}