// Les tableaux de projets : en défilant, la page prend la couleur de lumière du projet lu
// et la scène fixe montre son média (ordinateur et téléphone). La vidéo du projet suivant est préparée
// à l’avance. Sans script, chaque projet garde son média en ligne.
const tableaux = document.querySelector("[data-tableaux]");
if (tableaux && "IntersectionObserver" in window) {
  const items = [...tableaux.querySelectorAll("[data-tableau]")];
  const frames = [...tableaux.querySelectorAll("[data-frame]")];
  const phone = matchMedia("(max-width: 900px)");
  let active = 0;
  let started = false;

  const select = (index) => {
    if (index < 0 || (index === active && started)) return;
    started = true;
    frames[active]?.classList.remove("is-current");
    items[active]?.classList.remove("is-active");
    if (frames[active]) pauseLoops(frames[active]);
    active = index;
    items[active].classList.add("is-active");
    frames[active]?.classList.add("is-current");
    if (frames[active]) refreshLoops(frames[active]);
    if (frames[active + 1]) frames[active + 1].querySelectorAll("[data-loop]").forEach(primeLoop);
    setGel(items[active].dataset.gel, tableaux);
    setGel(items[active].dataset.gel);
  };

  // Ordinateur : le projet qui croise le milieu de l’écran.
  const io = new IntersectionObserver((entries) => {
    if (phone.matches) return;
    for (const entry of entries) if (entry.isIntersecting) select(items.indexOf(entry.target));
  }, { rootMargin: "-45% 0px -45% 0px" });
  items.forEach((item) => io.observe(item));

  // Téléphone : le dernier projet dont le haut a passé la scène fixe (+25 % d’écran) ;
  // l’état découle de la position à chaque image, sans file d’attente (mécanique guided-steps).
  const stage = tableaux.querySelector(".tableaux-stage");
  let queued = false;
  const onPhoneScroll = () => {
    queued = false;
    if (!phone.matches || !stage || getComputedStyle(stage).display === "none") return;
    const line = stage.getBoundingClientRect().bottom + innerHeight * 0.25;
    let index = 0;
    items.forEach((item, i) => { if (item.getBoundingClientRect().top <= line) index = i; });
    select(index);
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(onPhoneScroll); } }, { passive: true });
  onPhoneScroll();

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
