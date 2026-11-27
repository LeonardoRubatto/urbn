// Réglages communs. Les fichiers de src/js sont assemblés dans l’ordre de leur nom dans assets/site.js.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const saveData = Boolean(navigator.connection && navigator.connection.saveData);
const smallScreen = matchMedia("(max-width: 700px)");

if (location.protocol !== "file:") {
  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "site.webmanifest";
  document.head.append(manifest);
}

// Applique la couleur de lumière à la page entière (fondu géré par @property --gel).
function setGel(color, target = document.body) {
  if (color) target.style.setProperty("--gel", color);
}
