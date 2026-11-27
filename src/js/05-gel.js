// Les tableaux de projets : en défilant, la page prend la couleur de lumière du projet lu
// et la scène fixe (ordinateur) montre son média. Des barres façon story Instagram, une par projet,
// se remplissent avec le défilement (mécanique « guided-steps » du design system : l’état est une
// fonction de la position, sans file d’attente). La vidéo du projet suivant est préparée à l’avance.
// Sur téléphone, chaque projet a son média en ligne.
const tableaux = document.querySelector("[data-tableaux]");
if (tableaux && "IntersectionObserver" in window) {
  const items = [...tableaux.querySelectorAll("[data-tableau]")];
  const frames = [...tableaux.querySelectorAll("[data-frame]")];
  const bars = [...tableaux.querySelectorAll("[data-bar] i")];
  const nowTitle = tableaux.querySelector("[data-now-title]");
  const nowWhen = tableaux.querySelector("[data-now-when]");
  const stage = tableaux.querySelector(".tableaux-stage");
  let active = 0;
  let queued = false;

  const select = (index) => {
    if (index < 0 || (index === active && tableaux.dataset.lit !== undefined)) return;
    frames[active]?.classList.remove("is-current");
    items[active]?.classList.remove("is-active");
    if (frames[active]) pauseLoops(frames[active]);
    active = index;
    tableaux.dataset.lit = "";
    items[active].classList.add("is-active");
    frames[active]?.classList.add("is-current");
    if (frames[active]) refreshLoops(frames[active]);
    if (frames[active + 1]) frames[active + 1].querySelectorAll("[data-loop]").forEach(primeLoop);
    if (nowTitle) { nowTitle.textContent = items[active].dataset.title; nowWhen.textContent = items[active].dataset.when; }
    setGel(items[active].dataset.gel, tableaux);
    setGel(items[active].dataset.gel);
    paint();
  };

  // Barres : passées pleines, courante au prorata du défilement, suivantes vides.
  function paint() {
    queued = false;
    if (!bars.length || !stage || getComputedStyle(stage).display === "none") return;
    const r = items[active].getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight / 2 - r.top) / r.height));
    bars.forEach((bar, i) => bar.style.setProperty("--p", i < active ? 1 : i > active ? 0 : p.toFixed(3)));
  }
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) select(items.indexOf(entry.target));
  }, { rootMargin: "-45% 0px -45% 0px" });
  items.forEach((item) => io.observe(item));

  // La scène ne garde sa vidéo en lecture que si la section est à l’écran.
  new IntersectionObserver(([entry]) => {
    if (!frames[active]) return;
    entry.isIntersecting ? refreshLoops(frames[active]) : pauseLoops(frames[active]);
  }).observe(tableaux);
}

// Toute autre section qui porte sa propre lumière (data-gel-section) l’allume en passant.
if ("IntersectionObserver" in window) {
  const lit = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) setGel(entry.target.dataset.gelSection);
  }, { rootMargin: "-50% 0px -50% 0px" });
  document.querySelectorAll("[data-gel-section]").forEach((s) => lit.observe(s));
}
