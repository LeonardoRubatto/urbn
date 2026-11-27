// Génère le site dans dist/ à partir de content/, media/ et src/.
//   npm run build   → médias (si besoin) + pages + styles + scripts
//   npm run check   → vérifie les contenus et le site généré, sans rien écrire ; code de sortie 1 en cas d’erreur
// Ne modifie jamais un fichier de dist/ à la main : il est recréé à chaque build.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { loadContent, path } from "./lib/content.mjs";
import { buildMedia } from "./media.mjs";
import { layout } from "../src/templates/layout.mjs";
import { home } from "../src/templates/pages/home.mjs";
import { projets } from "../src/templates/pages/projets.mjs";
import { projet } from "../src/templates/pages/projet.mjs";
import { collectif, mentions } from "../src/templates/pages/collectif.mjs";

const CHECK = process.argv.includes("--check");
const dist = (...p) => path("dist", ...p);
const errors = [];
const warnings = [];

// ---------- 1. Contenus ----------
const content = loadContent();
const { site, medias, equipe, projets: list } = content;

function validate(manifest) {
  const img = (key, where) => { if (key && !medias.images?.[key]) errors.push(`${where} : l’image « ${key} » n’est pas déclarée dans content/medias.yml.`); };
  const vid = (key, where) => { if (key && !medias.videos?.[key]) errors.push(`${where} : la vidéo « ${key} » n’est pas déclarée dans content/medias.yml.`); };
  const boucle = (ref, where) => {
    if (!ref) return;
    const [v, b] = ref.split("#");
    if (!medias.videos?.[v]?.boucles?.[b]) errors.push(`${where} : la boucle « ${ref} » n’existe pas (format vidéo#nom, voir content/medias.yml).`);
  };
  for (const [k, i] of Object.entries(medias.images || {})) {
    if (!i.alt) errors.push(`content/medias.yml : l’image « ${k} » n’a pas de texte « alt ».`);
    if (!i.credit) errors.push(`content/medias.yml : l’image « ${k} » n’a pas de « credit ».`);
    if (!existsSync(path("media/images", i.fichier || "?"))) errors.push(`content/medias.yml : media/images/${i.fichier} introuvable (image « ${k} »).`);
  }
  for (const [k, v] of Object.entries(medias.videos || {})) {
    if (!existsSync(path("media/videos", v.fichier || "?"))) errors.push(`content/medias.yml : media/videos/${v.fichier} introuvable (vidéo « ${k} »).`);
    if (!v.credit) errors.push(`content/medias.yml : la vidéo « ${k} » n’a pas de « credit ».`);
  }
  const slugs = new Set();
  for (const p of list) {
    const w = p.fichier;
    if (!/^[a-z0-9-]+$/.test(p.slug)) errors.push(`${w} : le nom du fichier doit être en minuscules, sans accent ni espace (ex. ma-soiree.md).`);
    if (slugs.has(p.slug)) errors.push(`${w} : deux projets ont le même nom de fichier.`);
    slugs.add(p.slug);
    for (const f of ["titre", "famille", "resume", "gel"]) if (!p[f]) errors.push(`${w} : le champ « ${f} » est obligatoire.`);
    if (p.famille && !site.familles[p.famille]) errors.push(`${w} : famille « ${p.famille} » inconnue (choix : ${Object.keys(site.familles).join(", ")}).`);
    if (p.gel && !/^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/.test(p.gel)) errors.push(`${w} : « gel » doit s’écrire oklch(L C H), ex. "oklch(0.56 0.24 266)".`);
    if (p.date?.invalid) errors.push(`${w} : date « ${p.date.invalid} » illisible (AAAA-MM-JJ ou AAAA-MM-JJTHH:MM).`);
    if (!p.page && !p.lien) errors.push(`${w} : un projet sans page (page: false) doit avoir un « lien ».`);
    if (p.page && !p.boucle && !p.affiche) errors.push(`${w} : il faut une « boucle » ou une « affiche » pour la couverture.`);
    boucle(p.boucle, w); img(p.affiche, w);
    p.films.forEach((f) => { vid(f, w); if (medias.videos?.[f] && !medias.videos[f].film) errors.push(`${w} : la vidéo « ${f} » n’a pas « film: true » dans content/medias.yml.`); });
    p.photos.forEach((k) => img(k, w));
    p.sources.forEach((s) => { if (!s.url || !s.texte) errors.push(`${w} : chaque source a un « texte » et une « url ».`); });
    if (p.aVenir && !p.lieu) warnings.push(`${w} : évènement à venir sans « lieu ».`);
  }
  site.couverture.forEach((s, i) => { boucle(s.boucle, `content/site.yml couverture ${i + 1}`); if (!list.some((p) => p.slug === s.projet)) errors.push(`content/site.yml couverture ${i + 1} : projet « ${s.projet} » introuvable.`); });
  site.multicam?.boucles.forEach((r) => boucle(r, "content/site.yml multicam"));
  vid(site.multicam?.film, "content/site.yml multicam");
  (site.bandeau || []).flat().forEach((k) => img(k, "content/site.yml bandeau"));
  img(equipe.photo_groupe, "content/equipe.yml");
  equipe.bureau.forEach((p) => img(p.photo, `content/equipe.yml (${p.prenom})`));
  vid(equipe.film_famille, "content/equipe.yml");
  if (manifest) {
    for (const p of list) if (p.boucle && !manifest.boucles[p.boucle]) warnings.push(`${p.fichier} : la boucle « ${p.boucle} » n’a pas encore été produite (ffmpeg ?).`);
  }
}

