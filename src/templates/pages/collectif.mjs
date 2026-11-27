// Page Collectif : présentation, la famille en vidéo, les pôles, le bureau, le contact.
import { esc, link, picture, filmButton, decor, bureau, contact, collaborations } from "../components.mjs";

export function collectif(ctx) {
  const e = ctx.equipe;
  const widths = [62, 125, 80, 110, 92, 70];
  return `<section class="collectif" aria-labelledby="titre-collectif">
  <header class="collectif-cover">
    <div class="collectif-photo">${picture(ctx, e.photo_groupe, { eager: true, sizes: "(min-width: 900px) 52vw, 100vw" })}</div>
    <div class="plateau-light" aria-hidden="true"></div>
    ${decor("Collectif", { tag: "h1", id: "titre-collectif", widths: [62, 125, 88], cls: "decor--page decor--collectif" })}
  </header>
  <div class="wrap collectif-intro">
    <div class="prose collectif-text">${e.presentation.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
    ${e.film_famille ? filmButton(ctx, e.film_famille, { label: "L’urbaine, une grande famille", cls: "film--portrait", sizes: "(min-width: 900px) 26vw, 70vw" }) : ""}
  </div>
</section>
<section class="poles" aria-labelledby="titre-poles">
  <div class="wrap">
    <h2 id="titre-poles" class="section-title">Les pôles</h2>
    <ul class="poles-list" role="list">${e.poles.map((p, i) => `<li style="--w:${widths[i % widths.length]}">${esc(p)}</li>`).join("")}</ul>
  </div>
</section>
${bureau(ctx)}
${collaborations(ctx)}
${contact(ctx)}`;
}

export function mentions(ctx) {
  const m = ctx.site.mentions;
  const credits = [...new Set(Object.values(ctx.medias.images).map((i) => i.credit).concat(Object.values(ctx.medias.videos).map((v) => v.credit)))];
  return `<section class="wrap legal" aria-labelledby="titre-mentions">
  <h1 id="titre-mentions" class="section-title">Mentions légales</h1>
  <div class="prose">
    <dl class="legal-facts">
      <div><dt>Éditeur</dt><dd>${esc(m.editeur)}</dd></div>
      <div><dt>Direction de la publication</dt><dd>${esc(m.direction_publication)}</dd></div>
      <div><dt>Hébergement</dt><dd>${esc(m.hebergeur)}</dd></div>
      <div><dt>Contact</dt><dd>${link(`mailto:${ctx.site.contact.email}`, esc(ctx.site.contact.email))}</dd></div>
    </dl>
    <h2>Photos et vidéos</h2><p>Les photos et vidéos proviennent des publications de L’Urbaine et de ses partenaires. Elles restent attribuées à leurs auteurs : ${esc(credits.join(" ; "))}. Chaque image renvoie à sa publication d’origine.</p>
    <h2>Données personnelles</h2><p>Le site ne dépose aucun cookie et ne mesure pas l’audience. Les liens vers Instagram et les sites partenaires mènent à des services tiers soumis à leurs propres règles.</p>
    <h2>Crédits techniques</h2><p>Police Archivo (Omnibus-Type, SIL Open Font License 1.1). Composants adaptés de Codrops et Kokonut UI (licence MIT). Conception et réalisation : ${link("https://telaventis.fr", "Telaventis")}.</p>
  </div>
</section>`;
}
