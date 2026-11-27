// Accueil : couverture (trois tableaux), la prochaine date, les tableaux de projets,
// le trailer en multicam, la bande photo, le bureau, le contact.
import { esc, link, picture, loop, cover, filmButton, ticket, decor, bureau, contact, collaborations, figure, gelStyle } from "../components.mjs";
import { dateLongue, dateCourte, moisAnnee } from "../../../scripts/lib/content.mjs";

const pad = (n) => String(n).padStart(2, "0");
const fam = (ctx, p) => ctx.site.familles[p.famille]?.nom || p.famille;
const when = (p) => p.date_affichee || (p.date?.date ? (p.date.precise ? moisAnnee(p.date) : p.date.annee) : "");

function couverture(ctx, next) {
  const scenes = ctx.site.couverture;
  const first = scenes[0];
  return `<section class="plateau" aria-labelledby="titre-site" data-plateau style="--gel:${esc(first.gel)}">
  <div class="plateau-scenes">
    ${scenes.map((s, i) => `<div class="plateau-scene${i ? "" : " is-current"}" data-scene data-gel="${esc(s.gel)}">${loop(ctx, s.boucle, { eager: !i, decorative: i > 0, sizes: "100vw", cls: "loop--cover" })}</div>`).join("")}
  </div>
  <div class="plateau-light" aria-hidden="true"></div>
  <div class="plateau-head">
    ${decor("Urbaine Paris", { tag: "h1", id: "titre-site", widths: [62, 125, 82, 108], cls: "decor--plateau decor--wide" })}
    ${decor("Urbaine", { widths: [72, 125, 62, 100], cls: "decor--plateau decor--narrow" }).replace('<p class', '<p aria-hidden="true" class')}
    <p class="plateau-tagline plateau-tagline--m">${esc(ctx.site.baseline)} · depuis ${ctx.site.fondation}</p>
  </div>
  <p class="plateau-tagline plateau-tagline--d">${esc(ctx.site.baseline)} · depuis ${ctx.site.fondation}</p>
  ${next ? `<a class="plateau-date" href="${next.href}"${gelStyle(next.gel)}>
    <span class="plateau-date-label">Prochaine date</span>
    <span class="plateau-date-day">${pad(next.date.date.getDate())}.${pad(next.date.date.getMonth() + 1)}</span>
    <span class="plateau-date-what"><strong>${esc(next.titre)}${next.edition ? ` · ${esc(next.edition)}` : ""}</strong><span>${next.date.heure ? esc(next.date.heure) + " · " : ""}${esc(next.lieu || "")}</span></span>
  </a>` : ""}
  <div class="plateau-index" role="group" aria-label="Tableaux de la couverture">
    ${scenes.map((s, i) => `<button type="button" class="plateau-tab" aria-pressed="${i === 0}" data-scene-tab style="--gel:${esc(s.gel)}"><span>${esc(s.titre)}</span></button>`).join("")}
  </div>
</section>`;
}

