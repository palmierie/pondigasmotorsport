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
  return parseDate(s).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
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

function raceCard(r) {
  const title = r.link
    ? `<a href="${e(r.link)}" rel="noopener">${e(r.event)}</a>`
    : e(r.event);
  return `<article class="card race"><p class="race-date">${e(formatRange(r))}</p><h3>${title}</h3><p class="race-venue">${e(r.venue)}</p></article>`;
}

function resultCard(r) {
  const meta = [r.class, r.position].filter(Boolean).map(e).join(" · ");
  const photo = r.photo ? `<img src="${e(r.photo)}" alt="${e(r.event)}" loading="lazy">` : "";
  return `<article class="card race">${photo}<p class="race-date">${e(formatDate(r.date))}</p><h3>${e(r.event)}</h3><p class="race-venue">${e(r.venue)}</p>${meta ? `<p class="race-meta">${meta}</p>` : ""}${r.notes ? `<p class="race-notes">${e(r.notes)}</p>` : ""}</article>`;
}

export function renderResults(data) {
  const seasons = [...(data.seasons || [])].sort((a, b) => b.year - a.year);
  if (!seasons.length) return empty("No results yet.");
  return seasons
    .map((s) => {
      const races = [...(s.races || [])].sort((a, b) => parseDate(b.date) - parseDate(a.date));
      const body = races.length ? `<div class="card-grid">${races.map(resultCard).join("")}</div>` : empty("No results yet.");
      return `<section class="season"><h2>${e(s.year)}</h2>${body}</section>`;
    })
    .join("");
}

export function renderSchedule(data, today) {
  const races = upcoming(data, today);
  if (!races.length) return empty("No upcoming races.");
  return `<div class="card-grid">${races.map(raceCard).join("")}</div>`;
}

export function renderNextRace(data, today) {
  const [next] = upcoming(data, today);
  if (!next) return empty("No upcoming races.");
  return raceCard(next);
}

export function renderLatestResult(data) {
  const all = (data.seasons || []).flatMap((s) => s.races || []);
  if (!all.length) return empty("No results yet.");
  const latest = all.reduce((a, b) => (parseDate(b.date) > parseDate(a.date) ? b : a));
  return resultCard(latest);
}

export function renderSponsors(data) {
  const list = data.sponsors || [];
  if (!list.length) return empty("Sponsors coming soon.");
  const items = list.map((s) => {
    const inner = s.logo
      ? `<img src="${e(s.logo)}" alt="${e(s.name)}" loading="lazy">`
      : `<span class="sponsor-name">${e(s.name)}</span>`;
    const body = s.url ? `<a href="${e(s.url)}" rel="noopener">${inner}</a>` : inner;
    return `<div class="sponsor">${body}</div>`;
  });
  return `<div class="sponsor-grid">${items.join("")}</div>`;
}
