// Boucles vidéo muettes : chargées et lues seulement quand elles sont à l’écran,
// jamais en mouvement réduit ni en mode économie de données. La version « sd » sert aux téléphones.
const loops = new Map();

function loopVideo(el) { return el.querySelector("video"); }

function startLoop(el) {
  if (reduceMotion.matches || saveData || el.dataset.held === "true") return;
  const video = loopVideo(el);
  if (!video) return;
  if (!video.src) video.src = smallScreen.matches ? video.dataset.sd : video.dataset.hd;
  const play = video.play();
  if (play) play.then(() => el.classList.add("is-playing")).catch(() => {});
}

// Prépare une boucle sans la lancer (la suivante dans une séquence) : elle démarre ensuite sans attente.
function primeLoop(el) {
  if (reduceMotion.matches || saveData) return;
  const video = loopVideo(el);
  if (!video || video.src) return;
  video.preload = "auto";
  video.src = smallScreen.matches ? video.dataset.sd : video.dataset.hd;
}

function stopLoop(el) {
  const video = loopVideo(el);
  if (video && !video.paused) video.pause();
}

const loopObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const el = entry.target;
    loops.set(el, entry.isIntersecting);
    if (el.closest("[data-hover-loop]") && finePointer.matches) continue;
    if (el.closest("[data-scene]") && !el.closest(".is-current")) continue;
    if (el.closest("[data-frame]") && !el.closest(".is-current")) continue;
    entry.isIntersecting ? startLoop(el) : stopLoop(el);
  }
}, { rootMargin: "120px 0px" }) : null;

document.querySelectorAll("[data-loop]").forEach((el) => {
  loopObserver?.observe(el);
  const hover = el.closest("[data-hover-loop]");
  if (hover) {
    const link = hover.closest("a") || hover;
    const on = () => finePointer.matches && startLoop(el);
    const off = () => finePointer.matches && stopLoop(el);
    link.addEventListener("pointerenter", on);
    link.addEventListener("pointerleave", off);
    link.addEventListener("focus", on);
    link.addEventListener("blur", off);
  }
});

// Utilisé par la couverture et les tableaux : relance les boucles d’un conteneur devenu visible.
function refreshLoops(container) {
  container.querySelectorAll("[data-loop]").forEach((el) => (loops.get(el) ? startLoop(el) : stopLoop(el)));
}
function pauseLoops(container) { container.querySelectorAll("[data-loop]").forEach(stopLoop); }

document.addEventListener("visibilitychange", () => {
  if (document.hidden) document.querySelectorAll("[data-loop]").forEach(stopLoop);
});
reduceMotion.addEventListener?.("change", () => { if (reduceMotion.matches) document.querySelectorAll("[data-loop]").forEach(stopLoop); });
