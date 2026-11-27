// Fonction Cloudflare Pages, active seulement sur /assets/video/* (le reste du site est servi tel quel).
// Les fichiers statiques de Cloudflare répondent « 200 » au lieu de « 206 » quand le navigateur demande
// un morceau de fichier (en-tête Range) : Safari, sur iPhone notamment, refuse alors de lire la vidéo.
// Ici, on renvoie seulement le morceau demandé, en flux (les octets partent dès qu’ils arrivent :
// pas de mise en mémoire du fichier entier, donc un démarrage immédiat même pour les gros films).
// Documentation : developers.cloudflare.com/workers/static-assets/billing-and-limitations/#range-requests
export async function onRequest({ request, env }) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response(null, { status: 405 });
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
  if (!asset.ok || !asset.body) return asset;

  const headers = new Headers(asset.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=604800");
  const range = request.headers.get("Range");
  if (!range) return new Response(request.method === "HEAD" ? null : asset.body, { status: 200, headers });

  // Taille du fichier : donnée par l’en-tête ; à défaut, on lit le fichier (cas rare).
  let size = Number(asset.headers.get("Content-Length"));
  let buffered = null;
  if (!size) { buffered = new Uint8Array(await asset.arrayBuffer()); size = buffered.byteLength; }

  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start = m && m[1] !== "" ? Number(m[1]) : NaN;
  let end = m && m[2] !== "" ? Number(m[2]) : NaN;
  if (Number.isNaN(start) && !Number.isNaN(end)) { start = Math.max(0, size - end); end = size - 1; } // bytes=-N
  if (Number.isNaN(end) || end >= size) end = size - 1;
  if (!m || Number.isNaN(start) || start > end || start >= size) {
    asset.body?.cancel?.();
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" } });
  }
  const length = end - start + 1;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(length));
  if (request.method === "HEAD") { asset.body?.cancel?.(); return new Response(null, { status: 206, headers }); }
  if (buffered) return new Response(buffered.slice(start, end + 1), { status: 206, headers });

  // Découpe en flux : on laisse passer seulement les octets [start, end].
  let pos = 0;
  const slicer = new TransformStream({
    transform(chunk, ctl) {
      const from = pos, to = pos + chunk.byteLength;
      pos = to;
      if (to <= start) return;
      if (from > end) { ctl.terminate(); return; }
      ctl.enqueue(chunk.subarray(Math.max(0, start - from), Math.min(chunk.byteLength, end + 1 - from)));
      if (to > end) ctl.terminate();
    }
  });
  let body = asset.body.pipeThrough(slicer);
  if (typeof FixedLengthStream === "function") {
    const fixed = new FixedLengthStream(length);
    body.pipeTo(fixed.writable).catch(() => {});
    body = fixed.readable;
  }
  return new Response(body, { status: 206, headers });
}
