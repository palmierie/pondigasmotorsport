import * as R from "./render.js";

const sections = {
  results: (d) => R.renderResults(d),
  schedule: (d) => R.renderSchedule(d, new Date()),
  "next-race": (d) => R.renderNextRace(d, new Date()),
  "latest-result": (d) => R.renderLatestResult(d),
  sponsors: (d) => R.renderSponsors(d),
};

const source = {
  results: "results",
  schedule: "schedule",
  "next-race": "schedule",
  "latest-result": "results",
  sponsors: "sponsors",
};

const cache = {};
function load(name) {
  cache[name] ??= fetch(`/data/${name}.json`).then((r) => {
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    return r.json();
  });
  return cache[name];
}

document.querySelectorAll("[data-render]").forEach(async (el) => {
  const kind = el.dataset.render;
  try {
    el.innerHTML = sections[kind](await load(source[kind]));
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="empty">Couldn't load this section.</p>`;
  }
});

const toggle = document.querySelector(".nav-toggle");
toggle?.addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  toggle.setAttribute("aria-expanded", String(open));
});