// ---------- 2. Médias ----------
let manifest;
if (CHECK) {
  const file = dist("assets/medias.json");
  manifest = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
  if (!manifest) errors.push("dist/assets/medias.json absent : lance d’abord npm run build.");
} else {
  console.log("Médias");
  const r = await buildMedia({ log: (m) => console.log(m) });
  manifest = r.manifest;
  warnings.push(...r.warnings);
}
validate(manifest);

// ---------- 3. Pages ----------
const ctx = { ...content, manifest };
const pages = [
  { file: "index.html", title: `${site.nom} — Association et média étudiant à Dauphine`, description: "L’Urbaine Paris, association et média étudiant de Paris Dauphine – PSL : DAU’Clash, UR’Night, formats vidéo, fresques et vie de l’asso.", main: home(ctx), gel: site.couverture[0].gel },
  { file: "variante.html", title: `Variante de couverture — ${site.nom}`, description: "Autre version de la couverture de l’accueil, pour comparaison.", main: home(ctx, { hero: site.couverture_style === "plateau" ? "decale" : "plateau" }), gel: site.couverture[0].gel, section: "index.html", sitemap: false },
  { file: "projets.html", title: `Les projets — ${site.nom}`, description: "Scène, soirées, formats vidéo, fresques et vie de l’asso : tous les projets de L’Urbaine Paris.", main: projets(ctx), gel: "oklch(0.8 0.13 66)" },
  { file: "collectif.html", title: `Le collectif — ${site.nom}`, description: "Qui fait L’Urbaine Paris : les pôles, le bureau, comment rejoindre l’association ou lui écrire.", main: collectif(ctx), gel: "oklch(0.74 0.15 140)" },
  { file: "mentions.html", title: `Mentions légales — ${site.nom}`, description: `Mentions légales et crédits du site de ${site.nom}.`, main: mentions(ctx), gel: "oklch(0.6 0.02 270)" },
  ...list.filter((p) => p.page).map((p) => ({
    file: `${p.slug}.html`, section: "projets.html", title: `${p.titre} — ${site.nom}`, description: p.resume, main: projet(ctx, p), gel: p.gel,
    image: p.affiche && manifest.images[p.affiche] ? `assets/img/${p.affiche}-${manifest.images[p.affiche].widths.find((w) => w >= 1200) || manifest.images[p.affiche].widths.at(-1)}.webp` : null
  }))
];

const html = pages.map((p) => ({ file: p.file, text: layout(ctx, p) }));