// Couverture validée (R-005) : titre L’Urbaine., index des publications en marge, plan photo découpé en biais,
// affiche qui traverse la découpe, légende décalée. Version noire, avec les boucles HD à la place des photos.
function couvertureDecalee(ctx, { asHero = true } = {}) {
  const une = (ctx.site.une || []).map((slug) => ctx.projets.find((p) => p.slug === slug)).filter(Boolean);
  const thumb = (p) => {
    const key = p.boucle ? ctx.manifest.boucles[p.boucle]?.poster : p.affiche;
    return key ? picture(ctx, key, { sizes: "64px", alt: "" }) : "";
  };
  const meta = (p) => p.aVenir ? `${dateCourte(p.date)}${p.date.heure ? ` · ${p.date.heure}` : ""}` : [p.genre, p.date_affichee || (p.date?.precise ? moisAnnee(p.date) : p.date?.annee)].filter(Boolean).join(" · ");
  const h = asHero ? "h2" : "h3";
  const label = (p) => p.aVenir ? `Infos du ${esc(p.titre)}` : `Ouvrir ${esc(p.titre)}`;
  const head = asHero
    ? `<div class="desk-title"><h1 id="titre-site">L’Urbaine<span>.</span></h1><p>Média étudiant<br>Paris Dauphine – PSL</p></div>`
    : `<div class="desk-title"><h2 id="titre-une">À la une<span>.</span></h2><p>Quatre publications<br>de L’Urbaine</p></div>`;
  return `<section class="desk wrap${asHero ? " desk--hero" : ""}" aria-labelledby="${asHero ? "titre-site" : "titre-une"}" data-desk style="--gel:${esc(une[0]?.gel || "")}">
  ${head}
  <div class="desk-body">
    <div class="desk-rail">
    <div class="press-tabs" role="tablist" aria-label="Publications à la une">
      ${une.map((p, i) => `<button type="button" id="onglet-${p.slug}" role="tab" aria-selected="${i === 0}" aria-controls="planche-${p.slug}" tabindex="${i ? -1 : 0}" style="--gel:${esc(p.gel)}"><span class="desk-tab-text"><span>${esc(fam(ctx, p))}</span><strong>${esc(p.titre)}</strong></span><span class="desk-tab-thumb" aria-hidden="true">${thumb(p)}</span></button>`).join("")}
    </div>
    <div class="desk-actions">${une.map((p, i) => `<div data-action-for="planche-${p.slug}"${i ? " hidden" : ""}>${ticket(p.href, label(p))}</div>`).join("")}</div>
    </div>
    <div class="dispatch-panels">
      ${une.map((p, i) => {
        const insert = p.boucle && p.affiche ? p.affiche : null;
        const src = p.boucle ? ctx.medias.videos[p.boucle.split("#")[0]] : ctx.medias.images[p.affiche];
        return `<section class="dispatch-panel" id="planche-${p.slug}" role="tabpanel" aria-labelledby="onglet-${p.slug}" data-gel="${esc(p.gel)}" style="--gel:${esc(p.gel)}"${i ? " hidden" : ""}>
        <div class="dispatch-image">
          <figure class="dispatch-photo">${cover(ctx, p, { eager: !i, sizes: "(min-width: 900px) 64vw, 94vw" })}</figure>
          ${insert ? `<a class="dispatch-poster" href="${p.href}" tabindex="-1" aria-hidden="true">${picture(ctx, insert, { sizes: "(min-width: 900px) 16vw, 26vw", alt: "" })}</a>` : ""}
          ${src ? `<a class="dispatch-credit" href="${esc(src.source)}" rel="noopener">${esc(src.credit)}</a>` : ""}
        </div>
        <div class="dispatch-caption">
          <div><${h} class="dispatch-title">${esc(p.titre)}</${h}><p>${esc(meta(p))}</p></div>
          <p class="dispatch-deck">${esc(p.resume)}</p>
          ${ticket(p.href, label(p), "dispatch-ticket")}
        </div>
      </section>`;
      }).join("")}
    </div>
  </div>
</section>`;
}

function affiche(ctx, p) {
  if (!p) return "";
  const annonce = p.films.find((f) => /annonce/.test(f)) || p.films[0];
  const ring = Object.keys(ctx.manifest.boucles).find((k) => k.startsWith(`${annonce}#`));
  return `<section class="affiche" aria-labelledby="titre-affiche"${gelStyle(p.gel)} data-gel-section="${esc(p.gel)}">
  <div class="wrap affiche-grid">
    <div class="affiche-media">
      ${ring ? loop(ctx, ring, { sizes: "(min-width: 900px) 52vw, 92vw", cls: "affiche-loop" }) : ""}
      ${p.affiche ? `<a class="affiche-poster" href="${p.href}" tabindex="-1" aria-hidden="true">${picture(ctx, p.affiche, { sizes: "(min-width: 900px) 18vw, 40vw" })}</a>` : ""}
    </div>
    <div class="affiche-copy">
      <h2 id="titre-affiche" class="affiche-title"><span>${esc(p.titre)}</span>${p.edition ? ` <span class="affiche-edition">${esc(p.edition)}</span>` : ""}</h2>
      <p class="affiche-when"><time datetime="${p.date.iso}">${esc(dateLongue(p.date))}${p.date.heure ? ` · ${esc(p.date.heure)}` : ""}</time><span>${esc(p.lieu || "")}</span></p>
      <p class="affiche-lead">${esc(p.resume)}</p>
      <div class="affiche-actions">${ticket(p.href, "Toutes les infos")}${annonce ? filmButton(ctx, annonce, { label: "Voir l’annonce", cls: "film--inline" }) : ""}</div>
    </div>
  </div>
</section>`;
}

