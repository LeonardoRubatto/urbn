/* src/js/01-base.js */
// Réglages communs. Les fichiers de src/js sont assemblés dans l’ordre de leur nom dans assets/site.js.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const saveData = Boolean(navigator.connection && navigator.connection.saveData);
const smallScreen = matchMedia("(max-width: 700px)");

if (location.protocol !== "file:") {
  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "site.webmanifest";
  document.head.append(manifest);
}

// Applique la couleur de lumière à la page entière (fondu géré par @property --gel).
function setGel(color, target = document.body) {
  if (color) target.style.setProperty("--gel", color);
}

/* src/js/02-loops.js */
// Boucles vidéo muettes : chargées et lues seulement quand elles sont à l’écran,
// jamais en mouvement réduit ni en mode économie de données. La version « sd » sert aux téléphones.
const loops = new Map();

function loopVideo(el) { return el.querySelector("video"); }

function startLoop(el) {
  if (reduceMotion.matches || saveData || el.dataset.held === "true") return;
  const video = loopVideo(el);
  if (!video) return;
  if (!video.src) video.src = smallScreen.matches ? video.dataset.sd : video.dataset.hd;
  const play = video.play();
  if (play) play.then(() => el.classList.add("is-playing")).catch(() => {});
}

function stopLoop(el) {
  const video = loopVideo(el);
  if (video && !video.paused) video.pause();
}

const loopObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const el = entry.target;
    loops.set(el, entry.isIntersecting);
    if (el.closest("[data-hover-loop]") && finePointer.matches) continue;
    if (el.closest("[data-scene]") && !el.closest(".is-current")) continue;
    if (el.closest("[data-frame]") && !el.closest(".is-current")) continue;
    entry.isIntersecting ? startLoop(el) : stopLoop(el);
  }
}, { rootMargin: "120px 0px" }) : null;

document.querySelectorAll("[data-loop]").forEach((el) => {
  loopObserver?.observe(el);
  const hover = el.closest("[data-hover-loop]");
  if (hover) {
    const link = hover.closest("a") || hover;
    const on = () => finePointer.matches && startLoop(el);
    const off = () => finePointer.matches && stopLoop(el);
    link.addEventListener("pointerenter", on);
    link.addEventListener("pointerleave", off);
    link.addEventListener("focus", on);
    link.addEventListener("blur", off);
  }
});

// Utilisé par la couverture et les tableaux : relance les boucles d’un conteneur devenu visible.
function refreshLoops(container) {
  container.querySelectorAll("[data-loop]").forEach((el) => (loops.get(el) ? startLoop(el) : stopLoop(el)));
}
function pauseLoops(container) { container.querySelectorAll("[data-loop]").forEach(stopLoop); }

document.addEventListener("visibilitychange", () => {
  if (document.hidden) document.querySelectorAll("[data-loop]").forEach(stopLoop);
});
reduceMotion.addEventListener?.("change", () => { if (reduceMotion.matches) document.querySelectorAll("[data-loop]").forEach(stopLoop); });

