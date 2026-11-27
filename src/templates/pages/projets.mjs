// Page Projets : tous les projets, rangés par famille, avec filtres.
import { esc, link, cover, decor, gelStyle } from "../components.mjs";
import { moisAnnee } from "../../../scripts/lib/content.mjs";

const when = (p) => p.date_affichee || (p.date?.date ? (p.date.precise ? moisAnnee(p.date) : p.date.annee) : "");

export function projets(ctx) {
  const familles = Object.entries(ctx.site.familles).filter(([k]) => ctx.projets.some((p) => p.famille === k));
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
  return `<section class="archive" aria-labelledby="titre-projets">
  <header class="archive-head wrap">
    ${decor("Projets", { tag: "h1", id: "titre-projets", widths: [62, 125, 90], cls: "decor--page" })}
    <p class="archive-intro">Les projets de L’Urbaine depuis le campus de Dauphine : la scène du DAU’Clash, les nuits de l’UR’Night, les formats vidéo, les fresques et la vie de l’asso.</p>
  </header>
  <div class="wrap">
    <div class="filters" role="group" aria-label="Filtrer les projets" hidden>
      <button type="button" aria-pressed="true" data-filter="">Tout</button>
      ${familles.map(([k, f]) => `<button type="button" aria-pressed="false" data-filter="${esc(k)}">${esc(f.nom)}</button>`).join("")}
    </div>
    <p class="sr-only" role="status" data-filter-status></p>
    <ol class="rows" role="list">${ctx.projets.map(row).join("")}</ol>
  </div>
</section>`;
}
