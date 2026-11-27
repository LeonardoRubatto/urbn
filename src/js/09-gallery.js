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
