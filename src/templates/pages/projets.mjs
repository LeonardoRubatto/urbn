// Page Projets : tous les projets, filtrables par famille, puis le calendrier (généré depuis les dates).
import { esc, link, cover, decor, figure, gelStyle } from "../components.mjs";
import { moisAnnee, dateCourte } from "../../../scripts/lib/content.mjs";

const when = (p) => p.date_affichee || (p.date?.date ? (p.date.precise ? moisAnnee(p.date) : p.date.annee) : "");
const pad = (n) => String(n).padStart(2, "0");

// Calendrier : les projets datés, du plus récent au plus ancien ; la date à venir en tête, en jaune.
function calendrier(ctx) {
  const dated = ctx.projets.filter((p) => p.date?.date && !p.date.invalid).sort((a, b) => b.date.date - a.date.date);
  if (!dated.length) return "";
  const row = (p) => {
    const d = p.date;
    const day = d.precise ? `${pad(d.date.getDate())}.${pad(d.date.getMonth() + 1)}` : "—";
    const name = p.page ? `<a href="${esc(p.href)}" data-gel="${esc(p.gel)}">${esc(p.titre)}</a>` : esc(p.titre);
    return `<li class="cal-row${p.aVenir ? " is-next" : ""}"${gelStyle(p.gel)}>
      <time datetime="${d.iso}"><span class="cal-day">${day}</span><span class="cal-year">${p.date_affichee || d.annee}</span></time>
      <span class="cal-what"><strong>${name}</strong><span>${esc([p.aVenir ? (d.heure ? `${d.heure} · ${p.lieu || ""}` : p.lieu) : p.lieu, p.genre].filter(Boolean).join(" · "))}</span></span>
      ${p.aVenir ? `<span class="cal-tag">À venir</span>` : ""}
    </li>`;
  };
  return `<section class="calendrier has-figure" aria-labelledby="titre-calendrier">
  ${figure("Dates", { side: "left", beam: "tr", widths: [62, 125, 88], top: "10%" })}
  <div class="wrap">
  <h2 id="titre-calendrier" class="section-title">Le calendrier</h2>
  <ol class="cal-list" role="list">${dated.map(row).join("")}</ol>
  </div>
</section>`;
}

export function projets(ctx) {
  const familles = Object.entries(ctx.site.familles).filter(([k]) => ctx.projets.some((p) => p.famille === k));
  const count = (k) => ctx.projets.filter((p) => !k || p.famille === k).length;
  const gelOf = (k) => ctx.projets.find((p) => p.famille === k)?.gel;
  const row = (p, i) => `<li class="row${i % 2 ? " row--alt" : ""}${p.page ? "" : " row--text"}" data-famille="${esc(p.famille)}"${gelStyle(p.gel)}>
    <a class="row-link" href="${esc(p.href)}"${p.page ? ` data-gel="${esc(p.gel)}"` : ' rel="noopener"'}>
      ${p.page ? `<span class="row-media" data-hover-loop>${cover(ctx, p, { sizes: "(min-width: 900px) 34vw, 92vw" })}</span>` : ""}
      <span class="row-copy">
        <span class="row-meta"><span>${esc(ctx.site.familles[p.famille]?.nom || "")}</span><span>${esc(when(p))}</span></span>
        <span class="row-title">${esc(p.titre)}</span>
        <span class="row-genre">${esc(p.genre || "")}</span>
        <span class="row-resume">${esc(p.resume)}</span>
        ${p.page ? "" : `<span class="row-out">Sur Instagram</span>`}
      </span>
    </a>
  </li>`;
  // Filtres : des mots, pas des boutons-boîtes. Chaque famille s’allume dans la couleur de ses projets.
  const filter = (k, label, i) => `<button type="button" aria-pressed="${i === 0}" data-filter="${esc(k)}"${k ? ` style="--fgel:${esc(gelOf(k))}"` : ""}><span>${esc(label)}</span><sup aria-hidden="true">${count(k)}</sup></button>`;
  return `<section class="archive" aria-labelledby="titre-projets">
  <header class="archive-head wrap">
    ${decor("Projets", { tag: "h1", id: "titre-projets", widths: [62, 125, 90], cls: "decor--page" })}
    <p class="archive-intro">Les projets de L’Urbaine depuis le campus de Dauphine : la scène du DAU’Clash, les nuits de l’UR’Night, les formats vidéo, les fresques et la vie de l’asso.</p>
  </header>
  <div class="wrap">
    <div class="filters" role="group" aria-label="Filtrer les projets" hidden>
      ${[["", "Tout"], ...familles.map(([k, f]) => [k, f.nom])].map(([k, l], i) => filter(k, l, i)).join("")}
    </div>
    <p class="sr-only" role="status" data-filter-status></p>
    <ol class="rows" role="list">${ctx.projets.map(row).join("")}</ol>
  </div>
</section>
${calendrier(ctx)}`;
}
