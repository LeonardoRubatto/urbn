// Lecture des contenus de content/ : réglages, médias, équipe et projets.
// Rien ici ne produit de HTML ; tout ce qui est éditorial vit dans content/.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import MarkdownIt from "markdown-it";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const path = (...parts) => join(root, ...parts);

const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
const readYaml = (file) => YAML.parse(readFileSync(path(file), "utf8"));

function frontMatter(text, file) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file} : l’en-tête entre deux lignes --- est introuvable.`);
  return { data: YAML.parse(match[1]) || {}, body: match[2].trim() };
}

// « 2026-12-02T18:45 », « 2026-12-02 » ou « 2022 » → { iso, annee, heure, date }
export function parseDate(value) {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  const m = text.match(/^(\d{4})(?:-(\d{2})-(\d{2}))?(?:[T ](\d{2}):(\d{2}))?$/);
  if (!m) return { invalid: text };
  const [, y, mo = "01", d = "01", h, mi] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h ?? 23), Number(mi ?? 59));
  return { iso: h ? `${y}-${mo}-${d}T${h}:${mi}` : `${y}-${mo}-${d}`, annee: y, heure: h ? `${Number(h)} h ${mi === "00" ? "" : mi}`.trim() : null, date, precise: Boolean(m[2]) };
}

const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
export const dateLongue = (d) => `${jours[d.date.getDay()]} ${d.date.getDate() === 1 ? "1er" : d.date.getDate()} ${mois[d.date.getMonth()]} ${d.annee}`;
export const dateCourte = (d) => `${d.date.getDate() === 1 ? "1er" : d.date.getDate()} ${mois[d.date.getMonth()]} ${d.annee}`;
export const moisAnnee = (d) => `${mois[d.date.getMonth()]} ${d.annee}`;

export function loadContent({ today = new Date() } = {}) {
  const site = readYaml("content/site.yml");
  const medias = readYaml("content/medias.yml");
  const equipe = readYaml("content/equipe.yml");
  const dir = path("content/projets");
  const projets = readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => {
      const { data, body } = frontMatter(readFileSync(join(dir, file), "utf8"), `content/projets/${file}`);
      const slug = basename(file, ".md");
      const date = parseDate(data.date);
      return {
        ...data,
        slug,
        fichier: `content/projets/${file}`,
        page: data.page !== false,
        href: data.page === false ? data.lien : `${slug}.html`,
        films: data.films || [],
        photos: data.photos || [],
        sources: data.sources || [],
        date,
        aVenir: Boolean(date?.date && date.date >= today),
        corps: body ? md.render(body) : "",
        brouillon: data.brouillon === true
      };
    })
    .filter((p) => !p.brouillon)
    .sort((a, b) => (a.ordre ?? 99) - (b.ordre ?? 99) || a.titre.localeCompare(b.titre, "fr"));

  return { site, medias, equipe, projets, today };
}

export const exists = (file) => existsSync(path(file));
