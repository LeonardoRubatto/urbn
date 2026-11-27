// Propose une couleur de lumière (« gel ») pour un projet, mesurée sur ses propres images.
//
//   npm run gel -- media/images/affiche.jpg
//   npm run gel -- media/videos/film.mp4            (6 images réparties sur toute la vidéo)
//   npm run gel -- media/videos/film.mp4 14 6       (seulement le passage de la boucle : début 14 s, durée 6 s)
//
// Méthode : chaque pixel est converti en OKLCH ; on garde les pixels assez colorés et assez clairs,
// on cherche la teinte qui pèse le plus (pondérée par la saturation), on prend la saturation des pixels
// les plus vifs de cette teinte, puis on ramène la luminosité entre 0.55 et 0.88 et la saturation entre 0.10 et 0.24 pour que la lumière reste lisible sur le noir.
// Le résultat est une proposition : on la colle dans le champ « gel » du projet (et de la couverture).
// Les vidéos demandent ffmpeg (variable FFMPEG possible, comme pour scripts/media.mjs).
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { extname } from "node:path";
import sharp from "sharp";

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FFPROBE = process.env.FFPROBE || FFMPEG.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");
const VIDEO = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv"]);

const [file, debutArg, dureeArg] = process.argv.slice(2);
if (!file || !existsSync(file)) {
  console.error("Usage : npm run gel -- <fichier image ou vidéo> [début en s] [durée en s]");
  process.exit(1);
}

// sRGB (0-255) → OKLCH
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
function oklch(r, g, b) {
  r = lin(r); g = lin(g); b = lin(b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), (Math.atan2(B, A) * 180 / Math.PI + 360) % 360];
}

function frames() {
  if (!VIDEO.has(extname(file).toLowerCase())) return [sharp(file)];
  const probe = spawnSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  if (probe.error) { console.error("ffmpeg introuvable (winget install Gyan.FFmpeg)."); process.exit(1); }
  const total = Number(probe.stdout.trim()) || 1;
  const debut = debutArg !== undefined ? Number(debutArg) : 0;
  const duree = dureeArg !== undefined ? Number(dureeArg) : total - debut;
  return Array.from({ length: 6 }, (_, i) => {
    const t = Math.min(total - 0.1, debut + duree * (i + 0.5) / 6);
    const out = spawnSync(FFMPEG, ["-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", "scale=160:-1", "-f", "image2pipe", "-vcodec", "png", "-"], { maxBuffer: 1 << 26 });
    return out.stdout?.length ? sharp(out.stdout) : null;
  }).filter(Boolean);
}

const BINS = 24; // tranches de 15°
const weight = new Array(BINS).fill(0), sumL = new Array(BINS).fill(0);
const sx = new Array(BINS).fill(0), sy = new Array(BINS).fill(0);
const chromas = Array.from({ length: BINS }, () => []);
let kept = 0, seen = 0;
for (const img of frames()) {
  const { data, info } = await img.removeAlpha().resize(64, 64, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    seen++;
    const [L, C, H] = oklch(data[i], data[i + 1], data[i + 2]);
    if (L < 0.25 || C < 0.06) continue; // ombres et gris : pas une lumière
    kept++;
    const b = Math.floor(H / (360 / BINS)) % BINS, w = C * C;
    weight[b] += w; sumL[b] += L * w; chromas[b].push(C);
    sx[b] += Math.cos(H * Math.PI / 180) * w; sy[b] += Math.sin(H * Math.PI / 180) * w;
  }
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const round = (v, d) => Number(v.toFixed(d));
if (kept < seen * 0.01) {
  console.log("Images presque sans couleur : proposer une lumière neutre, par exemple oklch(0.8 0.1 90), ou choisir à l’œil.");
  process.exit(0);
}
// Une teinte = sa tranche + ses deux voisines ; on garde les trois plus fortes, assez éloignées.
const score = weight.map((_, b) => weight[(b + BINS - 1) % BINS] + weight[b] + weight[(b + 1) % BINS]);
const order = score.map((s, b) => [s, b]).sort((a, b) => b[0] - a[0]);
const picks = [];
for (const [s, b] of order) {
  if (s <= 0 || picks.length === 3) break;
  if (picks.some((p) => Math.min(Math.abs(p - b), BINS - Math.abs(p - b)) < 4)) continue;
  picks.push(b);
}
const total = score.reduce((a, b) => a + b, 0) / 3;
console.log(`${file} — ${kept} pixels colorés sur ${seen}\n`);
picks.forEach((b, rank) => {
  const nb = [(b + BINS - 1) % BINS, b, (b + 1) % BINS];
  const w = nb.reduce((a, k) => a + weight[k], 0);
  const H = (Math.atan2(nb.reduce((a, k) => a + sy[k], 0), nb.reduce((a, k) => a + sx[k], 0)) * 180 / Math.PI + 360) % 360;
  const L = clamp(nb.reduce((a, k) => a + sumL[k], 0) / w, 0.55, 0.88);
  // Saturation : celle des pixels les plus vifs de la teinte (90e centile), une lumière n’est pas délavée.
  const cs = nb.flatMap((k) => chromas[k]).sort((a, z) => a - z);
  const C = clamp(cs[Math.floor(cs.length * 0.9)] ?? 0.1, 0.1, 0.24);
  const share = Math.round(score[b] / total * 100);
  console.log(`${rank === 0 ? "gel proposé  " : "autre teinte "} gel: "oklch(${round(L, 2)} ${round(C, 2)} ${Math.round(H)})"   (${share} % de la couleur)`);
});
console.log("\nÀ vérifier à l’œil sur la page : c’est la lumière du projet, pas forcément sa couleur la plus présente.");
