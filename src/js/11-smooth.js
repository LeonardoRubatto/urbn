// Changements de mise en page en douceur. Plusieurs titres s’élargissent au survol (axe de largeur
// d’Archivo) et peuvent passer sur une ligne de plus : sans ce module, le bloc et tout ce qui suit
// sautent d’un coup. Ici :
//   1. le bloc glisse vers sa nouvelle hauteur (le contenu dessous suit) ;
//   2. les mots qui changent de ligne glissent jusqu’à leur nouvelle place ;
//   3. dans les listes, un élément qui change de rangée glisse aussi.
// Seuls les vrais sauts sont animés (au-delà de quelques pixels) : l’élargissement continu
// du texte reste tel quel. En mouvement réduit, rien n’est animé.
(() => {
  if (!("ResizeObserver" in window)) return;
  const EASE = "cubic-bezier(.22,1,.36,1)";
  const DUR = 480;
  const JUMP = 10;
  const still = () => reduceMotion.matches;

  // Animation FLIP : de l’ancienne position vers la nouvelle.
  function glide(el, from, to) {
    const dx = from.left - to.left, dy = from.top - to.top;
    if (Math.abs(dx) < JUMP && Math.abs(dy) < JUMP) return false;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: DUR, easing: EASE });
    return true;
  }

  // Positions relatives à un repère (le bloc), pour ne pas confondre défilement et saut.
  const rel = (el, ref) => { const a = el.getBoundingClientRect(), b = ref.getBoundingClientRect(); return { left: a.left - b.left, top: a.top - b.top }; };

  // 1 + 2 : titre dont la hauteur peut changer ; ses mots glissent.
  function smoothTitle(el) {
    if (el.dataset.smooth) return;
    el.dataset.smooth = "";
    const host = el.querySelector("a") || el;
    // Découpe en mots (le texte reste identique pour les lecteurs d’écran).
    [...host.childNodes].forEach((node) => {
      if (node.nodeType !== 3 || !node.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(" "); return; }
        const w = document.createElement("span");
        w.className = "smooth-word";
        w.textContent = part;
        frag.append(w);
      });
      node.replaceWith(frag);
    });
    const inner = document.createElement("span");
    inner.className = "smooth-inner";
    while (el.firstChild) inner.append(el.firstChild);
    el.append(inner);
    const words = [...el.querySelectorAll(".smooth-word")];
    let height = inner.offsetHeight;
    let last = words.map((w) => rel(w, inner));
    el.style.height = `${height}px`;
    new ResizeObserver(() => {
      const next = words.map((w) => rel(w, inner));
      const h = inner.offsetHeight;
      if (Math.abs(h - height) >= 1) {
        el.style.transition = still() ? "none" : `height ${DUR}ms ${EASE}`;
        el.style.height = `${h}px`;
        if (!still()) words.forEach((w, i) => glide(w, last[i], next[i]));
        height = h;
      }
      last = next;
    }).observe(inner);
    // Garde les positions à jour pendant l’élargissement continu (pour ne glisser que le saut).
    el.addEventListener("transitionrun", () => { last = words.map((w) => rel(w, inner)); });
  }

  // 3 : liste dont les éléments peuvent changer de rangée.
  function smoothList(list) {
    const items = [...list.children];
    let last = items.map((it) => rel(it, list));
    let queued = false;
    const check = () => {
      queued = false;
      const next = items.map((it) => rel(it, list));
      if (!still()) items.forEach((it, i) => glide(it, last[i], next[i]));
      last = next;
    };
    const ro = new ResizeObserver(() => { if (!queued) { queued = true; requestAnimationFrame(check); } });
    items.forEach((it) => ro.observe(it));
    ro.observe(list);
  }

  const start = () => {
    document.querySelectorAll(".suite-title, .row-title, .tableau-title").forEach(smoothTitle);
    document.querySelectorAll(".filters, .poles-list").forEach(smoothList);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
})();
