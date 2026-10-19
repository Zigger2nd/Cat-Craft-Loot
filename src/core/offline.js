import { state } from "../core/state.js";
import { MAXOFFLINETIME } from "../config/balance.js";
import { getCps } from "./economy.js";

export function applyOfflineGains() {
  const now = Date.now();
  const previousLastSeen = Number(state.lastSeen);

  if (
    !Number.isFinite(previousLastSeen) ||
    previousLastSeen <= 0 ||
    previousLastSeen > now
  ) {
    state.lastSeen = now;

    return {
      gained: 0,
      elapsed: 0,
    };
  }

  const rawSeconds = (now - previousLastSeen) / 1000;

  const elapsed = Math.min(Math.max(0, rawSeconds), MAXOFFLINETIME);

  const cps = getCps();
  const gained = elapsed * cps;

  state.treats += gained;

  state.lastSeen = now;

  return {
    gained,
    elapsed,
  };
}