/* src/js/03-decor.js */
// Le décor projeté : chaque ligne a une largeur d’Archivo différente ; on règle sa taille
// pour que toutes remplissent exactement la largeur du bloc. Mesuré une fois la police chargée.
function decorWidth(decor) {
  const cs = getComputedStyle(decor);
  return decor.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

function fitDecor(decor) {
  const width = decorWidth(decor);
  if (!width) return;
  decor.querySelectorAll(".decor-line").forEach((line) => {
    line.style.setProperty("--fit", "100px");
    line.style.transition = "none";
    const natural = line.scrollWidth;
    line.style.setProperty("--fit", `${(100 * width / natural).toFixed(2)}px`);
    line.offsetWidth;
    line.style.transition = "";
  });
  decor.dataset.fitted = "";
}

function fitAllDecors() { document.querySelectorAll("[data-decor]").forEach(fitDecor); }

(document.fonts ? document.fonts.ready : Promise.resolve()).then(fitAllDecors);
let decorResize;
addEventListener("resize", () => { cancelAnimationFrame(decorResize); decorResize = requestAnimationFrame(fitAllDecors); });

// Change les largeurs des lignes (ex. au changement de tableau) puis réajuste en douceur.
function reshapeDecor(decor, widths) {
  const lines = [...decor.querySelectorAll(".decor-line")];
  const width = decorWidth(decor);
  lines.forEach((line, i) => {
    const w = widths[i % widths.length];
    const probe = line.cloneNode(true);
    probe.style.cssText = `position:absolute;visibility:hidden;--w:${w};--fit:100px;transition:none`;
    decor.append(probe);
    const natural = probe.scrollWidth;
    probe.remove();
    line.style.setProperty("--w", w);
    line.style.setProperty("--fit", `${(100 * width / natural).toFixed(2)}px`);
  });
}

/* src/js/04-plateau.js */
// Couverture : trois tableaux vidéo qui se succèdent. Le gel et les largeurs du décor changent avec eux.
// Pause : bouton icône (nom accessible) ; en mouvement réduit, rien ne défile.
const plateau = document.querySelector("[data-plateau]");
if (plateau) {
  const scenes = [...plateau.querySelectorAll("[data-scene]")];
  const tabs = [...plateau.querySelectorAll("[data-scene-tab]")];
  const pause = plateau.querySelector("[data-pause]");
  const decors = [...plateau.querySelectorAll("[data-decor]")];
  const shapes = [[62, 125, 82, 108], [125, 70, 100, 62], [88, 62, 125, 76]];
  const SCENE_TIME = 7000;
  let current = 0;
  let timer;
  let paused = reduceMotion.matches;
  plateau.style.setProperty("--scene-time", `${SCENE_TIME}ms`);

  function show(index, { user = false } = {}) {
    if (index === current && !user) return;
    pauseLoops(scenes[current]);
    scenes[current].classList.remove("is-current");
    tabs[current].setAttribute("aria-pressed", "false");
    current = index;
    scenes[current].classList.add("is-current");
    const tab = tabs[current];
    tab.setAttribute("aria-pressed", "true");
    // relance la barre de progression
    const bar = tab.querySelector("i");
    bar.style.animation = "none"; bar.offsetWidth; bar.style.animation = "";
    const gel = scenes[current].dataset.gel;
    setGel(gel, plateau);
    setGel(gel);
    if (!reduceMotion.matches) decors.forEach((d) => reshapeDecor(d, shapes[current % shapes.length]));
    refreshLoops(scenes[current]);
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (!paused) timer = setTimeout(() => show((current + 1) % scenes.length), SCENE_TIME);
  }

  tabs.forEach((tab, i) => tab.addEventListener("click", () => show(i, { user: true })));
  pause?.addEventListener("click", () => {
    paused = !paused;
    pause.setAttribute("aria-pressed", String(paused));
    pause.setAttribute("aria-label", paused ? "Relancer les vidéos" : "Mettre les vidéos en pause");
    plateau.toggleAttribute("data-paused", paused);
    scenes.forEach((s) => s.querySelectorAll("[data-loop]").forEach((l) => (l.dataset.held = String(paused))));
    paused ? pauseLoops(plateau) : refreshLoops(scenes[current]);
    schedule();
  });
  if (reduceMotion.matches) { plateau.toggleAttribute("data-paused", true); pause.hidden = true; }

  // La couverture ne tourne que si elle est visible.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) schedule(); else clearTimeout(timer);
  }).observe(plateau);
}

/* src/js/045-desk.js */
// Index des publications (composition décalée) : onglets ARIA, flèches du clavier,
// ouverture en diaphragme (480 ms) et lumière de la publication choisie.
const pressTabs = document.querySelector(".press-tabs");
if (pressTabs) {
  const desk = pressTabs.closest("[data-desk]");
  const tabs = [...pressTabs.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
  let activeIndex = 0;

  function selectPanel(index) {
    if (index === activeIndex) return;
    pauseLoops(panels[activeIndex]);
    activeIndex = index;
    tabs.forEach((tab, i) => { tab.setAttribute("aria-selected", String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    panels.forEach((panel, i) => { panel.hidden = i !== index; panel.classList.toggle("is-printing", i === index && !reduceMotion.matches); });
    setGel(panels[index].dataset.gel, desk);
    refreshLoops(panels[index]);
    panels[index].querySelectorAll("[data-loop]").forEach(startLoop);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectPanel(index));
    tab.addEventListener("keydown", (event) => {
      const n = tabs.length;
      const to = { ArrowLeft: (index + n - 1) % n, ArrowUp: (index + n - 1) % n, ArrowRight: (index + 1) % n, ArrowDown: (index + 1) % n, Home: 0, End: n - 1 }[event.key];
      if (to === undefined) return;
      event.preventDefault();
      tabs[to].focus();
      selectPanel(to);
    });
  });
}

/* src/js/05-gel.js */
// Les tableaux de projets : en défilant, la page prend la couleur de lumière du projet lu
// et la scène fixe (ordinateur) montre son média. Sur téléphone, chaque projet a son média en ligne.
const tableaux = document.querySelector("[data-tableaux]");
if (tableaux && "IntersectionObserver" in window) {
  const items = [...tableaux.querySelectorAll("[data-tableau]")];
  const frames = [...tableaux.querySelectorAll("[data-frame]")];
  let active = 0;
  const select = (index) => {
    if (index === active && tableaux.dataset.lit) return;
    frames[active]?.classList.remove("is-current");
    if (frames[active]) pauseLoops(frames[active]);
    active = index;
    tableaux.dataset.lit = "";
    frames[active]?.classList.add("is-current");
    if (frames[active]) refreshLoops(frames[active]);
    setGel(items[active].dataset.gel, tableaux);
    setGel(items[active].dataset.gel);
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) select(items.indexOf(entry.target));
  }, { rootMargin: "-45% 0px -45% 0px" });
  items.forEach((item) => io.observe(item));
}

