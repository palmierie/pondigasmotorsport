import * as R from "./render.js";
import { pickHeroVideo } from "./hero-video.js";

const sections = {
  results: (d) => R.renderResults(d),
  schedule: (d) => R.renderSchedule(d, new Date()),
  "next-race": (d) => R.renderNextRace(d, new Date()),
  "latest-result": (d) => R.renderLatestResult(d),
  sponsors: (d) => R.renderSponsors(d),
  league: (d) => R.renderLeague(d),
};

const source = {
  results: "results",
  schedule: "schedule",
  "next-race": "schedule",
  "latest-result": "results",
  sponsors: "sponsors",
  league: "league",
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

document.documentElement.classList.remove("no-js");

// Header: pale boxes once scrolled, or always on pages without a hero.
const hasHero = !!document.querySelector(".hero");
const syncHeader = () => document.body.classList.toggle("scrolled", !hasHero || window.scrollY > 40);
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const toggle = document.querySelector(".nav-toggle");
const setMenu = (open) => {
  document.body.classList.toggle("nav-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
};
toggle?.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") setMenu(false); });

// A sponsor logo that fails to load (wrong path or case) falls back to the sponsor's name.
document.addEventListener(
  "error",
  (ev) => {
    const img = ev.target;
    if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-logo")) return;
    img.hidden = true;
    img.nextElementSibling?.classList.remove("visually-hidden");
    // A track logo tile with a broken image would be an empty dark square: hide the tile too.
    img.closest(".row-logo")?.setAttribute("hidden", "");
    // ...and drop the extra grid column, or the row's text shifts one column left.
    img.closest(".has-logo")?.classList.remove("has-logo");
  },
  true
);

// Home hero video: muted looping background. The photo shows until it plays, and stays for visitors
// who asked for reduced motion or data saving. File choice (phone / default / large screens): hero-video.js
const heroVideo = document.querySelector(".hero-video");
if (heroVideo) {
  const hero = heroVideo.closest(".hero");
  const src = pickHeroVideo({
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: !!(navigator.connection && navigator.connection.saveData),
    viewportWidth: window.innerWidth,
    pixelRatio: window.devicePixelRatio || 1,
  });
  if (src) {
    heroVideo.src = src;
    heroVideo.addEventListener("playing", () => hero.classList.add("video-on"), { once: true });
    heroVideo.play().catch(() => {});
    // Pause while the hero is off screen to save battery and data.
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? heroVideo.play().catch(() => {}) : heroVideo.pause())).observe(hero);
  }
}