function tableaux(ctx, list) {
  return `<section class="tableaux" aria-labelledby="titre-tableaux" data-tableaux>
  <div class="wrap">
    <header class="tableaux-head"><h2 id="titre-tableaux" class="section-title">Les projets</h2><p>Scène, soirées, formats vidéo, murs du campus : ce que L’Urbaine a fait cette année et les précédentes.</p></header>
    <div class="tableaux-body">
      <div class="tableaux-stage" aria-hidden="true">
        ${list.map((p, i) => `<div class="tableaux-frame${i ? "" : " is-current"}" data-frame>${cover(ctx, p, { sizes: "(min-width: 900px) 54vw, 100vw", decorative: true })}</div>`).join("")}
      </div>
      <ol class="tableaux-list" role="list">
        ${list.map((p, i) => `<li class="tableau${i ? "" : " is-active"}" data-tableau data-gel="${esc(p.gel)}" data-title="${esc(p.titre)}" data-when="${esc(when(p))}"${gelStyle(p.gel)}>
          <div class="tableau-media">${cover(ctx, p, { sizes: "92vw" })}</div>
          <p class="tableau-meta"><span>${esc(fam(ctx, p))}</span><span>${esc(when(p))}</span></p>
          <h3 class="tableau-title"><a href="${p.href}" data-gel="${esc(p.gel)}">${esc(p.titre)}</a></h3>
          <p class="tableau-genre">${esc(p.genre || "")}</p>
          <p class="tableau-resume">${esc(p.resume)}</p>
        </li>`).join("")}
      </ol>
    </div>
    <p class="tableaux-all">${ticket("projets.html", "Tous les projets")}</p>
  </div>
</section>`;
}

function multicam(ctx) {
  const m = ctx.site.multicam;
  if (!m) return "";
  const f = ctx.manifest.films[m.film];
  return `<section class="multicam" aria-labelledby="titre-multicam">
  <div class="wrap multicam-grid">
    <header class="multicam-head">
      <h2 id="titre-multicam" class="section-title">${esc(m.titre)}</h2>
      <p>${esc(m.texte)}</p>
      ${f ? filmButton(ctx, m.film, { label: "Regarder le trailer", cls: "film--wide", sizes: "(min-width: 900px) 34vw, 92vw" }) : ""}
    </header>
    ${m.boucles.map((ref, i) => `<figure class="cam cam--${i + 1}">${loop(ctx, ref, { sizes: i === 0 ? "(min-width: 900px) 40vw, 92vw" : "(min-width: 900px) 24vw, 46vw" })}<figcaption>Cam ${i + 1}</figcaption></figure>`).join("")}
  </div>
</section>`;
}

function bande(ctx) {
  const lanes = ctx.site.bandeau || [];
  return `<section class="bande" aria-label="Photos de L’Urbaine" data-bande>
  ${lanes.map((keys, l) => `<div class="bande-lane${l % 2 ? " bande-lane--back" : ""}"><ul class="bande-track" role="list">${keys.map((k) => `<li>${picture(ctx, k, { sizes: "(min-width: 900px) 30vw, 60vw" })}</li>`).join("")}</ul></div>`).join("")}
  <button type="button" class="bande-control" aria-pressed="false" data-bande-toggle>Arrêter le défilement</button>
</section>`;
}

// Les cinq pôles, tels que le reel « l’urbaine ✨ c’est une asso qui rassemble… » les présente.
function poles(ctx) {
  const p = ctx.site.poles;
  if (!p?.boucles?.length) return "";
  return `<section class="poles-reel has-figure" aria-labelledby="titre-poles-reel" data-reveal>
  ${figure("Urbaine", { side: "right", beam: "tl", widths: [125, 62, 100, 76], top: "18%" })}
  <div class="wrap">
    <header class="poles-head"><h2 id="titre-poles-reel" class="section-title">${esc(p.titre)}</h2><p>${esc(p.texte)}</p>${p.film ? filmButton(ctx, p.film, { label: "Voir le reel", cls: "film--inline" }) : ""}</header>
    <ul class="poles-strip" role="list">
      ${p.boucles.map((b, i) => `<li class="pole pole--${i + 1}">${loop(ctx, b.boucle, { sizes: "(min-width: 900px) 19vw, 44vw" })}<span class="pole-name">${esc(b.nom)}</span></li>`).join("")}
    </ul>
  </div>
</section>`;
}

export function home(ctx, { hero = ctx.site.couverture_style } = {}) {
  const next = ctx.projets.filter((p) => p.aVenir).sort((a, b) => a.date.date - b.date.date)[0];
  const list = ctx.projets.filter((p) => p.accueil && p.page);
  // plateau : décor projeté en couverture, puis la composition décalée devenue « À la une ».
  // decale  : la composition décalée en couverture (titre L’Urbaine.), puis l’affiche du prochain évènement.
  const top = hero === "plateau" ? couverture(ctx, next) + couvertureDecalee(ctx, { asHero: false }) : couvertureDecalee(ctx) + affiche(ctx, next);
  return top + poles(ctx) + tableaux(ctx, list) + collaborations(ctx) + multicam(ctx) + bande(ctx) + bureau(ctx) + contact(ctx);
}
