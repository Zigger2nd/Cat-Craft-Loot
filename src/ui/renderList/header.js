import { state } from "../../core/state.js";

export function renderHeader() {
  document.querySelector(".treats-count").textContent = Math.floor(
    state.treats,
  ).toLocaleString("en-US");
  document.querySelector(".dust-count").textContent = Math.floor(
    state.dust,
  ).toLocaleString("en-US");
}
