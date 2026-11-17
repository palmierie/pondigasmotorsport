// Pure render functions: data in, HTML string out. No DOM access.

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const e = escapeHtml;
const empty = (msg) => `<p class="empty">${e(msg)}</p>`;

function parseDate(s) {
  return new Date(s + "T00:00:00"); // local midnight
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(s) {
  return parseDate(s).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// "18:00" -> "6:00 PM"
function formatTime(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || "");
  if (!m) return "";
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

function formatRange(r) {
  if (r.endDate && r.endDate !== r.date) return `${formatDate(r.date)} – ${formatDate(r.endDate)}`;
  return formatDate(r.date);
}

function upcoming(data, today) {
  const t = startOfDay(today);
  return (data.races || [])
    .filter((r) => parseDate(r.endDate || r.date) >= t)
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));
}

// Inner spans shared by schedule rows, result rows and feature boxes.
function raceSpans(r, { result = false, timeLabel = "", timeZone = "", logo = false } = {}) {
  // Label and zone only make sense next to a real time: "Race 7:10 PM ET".
  const time = formatTime(r.time);
  const timeText = time ? [timeLabel, time, timeZone].filter(Boolean).join(" ") : "";
  const dateText = result ? formatDate(r.date) : [formatRange(r), timeText].filter(Boolean).join(" · ");
  const title = r.link ? `<a href="${e(r.link)}" rel="noopener">${e(r.event)}</a>` : e(r.event);
  const meta = [r.class, r.position].filter(Boolean).map(e).join(" · ");
  return (
    // Track logo tile: schedule rows and the Next Race box only (opted in via `logo`).
    (logo && r.logo ? `<span class="row-logo"><img src="${e(r.logo)}" alt="" data-logo></span>` : "") +
    (r.photo ? `<img class="row-photo" src="${e(r.photo)}" alt="${e(r.event)}" loading="lazy">` : "") +
    `<span class="row-date">${e(dateText)}</span>` +
    `<span class="row-title">${title}</span>` +
    `<span class="row-venue">${e(r.venue)}</span>` +
    (meta ? `<span class="row-meta">${meta}</span>` : "") +
    (r.notes ? `<span class="row-notes">${e(r.notes)}</span>` : "")
  );
}

const withLogo = (r, opts = {}) => (opts.logo && r.logo ? " has-logo" : "");
const row = (r, opts) => `<li class="row box${withLogo(r, opts)}">${raceSpans(r, opts)}</li>`;
const feature = (r, opts) => `<div class="box feature${withLogo(r, opts)}">${raceSpans(r, opts)}</div>`;

export function renderResults(data) {
  const seasons = [...(data.seasons || [])].sort((a, b) => b.year - a.year);
  if (!seasons.length) return empty("No results yet.");
  return seasons
    .map((s) => {
      const races = [...(s.races || [])].sort((a, b) => parseDate(b.date) - parseDate(a.date));
      const body = races.length ? `<ol class="rows">${races.map((r) => row(r, { result: true })).join("")}</ol>` : empty("No results yet.");
      return `<section class="season"><h2>${e(s.year)}</h2>${body}</section>`;
    })
    .join("");
}

export function renderSchedule(data, today) {
  const races = upcoming(data, today);
  if (!races.length) return empty("No upcoming races.");
  const opts = { timeLabel: data.timeLabel, timeZone: data.timeZone, logo: true };
  return `<ol class="rows">${races.map((r) => row(r, opts)).join("")}</ol>`;
}

export function renderNextRace(data, today) {
  const [next] = upcoming(data, today);
  if (!next) return empty("No upcoming races.");
  return feature(next, { timeLabel: data.timeLabel, timeZone: data.timeZone, logo: true });
}

export function renderLatestResult(data) {
  const all = (data.seasons || []).flatMap((s) => s.races || []);
  if (!all.length) return empty("No results yet.");
  const latest = all.reduce((a, b) => (parseDate(b.date) > parseDate(a.date) ? b : a));
  return feature(latest, { result: true });
}

export function renderSponsors(data) {
  const list = data.sponsors || [];
  if (!list.length) return empty("Sponsors coming soon.");
  const items = list.map((s) => {
    // With a logo, the name is kept as hidden text; main.js reveals it if the image fails to load.
    const inner = s.logo
      ? `<img src="${e(s.logo)}" alt="${e(s.name)}" loading="lazy" data-logo><span class="sponsor-name visually-hidden">${e(s.name)}</span>`
      : `<span class="sponsor-name">${e(s.name)}</span>`;
    const body = s.url ? `<a href="${e(s.url)}" rel="noopener">${inner}</a>` : inner;
    return `<li class="cell box">${body}</li>`;
  });
  return `<ul class="cells">${items.join("")}</ul>`;
}

// League box: dark logo strip + outlined body. Every part is optional.
const arr = (x) => (Array.isArray(x) ? x : []);

export function renderLeague(data) {
  const d = data || {};
  if (!d.name && !d.season) return "";
  const zone = d.timeZone ? ` ${d.timeZone}` : "";

  // Logos are white artwork; if one fails to load, main.js reveals the hidden name beside it.
  const logos = arr(d.logos)
    .filter((l) => l && l.src)
    .map((l) => `<img class="league-logo" src="${e(l.src)}" alt="${e(l.name || "")}" data-logo><span class="visually-hidden">${e(l.name || "")}</span>`)
    .join("");
  const strip = logos ? `<div class="league-strip">${logos}</div>` : "";

  const heading = [d.name ? e(d.name) : "", d.season ? `<span class="league-season">${e(d.season)}</span>` : ""].filter(Boolean).join(" ");
  const facts = arr(d.facts).filter((f) => f && f.label && f.value);
  const timeline = arr(d.timeline).filter((t) => t && t.label && t.time);
  const links = arr(d.links).filter((l) => l && l.label && /^https:\/\//.test(l.url || ""));
  const partners = arr(d.partners).filter((p) => p && p.name);

  const body =
    `<h2>${heading}</h2>` +
    (d.presentedBy ? `<p class="league-by">${e(d.presentedBy)}</p>` : "") +
    (d.tagline ? `<p class="league-tagline">${e(d.tagline)}</p>` : "") +
    (facts.length ? `<dl class="facts">${facts.map((f) => `<div><dt>${e(f.label)}</dt><dd>${e(f.value)}</dd></div>`).join("")}</dl>` : "") +
    (timeline.length ? `<ol class="timeline">${timeline.map((t) => `<li><span>${e(t.label)}</span><span>${e(t.time)}${e(zone)}</span></li>`).join("")}</ol>` : "") +
    (links.length ? `<p class="links">${links.map((l) => `<a class="${l.primary ? "btn" : "box"}" href="${e(l.url)}" target="_blank" rel="noopener">${e(l.label)}<span class="visually-hidden"> (opens in a new tab)</span></a>`).join("")}</p>` : "") +
    (partners.length ? `<ul class="partners">${partners.map((p) => `<li>${p.role ? `<span class="partner-role">${e(p.role)}</span> ` : ""}${e(p.name)}</li>`).join("")}</ul>` : "") +
    (d.disclaimer ? `<p class="disclaimer">${e(d.disclaimer)}</p>` : "");

  return `<section class="league box">${strip}<div class="league-body">${body}</div></section>`;
}