// Toute autre section qui porte sa propre lumière (data-gel-section) l’allume en passant.
if ("IntersectionObserver" in window) {
  const lit = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) setGel(entry.target.dataset.gelSection);
  }, { rootMargin: "-50% 0px -50% 0px" });
  document.querySelectorAll("[data-gel-section]").forEach((s) => lit.observe(s));
}

/* src/js/06-film.js */
// Salle de projection : le film s’ouvre depuis sa vignette (450 ms), le son est autorisé
// puisque la lecture vient d’un clic. Échap ou « Fermer » rend le focus au bouton d’origine.
const projectionRoom = document.querySelector(".projection");
if (projectionRoom && typeof projectionRoom.showModal === "function") {
  const video = projectionRoom.querySelector("video");
  const title = projectionRoom.querySelector("figcaption strong");
  const credit = projectionRoom.querySelector("figcaption span");
  const source = projectionRoom.querySelector("figcaption a");
  let opener;

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-film]");
    if (!button) return;
    opener = button;
    const from = button.getBoundingClientRect();
    video.poster = button.dataset.poster;
    video.src = button.dataset.film;
    video.width = button.dataset.w;
    video.height = button.dataset.h;
    title.textContent = button.dataset.title;
    credit.textContent = button.dataset.credit;
    source.href = button.dataset.source;
    const gel = getComputedStyle(button).getPropertyValue("--gel");
    if (gel) projectionRoom.style.setProperty("--gel", gel);
    projectionRoom.showModal();
    document.querySelectorAll("[data-loop] video").forEach((v) => v.pause());
    video.play().catch(() => {});
    if (reduceMotion.matches) return;
    requestAnimationFrame(() => {
      const to = video.getBoundingClientRect();
      if (!to.width) return;
      video.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: 0.4 },
        { transform: "none", opacity: 1 }
      ], { duration: 450, easing: "cubic-bezier(.22,1,.36,1)" });
    });
  });

  projectionRoom.querySelector(".projection-close").addEventListener("click", () => projectionRoom.close());
  projectionRoom.addEventListener("click", (event) => { if (event.target === projectionRoom || event.target.classList.contains("projection-room")) projectionRoom.close(); });
  projectionRoom.addEventListener("close", () => {
    video.pause();
    video.removeAttribute("src");
    video.load();
    opener?.focus();
    document.querySelectorAll("[data-loop]").forEach((el) => { if (loops.get(el)) startLoop(el); });
  });
}

/* src/js/07-bande.js */
// Bandeau photo : la liste est doublée par script (copie inerte, hors tabulation) pour une boucle sans couture.
// Il s’arrête sous le pointeur ; le bouton d’arrêt n’apparaît qu’au clavier (préférence P25 + WCAG 2.2.2).
const bandeSection = document.querySelector("[data-bande]");
if (bandeSection && !reduceMotion.matches) {
  bandeSection.querySelectorAll(".bande-track").forEach((track) => {
    [...track.children].forEach((item) => {
      const copy = item.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.inert = true;
      copy.querySelectorAll("img").forEach((img) => { img.alt = ""; img.loading = "lazy"; });
      track.append(copy);
    });
  });
  const toggle = bandeSection.querySelector("[data-bande-toggle]");
  toggle.addEventListener("click", () => {
    const paused = !bandeSection.hasAttribute("data-paused");
    bandeSection.toggleAttribute("data-paused", paused);
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? "Relancer le défilement" : "Arrêter le défilement";
  });
  // Hors écran, l’animation est suspendue.
  new IntersectionObserver(([entry]) => {
    bandeSection.querySelectorAll(".bande-track").forEach((t) => (t.style.animationPlayState = entry.isIntersecting ? "" : "paused"));
  }).observe(bandeSection);
}

