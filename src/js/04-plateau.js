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
