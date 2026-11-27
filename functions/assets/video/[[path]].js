// Fonction Cloudflare Pages, active seulement sur /assets/video/* (le reste du site est servi tel quel).
// Les fichiers statiques de Cloudflare répondent « 200 » au lieu de « 206 » quand le navigateur demande
// un morceau de fichier (en-tête Range) : Safari, sur iPhone notamment, refuse alors de lire la vidéo.
// Ici, on récupère le fichier et on ne renvoie que le morceau demandé, avec les bons en-têtes.
// Documentation : developers.cloudflare.com/workers/static-assets/billing-and-limitations/#range-requests
export async function onRequest({ request, env }) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response(null, { status: 405 });
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
  if (!asset.ok) return asset;

  const headers = new Headers(asset.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=604800");
  const range = request.headers.get("Range");
  if (!range) return new Response(request.method === "HEAD" ? null : asset.body, { status: 200, headers });

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start = m && m[1] !== "" ? Number(m[1]) : NaN;
  let end = m && m[2] !== "" ? Number(m[2]) : NaN;
  if (Number.isNaN(start) && !Number.isNaN(end)) { start = Math.max(0, size - end); end = size - 1; } // bytes=-N
  if (Number.isNaN(end) || end >= size) end = size - 1;
  if (!m || Number.isNaN(start) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" } });
  }
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(request.method === "HEAD" ? null : body.slice(start, end + 1), { status: 206, headers });
}
