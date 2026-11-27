// Le décor projeté : chaque ligne a une largeur d’Archivo différente ; on règle sa taille
// pour que toutes remplissent exactement la largeur du bloc. Mesuré une fois la police chargée.
function decorWidth(decor) {
  const cs = getComputedStyle(decor);
  return decor.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

function fitDecor(decor) {
  const width = decorWidth(decor);
  if (!width) return;
  decor.querySelectorAll(".decor-line").forEach((line) => {
    line.style.setProperty("--fit", "100px");
    line.style.transition = "none";
    const natural = line.scrollWidth;
    line.style.setProperty("--fit", `${(100 * width / natural).toFixed(2)}px`);
    line.offsetWidth;
    line.style.transition = "";
  });
  decor.dataset.fitted = "";
}

function fitAllDecors() { document.querySelectorAll("[data-decor]").forEach(fitDecor); }

(document.fonts ? document.fonts.ready : Promise.resolve()).then(fitAllDecors);
let decorResize;
addEventListener("resize", () => { cancelAnimationFrame(decorResize); decorResize = requestAnimationFrame(fitAllDecors); });

// Change les largeurs des lignes (ex. au changement de tableau) puis réajuste en douceur.
function reshapeDecor(decor, widths) {
  const lines = [...decor.querySelectorAll(".decor-line")];
  const width = decorWidth(decor);
  lines.forEach((line, i) => {
    const w = widths[i % widths.length];
    const probe = line.cloneNode(true);
    probe.style.cssText = `position:absolute;visibility:hidden;--w:${w};--fit:100px;transition:none`;
    decor.append(probe);
    const natural = probe.scrollWidth;
    probe.remove();
    line.style.setProperty("--w", w);
    line.style.setProperty("--fit", `${(100 * width / natural).toFixed(2)}px`);
  });
}
