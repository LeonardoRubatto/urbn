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
