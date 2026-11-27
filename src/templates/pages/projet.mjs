// Page d’un projet : couverture éclairée dans son gel, texte, films, photos, sources, projet suivant.
import { esc, link, picture, cover, filmButton, ticket, decor } from "../components.mjs";
import { dateLongue, moisAnnee } from "../../../scripts/lib/content.mjs";

export function projet(ctx, p) {
  const pages = ctx.projets.filter((x) => x.page);
  const next = pages[(pages.indexOf(p) + 1) % pages.length];
  const date = p.date_affichee || (p.date?.date ? (p.date.precise ? dateLongue(p.date) + (p.date.heure ? ` · ${p.date.heure}` : "") : p.date.annee) : "");
  const words = p.titre.length > 11 ? [70, 112] : [62, 125, 90];
  const photos = p.photos.filter((k) => ctx.manifest.images[k]);

  return `<article class="fiche">
  <header class="fiche-cover">
    <div class="fiche-media">${cover(ctx, p, { eager: true, sizes: "100vw", cls: "loop--cover" })}</div>
    <div class="plateau-light" aria-hidden="true"></div>
    ${decor(p.titre, { tag: "h1", widths: words, cls: "decor--fiche" })}
    <dl class="fiche-facts">
      <div><dt>Projet</dt><dd>${esc(ctx.site.familles[p.famille]?.nom || "")}${p.genre ? ` · ${esc(p.genre)}` : ""}</dd></div>
      ${date ? `<div><dt>${p.aVenir ? "Prochaine date" : "Date"}</dt><dd>${p.aVenir ? `<time datetime="${p.date.iso}">${esc(date)}</time>` : esc(date)}</dd></div>` : ""}
      ${p.lieu ? `<div><dt>Lieu</dt><dd>${esc(p.lieu)}</dd></div>` : ""}
      ${p.edition ? `<div><dt>Édition</dt><dd>${esc(p.edition)}</dd></div>` : ""}
    </dl>
  </header>

  <div class="wrap fiche-body">
    <div class="fiche-text">
      <p class="fiche-lead">${esc(p.resume)}</p>
      <div class="prose">${p.corps}</div>
      ${p.sources.length ? `<ul class="fiche-sources" role="list">${p.sources.map((s) => `<li>${link(s.url, esc(s.texte), "text-link")}</li>`).join("")}</ul>` : ""}
    </div>
    ${p.affiche && p.boucle ? `<figure class="fiche-poster">${picture(ctx, p.affiche, { sizes: "(min-width: 900px) 26vw, 70vw" })}<figcaption>${link(ctx.medias.images[p.affiche].source, esc(ctx.medias.images[p.affiche].credit))}</figcaption></figure>` : ""}
  </div>

  ${p.films.length ? `<section class="wrap fiche-films" aria-label="Vidéos">
    ${p.films.map((k, i) => filmButton(ctx, k, { cls: i ? "film--second" : "film--first", sizes: i ? "(min-width: 900px) 30vw, 92vw" : "(min-width: 900px) 58vw, 92vw" })).join("")}
  </section>` : ""}

  ${photos.length ? `<section class="wrap fiche-photos" aria-label="Photos">
    <div class="gallery" data-gallery>
      ${photos.map((k, i) => {
        const m = ctx.manifest.images[k]; const info = ctx.medias.images[k];
        return `<figure class="gallery-item gallery-item--${(i % 5) + 1}${m.h > m.w ? " is-portrait" : ""}"><a href="assets/img/${k}-${m.widths.at(-1)}.webp" data-caption="${esc(info.alt)}" data-credit="${esc(info.credit)}">${picture(ctx, k, { sizes: "(min-width: 900px) 46vw, 92vw" })}</a></figure>`;
      }).join("")}
    </div>
    <p class="gallery-credit">Photos : ${esc([...new Set(photos.map((k) => ctx.medias.images[k].credit))].join(" ; "))}</p>
    <dialog class="viewer" aria-label="Photos du projet">
      <div class="viewer-layout">
        <button type="button" class="viewer-close">Fermer</button>
        <figure><img alt=""><figcaption></figcaption></figure>
        <div class="viewer-controls"><button type="button" class="viewer-prev" aria-label="Photo précédente"></button><output class="viewer-count"></output><button type="button" class="viewer-next" aria-label="Photo suivante"></button></div>
      </div>
    </dialog>
  </section>` : ""}

  <a class="suite" href="${next.href}" data-gel="${esc(next.gel)}" style="--gel:${esc(next.gel)}">
    <span class="suite-label">Projet suivant</span>
    <span class="suite-title">${esc(next.titre)}</span>
    <span class="suite-genre">${esc(next.genre || "")}</span>
  </a>
</article>`;
}