// ---------- 4. Vérification des liens et fichiers du site généré ----------
function checkLinks(files) {
  const names = new Set(files.map((f) => f.file));
  for (const { file, text } of files) {
    for (const [, url] of text.matchAll(/(?:href|src|data-hd|data-sd|data-film|data-poster)="([^"#?]+)[^"]*"/g)) {
      if (/^(https?:|mailto:|data:)/.test(url) || url === "") continue;
      if (url.endsWith(".html")) { if (!names.has(url)) errors.push(`${file} : lien vers ${url} introuvable.`); continue; }
      if (CHECK ? !existsSync(dist(url)) : !(existsSync(dist(url)) || existsSync(path("src/static", url)) || url === "assets/site.css" || url === "assets/site.js" || url === "assets/partage.jpg")) errors.push(`${file} : fichier ${url} introuvable.`);
    }
    for (const [, set] of text.matchAll(/srcset="([^"]+)"/g)) for (const part of set.split(",")) {
      const url = part.trim().split(" ")[0];
      if (!existsSync(dist(url))) errors.push(`${file} : image ${url} introuvable.`);
    }
    if (!/<h1[\s>]/.test(text)) errors.push(`${file} : pas de titre h1.`);
    const imgs = text.match(/<img [^>]*>/g) || [];
    imgs.forEach((t) => { if (!/ alt="/.test(t)) errors.push(`${file} : une image sans attribut alt.`); });
  }
}

if (CHECK) {
  checkLinks(pages.map((p) => ({ file: p.file, text: existsSync(dist(p.file)) ? readFileSync(dist(p.file), "utf8") : (errors.push(`${p.file} n’a pas été généré.`), "") })));
} else {
  // Nettoyage : anciennes pages et anciens fichiers à la racine d’assets (img/ et video/ sont conservés).
  for (const f of readdirSync(dist())) if (/\.(html|xml|txt|json|webmanifest)$/.test(f)) rmSync(dist(f));
  for (const f of readdirSync(dist("assets"))) {
    const full = dist("assets", f);
    if (statSync(full).isFile() && f !== "medias.json") rmSync(full);
  }
  // Fichiers statiques
  const copy = (from, to) => { for (const f of readdirSync(from)) { const s = join(from, f), d = join(to, f); if (statSync(s).isDirectory()) { mkdirSync(d, { recursive: true }); copy(s, d); } else copyFileSync(s, d); } };
  copy(path("src/static"), dist());
  // Styles et scripts : les fichiers de src/css et src/js sont assemblés dans l’ordre de leur nom.
  const bundle = (dir) => readdirSync(path(dir)).filter((f) => !f.startsWith("_")).sort().map((f) => `/* ${dir}/${f} */\n` + readFileSync(path(dir, f), "utf8")).join("\n");
  writeFileSync(dist("assets/site.css"), bundle("src/css"));
  writeFileSync(dist("assets/site.js"), bundle("src/js"));
  // Image de partage (1200 × 630) à partir de la première boucle de couverture
  const posterKey = manifest.boucles[site.couverture[0].boucle]?.poster;
  if (posterKey) await sharp(dist("assets/img", `${posterKey}-${manifest.images[posterKey].widths.at(-1)}.webp`)).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82 }).toFile(dist("assets/partage.jpg"));
  for (const { file, text } of html) writeFileSync(dist(file), text);
  const origin = site.adresse_site.replace(/\/$/, "");
  writeFileSync(dist("sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter((p) => p.sitemap !== false).map((p) => `\n  <url><loc>${origin}/${p.file === "index.html" ? "" : p.file}</loc></url>`).join("")}\n</urlset>\n`);
  writeFileSync(dist("robots.txt"), site.prive ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  checkLinks(html);
  console.log(`Pages : ${html.length} écrites dans dist/`);
}

for (const w of warnings) console.warn(`  ⚠ ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} problème(s) :`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(CHECK ? "Vérification : tout est en ordre." : "Build terminé. Ouvre dist/index.html (double-clic) pour vérifier.");
