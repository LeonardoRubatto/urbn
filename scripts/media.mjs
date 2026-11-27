// Crée les versions web des médias déclarés dans content/medias.yml.
//   images : AVIF + WebP en plusieurs largeurs        → dist/assets/img/<clé>-<largeur>.<avif|webp>
//   boucles : extraits muets H.264 (+ version téléphone) → dist/assets/video/<clé>-<boucle>[-sd].mp4
//   films  : vidéo entière H.264 + AAC                  → dist/assets/video/<clé>.mp4
// Un média n’est refait que si son fichier d’origine ou ses réglages ont changé (empreinte du contenu,
// pas la date du fichier : le build donne le même résultat en local et sur GitHub).
// Les vidéos demandent ffmpeg (https://ffmpeg.org, ou « winget install Gyan.FFmpeg ») ;
// la variable FFMPEG peut pointer vers l’exécutable. Sans ffmpeg, les vidéos déjà produites restent utilisées.
//
//   node scripts/media.mjs            tout
//   node scripts/media.mjs --force    refait tout
import { mkdirSync, existsSync, statSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { loadContent, path } from "./lib/content.mjs";

const IMAGE_WIDTHS = [480, 800, 1200, 1800, 2400];
const POSTER_WIDTHS = [640, 1280];
const MAX_FILE = 24 * 1024 * 1024;
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FFPROBE = process.env.FFPROBE || FFMPEG.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");

const out = (...p) => path("dist", "assets", ...p);
const hashes = new Map();
const hashOf = (file) => { if (!hashes.has(file)) hashes.set(file, createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 16)); return hashes.get(file); };
// Une entrée du manifeste précédent sans empreinte (ancien format) est acceptée telle quelle.
const same = (prev, hash) => Boolean(prev) && (!prev.hash || prev.hash === hash);
const hasFfmpeg = () => spawnSync(FFMPEG, ["-version"], { stdio: "ignore" }).status === 0;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`${cmd} a échoué : ${(r.stderr || "").split("\n").slice(-6).join("\n")}`);
  return r.stdout;
}

async function variants(input, base, widths, { quality = { avif: 52, webp: 80 } } = {}) {
  const meta = await sharp(input).rotate().metadata();
  const srcW = meta.autoOrient?.width ?? meta.width;
  const srcH = meta.autoOrient?.height ?? meta.height;
  const list = [...new Set([...widths.filter((w) => w < srcW), Math.min(srcW, widths.at(-1))])].sort((a, b) => a - b);
  for (const w of list) {
    for (const ext of ["avif", "webp"]) {
      const file = out("img", `${base}-${w}.${ext}`);
      const img = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
      await (ext === "avif" ? img.avif({ quality: quality.avif, effort: 5 }) : img.webp({ quality: quality.webp })).toFile(file);
    }
  }
  return { w: srcW, h: srcH, widths: list };
}

