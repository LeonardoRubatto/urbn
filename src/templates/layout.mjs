// L’enveloppe commune : <head>, en-tête, pied de page, rideau de passage entre pages, salle de projection.
import { esc, link, projection } from "./components.mjs";

export function layout(ctx, { title, description, file, section = file, gel, main, image, bodyClass = "" }) {
  const { site } = ctx;
  const origin = site.adresse_site.replace(/\/$/, "");
  const canonical = `${origin}/${file === "index.html" ? "" : file}`;
  const share = image ? `${origin}/${image}` : `${origin}/assets/partage.jpg`;
  const nav = (href, label) => `<a href="${href}"${section === href ? ' aria-current="page"' : ""}>${label}</a>`;
  const ld = file === "index.html" ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: site.nom, alternateName: "URBN", url: origin, foundingDate: String(site.fondation), email: site.contact.email, sameAs: [site.contact.instagram] })}</script>` : "";
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${site.prive ? '<meta name="robots" content="noindex,nofollow">' : ""}
  <meta name="theme-color" content="#0b0c14">
  <meta name="color-scheme" content="dark">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="${esc(site.nom)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${share}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/favicon.ico" sizes="any">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/icon-180.png">
  <link rel="stylesheet" href="assets/site.css">
  <script src="assets/site.js" defer></script>
  ${ld}
</head>
<body class="page-${file.replace(".html", "")}${bodyClass ? " " + bodyClass : ""}"${gel ? ` style="--gel:${esc(gel)}"` : ""}>
  <svg class="curtain" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="curtain-trace" d="M 0 100 V 100 Q 50 100 100 100 V 100 Z"/><path class="curtain-paper" d="M 0 100 V 100 Q 50 100 100 100 V 100 Z"/></svg>
  <a class="skip" href="#contenu">Aller au contenu</a>
  <header class="mast">
    <a href="index.html" class="brand" aria-label="L’Urbaine, accueil">Urbn<span>.</span></a>
    <nav aria-label="Navigation principale">${nav("projets.html", "Projets")}${nav("collectif.html", "Collectif")}<a href="collectif.html#contact">Contact</a></nav>
  </header>
  <main id="contenu">${main}</main>
  <footer class="foot">
    <div class="foot-mark" aria-hidden="true"><span>Urbn</span><i></i></div>
    <div class="foot-grid">
      <p>${esc(site.nom)}<br>${esc(site.baseline)}<br>Depuis ${site.fondation}</p>
      <p>${link(`mailto:${site.contact.email}`, esc(site.contact.email))}<br>${link(site.contact.instagram, `Instagram ${esc(site.contact.instagram_nom)}`)}</p>
      <p>${link("projets.html", "Projets")}<br>${link("collectif.html", "Collectif")}<br>${link("mentions.html", "Mentions légales")}</p>
    </div>
    <p class="foot-credit"><a href="https://telaventis.fr" rel="noopener">Site par Telaventis</a></p>
  </footer>
  ${projection}
</body>
</html>`;
}
