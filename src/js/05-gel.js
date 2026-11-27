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
