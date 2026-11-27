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
