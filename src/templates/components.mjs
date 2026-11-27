// Composants partagés par toutes les pages. Chaque fonction reçoit le contexte (ctx) construit par
// scripts/build.mjs : { site, medias, equipe, projets, manifest }.
// Pour ajouter un bloc, écrire une fonction ici puis l’appeler depuis une page de src/templates/pages/.

export const esc = (v = "") => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const attrs = (o) => Object.entries(o).filter(([, v]) => v !== false && v != null && v !== "").map(([k, v]) => v === true ? ` ${k}` : ` ${k}="${esc(v)}"`).join("");
const ext = (href) => /^https?:/.test(href || "");
export const link = (href, label, cls = "") => `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ""}${ext(href) ? ' rel="noopener"' : ""}>${label}</a>`;

// Image responsive (AVIF + WebP). `sizes` décrit la largeur affichée.
export function picture(ctx, key, { sizes = "100vw", eager = false, cls = "", alt } = {}) {
  const m = ctx.manifest.images[key];
  const info = ctx.medias.images?.[key] || {};
  if (!m) return `<!-- image manquante : ${esc(key)} -->`;
  const set = (e) => m.widths.map((w) => `assets/img/${key}-${w}.${e} ${w}w`).join(", ");
  const style = info.cadrage ? ` style="object-position:${esc(info.cadrage)}"` : "";
  return `<picture${cls ? ` class="${cls}"` : ""}><source type="image/avif" srcset="${set("avif")}" sizes="${sizes}"><img src="assets/img/${key}-${m.widths.at(-1)}.webp" srcset="${set("webp")}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt ?? info.alt ?? "")}"${style}${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}></picture>`;
}

// Boucle vidéo muette : se lance seulement à l’écran (assets/site.js), jamais en mouvement réduit.
export function loop(ctx, ref, { sizes = "100vw", eager = false, cls = "", decorative = false } = {}) {
  const b = ctx.manifest.boucles[ref];
  if (!b) return `<!-- boucle manquante : ${esc(ref)} -->`;
  const p = ctx.manifest.images[b.poster];
  return `<div class="loop${cls ? " " + cls : ""}" data-loop style="--ratio:${b.w}/${b.h}">
    ${picture(ctx, b.poster, { sizes, eager, alt: decorative ? "" : b.alt })}
    <video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" width="${p.w}" height="${p.h}" data-hd="${b.hd}" data-sd="${b.sd}"></video>
  </div>`;
}

// Le média principal d’un projet : sa boucle, sinon son affiche.
export function cover(ctx, projet, opts = {}) {
  if (projet.boucle && ctx.manifest.boucles[projet.boucle]) return loop(ctx, projet.boucle, opts);
  if (projet.affiche) return `<div class="still${opts.cls ? " " + opts.cls : ""}">${picture(ctx, projet.affiche, opts)}</div>`;
  return "";
}

const minutes = (s) => s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")}` : `${s} s`;

// Bouton qui ouvre un film dans la salle de projection (dialog unique par page).
export function filmButton(ctx, key, { label, cls = "", sizes = "(min-width: 900px) 40vw, 92vw" } = {}) {
  const f = ctx.manifest.films[key];
  if (!f) return "";
  return `<button type="button" class="film${cls ? " " + cls : ""}" data-film="${f.src}" data-poster="assets/img/${f.poster}-${ctx.manifest.images[f.poster].widths.at(-1)}.webp" data-title="${esc(f.titre)}" data-credit="${esc(f.credit)}" data-source="${esc(f.lien)}" data-w="${f.w}" data-h="${f.h}" style="--ratio:${f.w}/${f.h}">
    ${picture(ctx, f.poster, { sizes, alt: "" })}
    <span class="film-label"><span class="film-play" aria-hidden="true"></span><span><strong>${esc(label || f.titre)}</strong><span>${minutes(f.duree)} · ${esc(f.credit)}</span></span></span>
  </button>`;
}

export const projection = `<dialog class="projection" aria-label="Lecture de la vidéo">
  <div class="projection-room">
    <button type="button" class="projection-close">Fermer</button>
    <figure class="projection-screen"><video controls playsinline preload="none"></video><figcaption><strong></strong><span></span> <a rel="noopener">Voir la publication</a></figcaption></figure>
  </div>
</dialog>`;

// Billet perforé (slide-text-button, Kokonut UI) — le texte roule au survol et au focus.
export const ticket = (href, label, cls = "") => `<a class="ticket${cls ? " " + cls : ""}" href="${esc(href)}"${ext(href) ? ' rel="noopener"' : ""}><span class="ticket-window"><span class="ticket-roll"><span>${label}</span><span aria-hidden="true">${label}</span></span></span><i aria-hidden="true"></i></a>`;

// Le décor projeté : un mot répété sur plusieurs lignes, chacune à une largeur d’Archivo différente.
// La première ligne porte le titre (h1/h2 selon `tag`) ; les répétitions sont cachées aux lecteurs d’écran.
export function decor(text, { tag = "p", widths = [62, 125, 88, 104], cls = "", id = "" } = {}) {
  const lines = widths.map((w, i) => `<span class="decor-line" style="--w:${w}"${i ? ' aria-hidden="true"' : ""}>${esc(text)}</span>`).join("");
  return `<${tag} class="decor${cls ? " " + cls : ""}"${id ? ` id="${id}"` : ""} data-decor>${lines}</${tag}>`;
}

// Prénom NOM, à la manière des portraits publiés par L’Urbaine.
export const personName = (p) => `<span class="name"><span class="name-first">${esc(p.prenom)}</span> <span class="name-last">${esc(p.nom)}</span></span>`;

export const gelStyle = (gel) => gel ? ` style="--gel:${esc(gel)}"` : "";

export function bureau(ctx, { headingTag = "h2", id = "bureau" } = {}) {
  const e = ctx.equipe;
  return `<section class="bureau" id="${id}" aria-labelledby="${id}-titre">
  <div class="wrap">
    <header class="bureau-head"><${headingTag} id="${id}-titre" class="section-title">Le bureau</${headingTag}><p class="bureau-mandat">${esc(e.mandat)}</p></header>
    <ul class="bureau-list">
      ${e.bureau.map((p, i) => `<li class="person person--${i + 1}">
        <figure>${picture(ctx, p.photo, { sizes: "(min-width: 900px) 24vw, 46vw" })}
          <figcaption>${personName(p)}<span class="person-role">${esc(p.role)}</span></figcaption>
        </figure>
      </li>`).join("")}
    </ul>
    <p class="bureau-merci">« ${esc(e.merci)} » ${link(e.annonce, "Lire l’annonce du bureau", "text-link")}</p>
  </div>
</section>`;
}

export function contact(ctx, { id = "contact" } = {}) {
  const c = ctx.site.contact;
  return `<section class="contact" id="${id}" aria-labelledby="${id}-titre">
  <div class="wrap contact-grid">
    <h2 id="${id}-titre" class="contact-title"><span>Rejoindre</span> <span>l’Urbaine</span></h2>
    <div class="contact-copy">
      <p>${esc(ctx.equipe.recrutement)} Pour inviter le collectif sur un projet, une soirée ou un tournage, écris à l’équipe.</p>
      <div class="contact-actions">${ticket(`mailto:${c.email}`, esc(c.email))}${link(c.instagram, `Instagram ${esc(c.instagram_nom)}`, "text-link")}</div>
    </div>
  </div>
</section>`;
}
