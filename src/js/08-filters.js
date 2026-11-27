// Filtres de la page Projets (familles). Sans script, toute la liste reste visible.
const filters = document.querySelector(".filters");
if (filters) {
  const buttons = [...filters.querySelectorAll("button")];
  const rows = [...document.querySelectorAll(".row")];
  const status = document.querySelector("[data-filter-status]");
  filters.hidden = false;
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const value = button.dataset.filter;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    rows.forEach((row) => { row.hidden = Boolean(value) && row.dataset.famille !== value; });
    const n = rows.filter((r) => !r.hidden).length;
    status.textContent = n === 1 ? "1 projet affiché" : `${n} projets affichés`;
    const first = rows.find((r) => !r.hidden);
    if (first) setGel(getComputedStyle(first).getPropertyValue("--gel"));
  });
}