function probe(file) {
  try {
    const json = JSON.parse(run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", file]));
    return { w: json.streams[0].width, h: json.streams[0].height, duree: Math.round(Number(json.format.duration)) };
  } catch { return null; }
}

// Échelle : le grand côté à 1280 px au plus (HD), 720 px pour la version téléphone.
const scale = (long, portrait) => portrait ? `scale=-2:'min(${long},ih)'` : `scale='min(${long},iw)':-2`;

export async function buildMedia({ force = false, log = console.log } = {}) {
  const { medias } = loadContent();
  mkdirSync(out("img"), { recursive: true });
  mkdirSync(out("video"), { recursive: true });
  const manifestFile = out("medias.json");
  const previous = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : { images: {}, boucles: {}, films: {} };
  const manifest = { images: {}, boucles: {}, films: {} };
  const warnings = [];

  // Images
  const entries = Object.entries(medias.images || {});
  let done = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (entries.length) {
      const [key, image] = entries.shift();
      const src = path("media", "images", image.fichier || "");
      if (!image.fichier || !existsSync(src)) { warnings.push(`Image « ${key} » : fichier media/images/${image.fichier} introuvable.`); continue; }
      const hash = hashOf(src);
      const prev = previous.images[key];
      const ready = !force && same(prev, hash) && prev.widths.every((w) => existsSync(out("img", `${key}-${w}.avif`)) && existsSync(out("img", `${key}-${w}.webp`)));
      manifest.images[key] = ready ? { ...prev, hash } : { ...(await variants(src, key, IMAGE_WIDTHS)), hash };
      done++;
    }
  }));
  log(`  images : ${done} prêtes`);

  // Vidéos
  const ffmpeg = hasFfmpeg();
  if (!ffmpeg) warnings.push("ffmpeg introuvable : les vidéos déjà produites sont gardées, les nouvelles ne seront pas créées.");
  const tmp = path("dist", "assets", "video", ".tmp");
  mkdirSync(tmp, { recursive: true });

  for (const [key, video] of Object.entries(medias.videos || {})) {
    const src = path("media", "videos", video.fichier || "");
    if (!existsSync(src)) { warnings.push(`Vidéo « ${key} » : fichier media/videos/${video.fichier} introuvable.`); continue; }
    const hash = hashOf(src);
    const info = (ffmpeg && probe(src)) || previous.films[key]?.source || previous.boucles[Object.keys(previous.boucles).find((k) => k.startsWith(key + "#"))]?.source;
    if (!info) continue;
    const portrait = info.h > info.w;

    for (const [name, loop] of Object.entries(video.boucles || {})) {
      const ref = `${key}#${name}`;
      const hd = out("video", `${key}-${name}.mp4`);
      const sd = out("video", `${key}-${name}-sd.mp4`);
      const posterBase = `boucle-${key}-${name}`;
      const was = previous.boucles[ref];
      const moved = !same(was, hash) || was.debut !== loop.debut || was.duree !== loop.duree;
      if (ffmpeg && (force || moved || !existsSync(hd) || !existsSync(sd))) {
        log(`  boucle ${ref}`);
        for (const [file, long, crf] of [[hd, 1280, 25], [sd, 720, 27]]) {
          run(FFMPEG, ["-v", "error", "-y", "-ss", String(loop.debut), "-t", String(loop.duree), "-i", src, "-an",
            "-vf", `${scale(long, portrait)},fps=30`, "-c:v", "libx264", "-preset", "slow", "-crf", String(crf),
            "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", file]);
        }
      }
      const frame = join(tmp, `${posterBase}.png`);
      if (ffmpeg && (force || moved || !existsSync(out("img", `${posterBase}-640.webp`)))) {
        run(FFMPEG, ["-v", "error", "-y", "-ss", String(loop.debut + 0.04), "-i", src, "-frames:v", "1", "-vf", scale(1280, portrait), frame]);
      }
      const poster = existsSync(frame) ? await variants(frame, posterBase, POSTER_WIDTHS) : previous.images[posterBase];
      if (!poster || !existsSync(hd)) { warnings.push(`Boucle « ${ref} » non produite.`); continue; }
      manifest.images[posterBase] = poster;
      manifest.boucles[ref] = { hd: `assets/video/${key}-${name}.mp4`, sd: `assets/video/${key}-${name}-sd.mp4`, poster: posterBase, w: poster.w, h: poster.h, alt: loop.alt || video.titre, source: info, debut: loop.debut, duree: loop.duree, hash };
    }

    if (video.film) {
      const file = out("video", `${key}.mp4`);
      const posterBase = `film-${key}`;
      const changed = !same(previous.films[key], hash);
      if (ffmpeg && (force || changed || !existsSync(file) || statSync(file).size > MAX_FILE)) {
        log(`  film ${key} (${info.duree} s)`);
        run(FFMPEG, ["-v", "error", "-y", "-i", src, "-vf", scale(1280, portrait), "-c:v", "libx264", "-preset", "slow",
          "-crf", "27", "-pix_fmt", "yuv420p", "-profile:v", "high", "-c:a", "aac", "-b:a", "112k", "-movflags", "+faststart", file]);
        // L’hébergeur (Cloudflare Pages) refuse les fichiers de plus de 25 Mio : au-delà de 24 Mio,
        // le film est refait avec un débit calculé sur sa durée.
        if (statSync(file).size > MAX_FILE) {
          const kbps = Math.floor((MAX_FILE * 8) / info.duree / 1000) - 112 - 40;
          log(`  film ${key} trop lourd, réencodé à ${kbps} kb/s`);
          run(FFMPEG, ["-v", "error", "-y", "-i", src, "-vf", scale(1280, portrait), "-c:v", "libx264", "-preset", "slow",
            "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.5)}k`, "-bufsize", `${kbps * 2}k`, "-pix_fmt", "yuv420p", "-profile:v", "high",
            "-c:a", "aac", "-b:a", "112k", "-movflags", "+faststart", file]);
        }
      }
      const frame = join(tmp, `${posterBase}.png`);
      const posterMoved = previous.films[key]?.affiche !== (video.affiche ?? 1);
      if (ffmpeg && (force || changed || posterMoved || !existsSync(out("img", `${posterBase}-640.webp`)))) {
        run(FFMPEG, ["-v", "error", "-y", "-ss", String(video.affiche ?? 1), "-i", src, "-frames:v", "1", "-vf", scale(1280, portrait), frame]);
      }
      const poster = existsSync(frame) ? await variants(frame, posterBase, POSTER_WIDTHS) : previous.images[posterBase];
      if (!poster || !existsSync(file)) { warnings.push(`Film « ${key} » non produit.`); continue; }
      manifest.images[posterBase] = poster;
      manifest.films[key] = { src: `assets/video/${key}.mp4`, poster: posterBase, w: poster.w, h: poster.h, duree: info.duree, titre: video.titre, credit: video.credit, lien: video.source, source: info, affiche: video.affiche ?? 1, hash,
        taille: Math.round(statSync(file).size / 1e5) / 10 };
    }
  }
  rmSync(tmp, { recursive: true, force: true });
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
  log(`  vidéos : ${Object.keys(manifest.boucles).length} boucles, ${Object.keys(manifest.films).length} films`);
  return { manifest, warnings };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("media.mjs")) {
  const { warnings } = await buildMedia({ force: process.argv.includes("--force") });
  for (const w of warnings) console.warn("  ⚠ " + w);
}
