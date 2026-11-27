// Entrées de sections (grammaire « section-transitions » du design system) : on observe la section
// [data-reveal] et on lui ajoute .is-in une fois atteinte ; le CSS anime ses enfants. Une seule fois.
// Le focus clavier ou une ancre révèlent immédiatement (sans transition).
document.querySelectorAll("[data-reveal]").forEach((section) => {
  section.querySelectorAll(".pole").forEach((el, i) => el.style.setProperty("--i", i));
  if (!("IntersectionObserver" in window)) { section.classList.add("is-in"); return; }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    section.classList.add("is-in");
    io.disconnect();
  }, { rootMargin: "0px 0px -16% 0px" });
  io.observe(section);
  section.addEventListener("focusin", () => { section.classList.add("is-instant", "is-in"); io.disconnect(); }, { once: true });
});
