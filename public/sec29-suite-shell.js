(() => {
  "use strict";

  if (window.top !== window) return;

  const BASE = "https://sinergiaestudio.github.io";
  const MAIN = `${BASE}/herramientas-j15sec29/`;
  const IA_JUDICIAL = "https://biblioteca-judicial-inteligente.arielmarcelogomez7.chatgpt.site";
  const STORAGE_KEY = "sec29-theme";
  const path = location.pathname.toLowerCase();
  const current = path.includes("cedulas-eje")
    ? "lotes-cedulas"
    : path.includes("confronte-liquidaciones")
      ? "confronte-liquidaciones"
      : "external";

  const modules = [
    {
      group: "IA JUDICIAL",
      id: "sistema-actuaciones-judiciales",
      label: "Sistema de Actuaciones Judiciales",
      detail: "Entrada unificada · acceso autenticado",
      icon: "IA",
      url: IA_JUDICIAL
    },
    {
      group: "Mensajería y reportes",
      id: "procesadores",
      label: "Actuaciones y vencimientos",
      detail: "Listados para WhatsApp",
      icon: "▤",
      url: `${MAIN}#procesadores`
    },
    {
      group: "Automatización EJE",
      id: "actuaciones-lote",
      label: "Creador de actuaciones en lote",
      detail: "Carga secuencial de expedientes",
      icon: "⇩",
      url: `${MAIN}#actuaciones-lote`
    },
    {
      group: "Automatización EJE",
      id: "lotes-cedulas",
      label: "Creador de Lotes - Cédulas",
      detail: "Del PDF al lote de notificaciones",
      icon: "✉",
      url: `${BASE}/Cedulas-EJE-v1.0/`
    },
    {
      group: "Control y cálculo",
      id: "confronte-liquidaciones",
      label: "Confronte de Liquidaciones EJF",
      detail: "Control documental e intereses",
      icon: "≋",
      url: `${BASE}/Confronte-Liquidaciones-EJF-v2.1.0/`
    }
  ];

  const currentMeta = modules.find((item) => item.id === current) || {
    label: "Herramientas SEC29",
    detail: "Módulo especializado"
  };

  function storedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null;
    }
  }

  function initialTheme() {
    return storedTheme()
      || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  const root = document.documentElement;
  root.classList.add("sec29-suite-page");

  const style = document.createElement("style");
  style.id = "sec29-suite-shell-style";
  style.textContent = `
    html.sec29-suite-page {
      --sec29-wine-950: #4f0d18;
      --sec29-wine-900: #68101f;
      --sec29-wine-800: #821529;
      --sec29-wine-700: #9f1d34;
      --sec29-ink: #2b2f36;
      --sec29-muted: #6c7581;
      --sec29-surface: #ffffff;
      --sec29-surface-soft: #f6f8fa;
      --sec29-border: #dce1e7;
      --sec29-shadow: 0 22px 60px rgba(31, 15, 20, .18);
      color-scheme: light;
    }

    html.sec29-suite-page body {
      padding-top: 68px !important;
    }

    html.sec29-suite-page .topbar {
      display: none !important;
    }

    #sec29-suite-header,
    #sec29-suite-sidebar,
    #sec29-suite-backdrop {
      box-sizing: border-box;
      font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
    }

    #sec29-suite-header {
      position: fixed;
      inset: 0 0 auto;
      z-index: 2147482000;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 0 20px;
      color: #fff;
      border-bottom: 1px solid rgba(255,255,255,.12);
      background: linear-gradient(112deg, var(--sec29-wine-900), var(--sec29-wine-700) 64%, #aa2038);
      box-shadow: 0 5px 18px rgba(63, 7, 18, .24);
    }

    .sec29-suite-header-left,
    .sec29-suite-header-actions,
    .sec29-suite-brand {
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .sec29-suite-header-left { gap: 10px; }
    .sec29-suite-header-actions { gap: 9px; }
    .sec29-suite-brand { gap: 11px; color: inherit; text-decoration: none; }

    .sec29-suite-control,
    .sec29-suite-brand-mark {
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      display: grid;
      place-items: center;
      padding: 0;
      color: #fff;
      border: 1px solid rgba(255,255,255,.22);
      border-radius: 12px;
      background: rgba(255,255,255,.09);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.11);
    }

    .sec29-suite-control {
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .sec29-suite-control:hover,
    .sec29-suite-control:focus-visible {
      border-color: rgba(255,255,255,.38);
      background: rgba(255,255,255,.16);
      outline: none;
    }

    .sec29-suite-brand-mark { font-size: 19px; }

    .sec29-suite-brand-copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
      line-height: 1.14;
    }

    .sec29-suite-brand-copy strong {
      overflow: hidden;
      font-size: 14px;
      font-weight: 760;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sec29-suite-brand-copy small {
      overflow: hidden;
      color: rgba(255,255,255,.76);
      font-size: 10.5px;
      font-weight: 580;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sec29-suite-current {
      overflow: hidden;
      max-width: 360px;
      color: rgba(255,255,255,.88);
      font-size: 11px;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #sec29-suite-sidebar {
      position: fixed;
      top: 84px;
      bottom: 16px;
      left: 16px;
      z-index: 2147482100;
      width: min(320px, calc(100vw - 32px));
      display: flex;
      flex-direction: column;
      overflow: hidden auto;
      color: var(--sec29-ink);
      border: 1px solid var(--sec29-border);
      border-radius: 18px;
      background: rgba(255,255,255,.985);
      box-shadow: var(--sec29-shadow);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateX(calc(-100% - 30px));
      transition: opacity 180ms ease, visibility 180ms ease, transform 180ms ease;
    }

    body.sec29-suite-menu-open { overflow: hidden !important; }
    body.sec29-suite-menu-open #sec29-suite-sidebar {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateX(0);
    }

    .sec29-suite-sidebar-heading {
      display: flex;
      align-items: center;
      gap: 11px;
      min-height: 76px;
      padding: 15px;
      border-bottom: 1px solid var(--sec29-border);
      background: linear-gradient(180deg, #fcf5f7, #fff);
    }

    .sec29-suite-sidebar-heading span:first-child {
      width: 38px;
      height: 38px;
      flex: 0 0 38px;
      display: grid;
      place-items: center;
      color: var(--sec29-wine-700);
      border: 1px solid #ead1d7;
      border-radius: 11px;
      background: #fff;
    }

    .sec29-suite-sidebar-heading div { display: grid; gap: 2px; }
    .sec29-suite-sidebar-heading strong { font-size: 12px; }
    .sec29-suite-sidebar-heading small { color: var(--sec29-muted); font-size: 9.5px; }

    .sec29-suite-nav { flex: 1 1 auto; padding: 12px 10px 16px; }
    .sec29-suite-group + .sec29-suite-group {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid var(--sec29-border);
    }

    .sec29-suite-group-label {
      margin: 0 8px 7px;
      color: #8b949f;
      font-size: 9px;
      font-weight: 850;
      letter-spacing: .09em;
      text-transform: uppercase;
    }

    .sec29-suite-nav-item {
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px;
      color: #56606c;
      border: 1px solid transparent;
      border-radius: 12px;
      text-decoration: none;
    }

    .sec29-suite-nav-item + .sec29-suite-nav-item { margin-top: 5px; }
    .sec29-suite-nav-item:hover {
      color: var(--sec29-ink);
      border-color: var(--sec29-border);
      background: var(--sec29-surface-soft);
    }

    .sec29-suite-nav-item.is-active {
      color: var(--sec29-wine-800);
      border-color: #ead1d7;
      background: linear-gradient(90deg, #fcf5f7, #fff);
      box-shadow: inset 3px 0 0 var(--sec29-wine-700);
    }

    .sec29-suite-nav-icon {
      width: 36px;
      height: 36px;
      flex: 0 0 36px;
      display: grid;
      place-items: center;
      border: 1px solid var(--sec29-border);
      border-radius: 10px;
      background: #fff;
    }

    .sec29-suite-nav-copy {
      min-width: 0;
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      gap: 2px;
    }

    .sec29-suite-nav-copy strong { font-size: 11.5px; line-height: 1.3; }
    .sec29-suite-nav-copy small { color: var(--sec29-muted); font-size: 9.5px; line-height: 1.3; }

    .sec29-suite-sidebar-footer {
      padding: 13px 15px 15px;
      color: var(--sec29-muted);
      border-top: 1px solid var(--sec29-border);
      background: var(--sec29-surface-soft);
      font-size: 9.5px;
      line-height: 1.45;
    }

    #sec29-suite-backdrop {
      position: fixed;
      inset: 68px 0 0;
      z-index: 2147482050;
      display: none;
      padding: 0;
      border: 0;
      background: rgba(12,17,23,.48);
      backdrop-filter: blur(2px);
    }

    body.sec29-suite-menu-open #sec29-suite-backdrop { display: block; }

    html[data-theme="dark"].sec29-suite-page {
      color-scheme: dark;
      --sec29-ink: #e7edf3;
      --sec29-muted: #9da8b5;
      --sec29-surface: #192029;
      --sec29-surface-soft: #202832;
      --sec29-border: #35404c;
      --sec29-shadow: 0 24px 70px rgba(0,0,0,.48);
      --paper: #11161c !important;
      --surface: #192029 !important;
      --surface-strong: #202833 !important;
      --ink: #edf2f7 !important;
      --muted: #aab4c0 !important;
      --line: #35404c !important;
      --wine-soft: #351720 !important;
      --green-soft: #17372c !important;
      --amber-soft: #3a2b13 !important;
      --slate-soft: #242d37 !important;
    }

    html[data-theme="dark"].sec29-suite-page body,
    html[data-theme="dark"].sec29-suite-page .app-shell {
      color: #edf2f7 !important;
      background: #11161c !important;
    }

    html[data-theme="dark"].sec29-suite-page #sec29-suite-sidebar {
      background: rgba(25,32,41,.99);
    }

    html[data-theme="dark"].sec29-suite-page .sec29-suite-sidebar-heading {
      background: linear-gradient(180deg, #351720, #192029);
    }

    html[data-theme="dark"].sec29-suite-page .sec29-suite-sidebar-heading span:first-child,
    html[data-theme="dark"].sec29-suite-page .sec29-suite-nav-icon {
      color: #e7edf3;
      border-color: #35404c;
      background: #202833;
    }

    html[data-theme="dark"].sec29-suite-page .sec29-suite-nav-item { color: #b7c1cb; }
    html[data-theme="dark"].sec29-suite-page .sec29-suite-nav-item:hover {
      color: #fff;
      border-color: #35404c;
      background: #222b35;
    }

    html[data-theme="dark"].sec29-suite-page .sec29-suite-nav-item.is-active {
      color: #f2b1bf;
      border-color: #6d3543;
      background: linear-gradient(90deg, #351720, #202833);
    }

    html[data-theme="dark"].sec29-suite-page .sec29-suite-sidebar-footer {
      background: #151b22;
    }

    html[data-theme="dark"].sec29-suite-page .surface,
    html[data-theme="dark"].sec29-suite-page .workflow-map,
    html[data-theme="dark"].sec29-suite-page .dropzone,
    html[data-theme="dark"].sec29-suite-page .file-summary,
    html[data-theme="dark"].sec29-suite-page .results-table-wrap,
    html[data-theme="dark"].sec29-suite-page .manual-row,
    html[data-theme="dark"].sec29-suite-page .action-card,
    html[data-theme="dark"].sec29-suite-page .metric,
    html[data-theme="dark"].sec29-suite-page .filters,
    html[data-theme="dark"].sec29-suite-page .page-audit,
    html[data-theme="dark"].sec29-suite-page .selected-list,
    html[data-theme="dark"].sec29-suite-page .installer-box {
      color: #edf2f7 !important;
      border-color: #35404c !important;
      background: #192029 !important;
      box-shadow: 0 18px 48px rgba(0,0,0,.24) !important;
    }

    html[data-theme="dark"].sec29-suite-page input,
    html[data-theme="dark"].sec29-suite-page textarea,
    html[data-theme="dark"].sec29-suite-page select,
    html[data-theme="dark"].sec29-suite-page code,
    html[data-theme="dark"].sec29-suite-page blockquote {
      color: #edf2f7 !important;
      border-color: #3d4957 !important;
      background: #10151b !important;
    }

    @media (max-width: 760px) {
      #sec29-suite-header { padding: 0 12px; }
      .sec29-suite-brand-mark { display: none; }
      .sec29-suite-current { display: none; }
      .sec29-suite-control { width: 39px; height: 39px; flex-basis: 39px; }
      .sec29-suite-brand-copy strong { font-size: 12px; }
      .sec29-suite-brand-copy small { max-width: 190px; }
    }
  `;
  document.head.appendChild(style);

  function setTheme(theme, persist = true) {
    const normalized = theme === "dark" ? "dark" : "light";
    root.dataset.theme = normalized;
    root.style.colorScheme = normalized;
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, normalized); } catch { /* sin persistencia */ }
    }

    const icon = document.querySelector("[data-sec29-theme-icon]");
    const button = document.querySelector("[data-sec29-theme-toggle]");
    const nextDark = normalized !== "dark";
    if (icon) icon.textContent = nextDark ? "☾" : "☀";
    if (button) {
      const label = nextDark ? "Activar modo oscuro" : "Activar modo claro";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.setAttribute("aria-pressed", String(normalized === "dark"));
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", normalized === "dark" ? "#3f0914" : "#821529");
  }

  function renderGroups() {
    const groups = [];
    for (const item of modules) {
      let group = groups.find((entry) => entry.name === item.group);
      if (!group) {
        group = { name: item.group, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }

    return groups.map((group) => `
      <div class="sec29-suite-group">
        <p class="sec29-suite-group-label">${group.name}</p>
        ${group.items.map((item) => `
          <a class="sec29-suite-nav-item${item.id === current ? " is-active" : ""}" href="${item.url}"${item.id === current ? ' aria-current="page"' : ""}>
            <span class="sec29-suite-nav-icon" aria-hidden="true">${item.icon}</span>
            <span class="sec29-suite-nav-copy"><strong>${item.label}</strong><small>${item.detail}</small></span>
          </a>
        `).join("")}
      </div>
    `).join("");
  }

  function initialize() {
    if (!document.body || document.getElementById("sec29-suite-header")) return;

    document.body.insertAdjacentHTML("afterbegin", `
      <header id="sec29-suite-header">
        <div class="sec29-suite-header-left">
          <button class="sec29-suite-control" type="button" data-sec29-menu-toggle aria-label="Abrir menú de herramientas" aria-expanded="false">☰</button>
          <button class="sec29-suite-control" type="button" data-sec29-theme-toggle aria-label="Cambiar tema" aria-pressed="false"><span data-sec29-theme-icon aria-hidden="true">☾</span></button>
          <a class="sec29-suite-brand" href="${MAIN}#procesadores">
            <span class="sec29-suite-brand-mark" aria-hidden="true">⚖</span>
            <span class="sec29-suite-brand-copy"><strong>Juzgado N.º 15 · Secretaría N.º 29</strong><small>Biblioteca de Mero Trámite · Herramientas internas</small></span>
          </a>
        </div>
        <div class="sec29-suite-header-actions"><span class="sec29-suite-current">${currentMeta.label}</span></div>
      </header>
      <aside id="sec29-suite-sidebar" aria-label="Menú de herramientas" aria-hidden="true" inert>
        <div class="sec29-suite-sidebar-heading"><span aria-hidden="true">▦</span><div><strong>Herramientas SEC29</strong><small>Acceso por módulos</small></div></div>
        <nav class="sec29-suite-nav">${renderGroups()}</nav>
        <div class="sec29-suite-sidebar-footer">Diseño y desarrollo: Marcelo Gómez · innovación aplicada a la gestión judicial.</div>
      </aside>
      <button id="sec29-suite-backdrop" type="button" aria-label="Cerrar menú"></button>
    `);

    const menu = document.querySelector("[data-sec29-menu-toggle]");
    const theme = document.querySelector("[data-sec29-theme-toggle]");
    const sidebar = document.getElementById("sec29-suite-sidebar");
    const backdrop = document.getElementById("sec29-suite-backdrop");

    const setMenu = (open) => {
      document.body.classList.toggle("sec29-suite-menu-open", open);
      menu?.setAttribute("aria-expanded", String(open));
      sidebar?.setAttribute("aria-hidden", String(!open));
      if (open) sidebar?.removeAttribute("inert");
      else sidebar?.setAttribute("inert", "");
    };

    menu?.addEventListener("click", () => {
      setMenu(!document.body.classList.contains("sec29-suite-menu-open"));
    });
    backdrop?.addEventListener("click", () => setMenu(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
    sidebar?.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) setMenu(false);
    });

    theme?.addEventListener("click", () => {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });

    setTheme(initialTheme(), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
