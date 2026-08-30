(() => {
  "use strict";

  const BASE = "https://sinergiaestudio.github.io";
  const MAIN = `${BASE}/herramientas-j15sec29/`;
  const CATALOG_VERSION = "6.5.1";

  const modules = [
    {
      group: "Mensajería y reportes",
      id: "procesadores",
      label: "Actuaciones y vencimientos",
      detail: "Listados para WhatsApp",
      icon: "▤",
      url: `${MAIN}#procesadores`,
    },
    {
      group: "Automatización EJE",
      id: "actuaciones-lote",
      label: "Creador de actuaciones en lote",
      detail: "Carga secuencial de expedientes",
      icon: "⇩",
      url: `${MAIN}#actuaciones-lote`,
    },
    {
      group: "Automatización EJE",
      id: "lotes-actuaciones",
      label: "Creador de Lotes - Actuaciones",
      detail: "Borradores por expediente",
      icon: "▦",
      url: `${MAIN}#lotes-actuaciones`,
    },
    {
      group: "Automatización EJE",
      id: "lotes-cedulas",
      label: "Creador de Lotes - Cédulas",
      detail: "Del PDF al lote de notificaciones",
      icon: "✉",
      url: `${BASE}/Cedulas-EJE-v1.0/`,
    },
    {
      group: "Control y cálculo",
      id: "confronte-liquidaciones",
      label: "Confronte de Liquidaciones EJF",
      detail: "Control documental e intereses",
      icon: "≋",
      url: `${BASE}/Confronte-Liquidaciones-EJF-v2.1.0/`,
    },
  ];

  function currentModule() {
    const pathname = location.pathname.toLocaleLowerCase("es-AR");
    if (pathname.includes("cedulas-eje")) return "lotes-cedulas";
    if (pathname.includes("confronte-liquidaciones")) return "confronte-liquidaciones";
    return "";
  }

  function groupedModules() {
    const groups = [];
    for (const module of modules) {
      let group = groups.find((candidate) => candidate.name === module.group);
      if (!group) {
        group = { name: module.group, items: [] };
        groups.push(group);
      }
      group.items.push(module);
    }
    return groups;
  }

  function markup() {
    const activeId = currentModule();
    return groupedModules().map((group) => `
      <div class="sec29-suite-group">
        <p class="sec29-suite-group-label">${group.name}</p>
        ${group.items.map((module) => {
          const active = module.id === activeId;
          return `
            <a
              class="sec29-suite-nav-item${active ? " is-active" : ""}"
              href="${module.url}"
              data-sec29-module="${module.id}"
              ${active ? 'aria-current="page"' : ""}
            >
              <span class="sec29-suite-nav-icon" aria-hidden="true">${module.icon}</span>
              <span class="sec29-suite-nav-copy">
                <strong>${module.label}</strong>
                <small>${module.detail}</small>
              </span>
            </a>
          `;
        }).join("")}
      </div>
    `).join("");
  }

  function synchronize() {
    const nav = document.querySelector(".sec29-suite-nav");
    if (!nav) return false;

    if (nav.dataset.sec29CatalogVersion !== CATALOG_VERSION) {
      nav.innerHTML = markup();
      nav.dataset.sec29CatalogVersion = CATALOG_VERSION;
    }

    const currentLabel = document.querySelector(".sec29-suite-current");
    const active = modules.find((module) => module.id === currentModule());
    if (currentLabel && active) currentLabel.textContent = active.label;

    return true;
  }

  function initialize() {
    if (synchronize()) return;

    const observer = new MutationObserver(() => {
      if (synchronize()) observer.disconnect();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 5000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
