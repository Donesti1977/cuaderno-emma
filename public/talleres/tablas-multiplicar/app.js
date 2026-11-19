(() => {
  "use strict";

  // Un color por tabla: rojo, naranja, ocre, verde oliva, verde, turquesa,
  // azul, añil, violeta y magenta. El número de tablas sale de esta lista.
  const COLORS = [
    "#d14343",
    "#c0621c",
    "#96760a",
    "#5e8c1e",
    "#2f8f4e",
    "#16857c",
    "#2e72be",
    "#4b5ab5",
    "#7b4fa8",
    "#b23a82",
  ];

  const MAX = COLORS.length;

  const root = document.documentElement;
  const tabsEl = document.getElementById("tabs");
  const panelEl = document.getElementById("sheet");
  const tableEl = document.getElementById("table");
  const numeralEl = document.getElementById("sheetN");
  const printBtn = document.getElementById("print");

  let current = 0;

  function clampTable(value) {
    const number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return 1;
    return Math.min(MAX, Math.max(1, number));
  }

  function tableFromHash() {
    const match = /tabla-(\d+)/.exec(window.location.hash);
    return clampTable(match ? match[1] : 1);
  }

  function buildTabs() {
    const fragment = document.createDocumentFragment();

    for (let n = 1; n <= MAX; n += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab";
      button.id = `tab-${n}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "sheet");
      button.setAttribute("aria-selected", "false");
      button.setAttribute("aria-label", `Tabla del ${n}`);
      button.tabIndex = -1;
      button.style.setProperty("--accent", COLORS[n - 1]);

      const number = document.createElement("span");
      number.className = "tab__num";
      number.textContent = String(n);
      button.appendChild(number);

      button.addEventListener("click", () => goTo(n, { push: true }));
      fragment.appendChild(button);
    }

    tabsEl.appendChild(fragment);
  }

  function renderTable(n) {
    const rows = [];

    for (let multiplier = 1; multiplier <= 10; multiplier += 1) {
      rows.push(
        `<span class="cell cell--mult">${n} × ${multiplier}</span>` +
          '<span class="cell cell--eq" aria-hidden="true">=</span>' +
          `<span class="cell cell--res">${n * multiplier}</span>`
      );
    }

    tableEl.innerHTML = rows.join("");
  }

  function goTo(n, options = {}) {
    const table = clampTable(n);
    if (table === current) return;

    const { focus = false, push = false } = options;
    current = table;

    root.style.setProperty("--accent", COLORS[table - 1]);
    numeralEl.textContent = String(table);
    renderTable(table);
    panelEl.setAttribute("aria-labelledby", `tab-${table}`);
    document.title = `Tabla del ${table} · Tablas de multiplicar`;

    Array.from(tabsEl.children).forEach((tab) => {
      const selected = tab.id === `tab-${table}`;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });

    const hash = `#tabla-${table}`;
    if (window.location.hash !== hash) {
      if (push) {
        window.history.pushState({ table }, "", hash);
      } else {
        window.history.replaceState({ table }, "", hash);
      }
    }
  }

  tabsEl.addEventListener("keydown", (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    let next = null;

    if (step) {
      next = ((current - 1 + step) % MAX + MAX) % MAX + 1;
    } else if (event.key === "Home") {
      next = 1;
    } else if (event.key === "End") {
      next = MAX;
    }

    if (next === null) return;
    event.preventDefault();
    goTo(next, { focus: true, push: true });
  });

  window.addEventListener("popstate", () => goTo(tableFromHash()));
  window.addEventListener("hashchange", () => goTo(tableFromHash()));

  printBtn.addEventListener("click", () => window.print());

  buildTabs();
  goTo(tableFromHash());
})();
