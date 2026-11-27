// Salle de projection : le film s’ouvre depuis sa vignette (450 ms), le son est autorisé
// puisque la lecture vient d’un clic. Échap ou « Fermer » rend le focus au bouton d’origine.
const projectionRoom = document.querySelector(".projection");
if (projectionRoom && typeof projectionRoom.showModal === "function") {
  const video = projectionRoom.querySelector("video");
  const title = projectionRoom.querySelector("figcaption strong");
  const credit = projectionRoom.querySelector("figcaption span");
  const source = projectionRoom.querySelector("figcaption a");
  let opener;

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-film]");
    if (!button) return;
    opener = button;
    const from = button.getBoundingClientRect();
    video.poster = button.dataset.poster;
    video.src = button.dataset.film;
    video.width = button.dataset.w;
    video.height = button.dataset.h;
    title.textContent = button.dataset.title;
    credit.textContent = button.dataset.credit;
    source.href = button.dataset.source;
    const gel = getComputedStyle(button).getPropertyValue("--gel");
    if (gel) projectionRoom.style.setProperty("--gel", gel);
    projectionRoom.showModal();
    document.querySelectorAll("[data-loop] video").forEach((v) => v.pause());
    video.play().catch(() => {});
    if (reduceMotion.matches) return;
    requestAnimationFrame(() => {
      const to = video.getBoundingClientRect();
      if (!to.width) return;
      video.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: 0.4 },
        { transform: "none", opacity: 1 }
      ], { duration: 450, easing: "cubic-bezier(.22,1,.36,1)" });
    });
  });

  projectionRoom.querySelector(".projection-close").addEventListener("click", () => projectionRoom.close());
  projectionRoom.addEventListener("click", (event) => { if (event.target === projectionRoom || event.target.classList.contains("projection-room")) projectionRoom.close(); });
  projectionRoom.addEventListener("close", () => {
    video.pause();
    video.removeAttribute("src");
    video.load();
    opener?.focus();
    document.querySelectorAll("[data-loop]").forEach((el) => { if (loops.get(el)) startLoop(el); });
  });
}