/* src/js/08-filters.js */
// Filtres de la page Projets (familles). Sans script, toute la liste reste visible.
const filters = document.querySelector(".filters");
if (filters) {
  const buttons = [...filters.querySelectorAll("button")];
  const rows = [...document.querySelectorAll(".row")];
  const status = document.querySelector("[data-filter-status]");
  filters.hidden = false;
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const value = button.dataset.filter;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    rows.forEach((row) => { row.hidden = Boolean(value) && row.dataset.famille !== value; });
    const n = rows.filter((r) => !r.hidden).length;
    status.textContent = n === 1 ? "1 projet affiché" : `${n} projets affichés`;
    const first = rows.find((r) => !r.hidden);
    if (first) setGel(getComputedStyle(first).getPropertyValue("--gel"));
  });
}

/* src/js/09-gallery.js */
// Visionneuse photo (adaptée de Shapes Slideshow, Codrops) : l’image s’ouvre en iris depuis la vignette cliquée.
// Flèches du clavier pour naviguer, Échap pour fermer, focus rendu à la vignette.
const gallery = document.querySelector("[data-gallery]");
const viewer = document.querySelector(".viewer");
if (gallery && viewer && typeof viewer.showModal === "function") {
  const links = [...gallery.querySelectorAll("figure > a")];
  const big = viewer.querySelector("img");
  const caption = viewer.querySelector("figcaption");
  const count = viewer.querySelector(".viewer-count");
  viewer.querySelector(".viewer-controls").hidden = links.length < 2;
  let current;

  function show(link, origin) {
    current = link;
    const index = links.indexOf(link);
    big.alt = link.querySelector("img").alt;
    caption.textContent = `${link.dataset.caption} · ${link.dataset.credit}`;
    count.textContent = `${index + 1} / ${links.length}`;
    big.src = link.getAttribute("href");
    if (!reduceMotion.matches) {
      big.style.setProperty("--ox", origin ? `${origin.x}%` : "50%");
      big.style.setProperty("--oy", origin ? `${origin.y}%` : "50%");
      big.classList.remove("is-opening"); big.offsetWidth; big.classList.add("is-opening");
    }
    new Image().src = links[(index + 1) % links.length].getAttribute("href");
  }

  gallery.addEventListener("click", (event) => {
    const link = event.target.closest("figure > a");
    if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const r = link.getBoundingClientRect();
    viewer.showModal();
    show(link, { x: Math.round(((r.left + r.width / 2) / innerWidth) * 100), y: Math.round(((r.top + r.height / 2) / innerHeight) * 100) });
  });
  const step = (d) => show(links[(links.indexOf(current) + d + links.length) % links.length]);
  viewer.querySelector(".viewer-prev").addEventListener("click", () => step(-1));
  viewer.querySelector(".viewer-next").addEventListener("click", () => step(1));
  viewer.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
  viewer.addEventListener("keydown", (event) => {
    if (links.length < 2 || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    step(event.key === "ArrowRight" ? 1 : -1);
  });
  viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener("close", () => current?.focus());
}

/* src/js/10-curtain.js */
// Passage entre pages (SVG Path Page Transition, Codrops) : un rideau monte dans la couleur
// de lumière de la page visée (data-gel sur le lien), puis la navigation native prend le relais (≤ 245 ms).
const curtain = document.querySelector(".curtain-paper");
if (curtain && CSS.supports("d", 'path("M 0 0 L 1 1")')) {
  const root = new URL("./", location.href);
  let pending;
  addEventListener("pageshow", () => { document.documentElement.classList.remove("is-turning"); pending = undefined; });
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey || reduceMotion.matches) return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const target = new URL(link.href);
    const page = target.pathname.slice(root.pathname.length);
    if (target.protocol !== location.protocol || target.host !== location.host || !target.pathname.startsWith(root.pathname) || target.hash || target.pathname === location.pathname || !/^(?:[a-z0-9-]+\.html)?$/.test(page)) return;
    event.preventDefault();
    if (pending) return;
    pending = target.href;
    const gel = link.dataset.gel;
    document.documentElement.style.setProperty("--curtain", gel ? `color-mix(in oklch, ${gel} 55%, oklch(0.145 0.016 275))` : "oklch(0.145 0.016 275)");
    document.documentElement.classList.add("is-turning");
    let opened = false;
    const open = () => { if (!opened && pending) { opened = true; location.assign(pending); } };
    const fallback = setTimeout(open, 245);
    curtain.addEventListener("animationend", () => { clearTimeout(fallback); open(); }, { once: true });
  });
}
