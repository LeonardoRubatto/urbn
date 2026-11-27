// Couverture : trois tableaux vidéo qui se succèdent. Le gel et les largeurs du décor changent avec eux.
// Le défilement s’arrête tant que le pointeur ou le focus clavier est sur les onglets ; en mouvement réduit, rien ne défile.
const plateau = document.querySelector("[data-plateau]");
if (plateau) {
  const scenes = [...plateau.querySelectorAll("[data-scene]")];
  const tabs = [...plateau.querySelectorAll("[data-scene-tab]")];
  const index = plateau.querySelector(".plateau-index");
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
  const hold = (on) => {
    paused = on || reduceMotion.matches;
    plateau.toggleAttribute("data-paused", paused);
    schedule();
  };
  index.addEventListener("pointerenter", () => hold(true));
  index.addEventListener("pointerleave", () => hold(false));
  index.addEventListener("focusin", () => hold(true));
  index.addEventListener("focusout", (e) => { if (!index.contains(e.relatedTarget)) hold(false); });
  if (reduceMotion.matches) plateau.toggleAttribute("data-paused", true);

  // La couverture ne tourne que si elle est visible.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) schedule(); else clearTimeout(timer);
  }).observe(plateau);
}
