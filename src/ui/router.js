// src/ui/router.js
// One page, several "views". Only one <section data-view="..."> is visible.
// Nav buttons: <button data-nav="skins">. The current view lives in the URL hash (#skins).

const DEFAULT_VIEW = "home";

const hooks = {}; // viewId -> [functions to run when the view opens]
let current = null;
let leaveGuard = () => true;

/** Run fn every time the view is opened (render lists, refresh counters...). */
export function onViewShow(id, fn) {
  (hooks[id] ??= []).push(fn);
}

/** fn(from, to) returns false to block leaving (e.g. while the loot box is spinning). */
export function setLeaveGuard(fn) {
  leaveGuard = fn;
}

export function getCurrentView() {
  return current;
}

export function showView(id) {
  const sections = [...document.querySelectorAll("[data-view]")];
  const next = sections.some((s) => s.dataset.view === id) ? id : DEFAULT_VIEW;

  if (next === current) return;

  if (current !== null && leaveGuard(current, next) === false) {
    if (location.hash.slice(1) !== current) location.hash = current;
    return;
  }

  for (const section of sections) {
    section.hidden = section.dataset.view !== next;
  }

  for (const btn of document.querySelectorAll("[data-nav]")) {
    const active = btn.dataset.nav === next;
    btn.classList.toggle("active", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  }

  current = next;
  if (location.hash.slice(1) !== next) location.hash = next;

  for (const fn of hooks[next] ?? []) fn();
}

/** Call LAST in main.js, after every onViewShow() is registered. */
export function initRouter() {
  for (const btn of document.querySelectorAll("[data-nav]")) {
    btn.addEventListener("click", () => showView(btn.dataset.nav));
  }

  window.addEventListener("hashchange", () => {
    showView(location.hash.slice(1));
  });

  showView(location.hash.slice(1) || DEFAULT_VIEW);
}
