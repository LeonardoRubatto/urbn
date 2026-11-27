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
