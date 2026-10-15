import { state } from "../core/state.js";
import { MAXOFFLINETIME } from "../config/balance.js";
import { getCps } from "./economy.js";

export function applyOfflineGains() {
  const now = Date.now();

  if (!state.lastSeen) {
    state.lastSeen = now;
  }

  let gained;
  let rawSeconds = (now - state.lastSeen) / 1000;
  const elapsed = Math.min(Math.max(0, rawSeconds), MAXOFFLINETIME);

  gained = elapsed * getCps();
  state.treats += gained;

  state.lastSeen = now;

  return { gained, elapsed };
}
