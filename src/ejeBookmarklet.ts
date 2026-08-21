export function createEjeBookmarklet(): string {
  function ejeCedulasLoader() {
    const HOST_ID = "__eje_cedulas_loader_v1__";
    const existing = document.getElementById(HOST_ID);

    if (existing) {
      existing.style.display = "block";
      return;
    }

    const host = document.createElement("div");
    host.id = HOST_ID;
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "none";
    document.documentElement.appendChild(host);

    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { all: initial; }
        *, *::before, *::after { box-sizing: border-box; }
        .panel {
          pointer-events: auto;
          position: fixed;
          right: 18px;
          top: 18px;
          width: min(430px, calc(100vw - 36px));
          max-height: calc(100vh - 36px);
          overflow: auto;
          color: #1d2430;
          background: #f8f6f1;
          border: 1px solid rgba(48, 36, 31, .16);
          border-radius: 18px;
          box-shadow: 0 24px 70px rgba(24, 19, 17, .32);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 1.45;
        }
        .head {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 18px;
          color: #fff;
          background: #8f1d35;
          border-radius: 17px 17px 0 0;
        }
        .head strong { display: block; font-size: 15px; letter-spacing: .01em; }
        .head small { display: block; margin-top: 2px; color: rgba(255,255,255,.76); font-size: 11px; }
        .close {
          width: 32px;
          height: 32px;
          flex: 0 0 auto;
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 10px;
          color: #fff;
          background: rgba(255,255,255,.08);
          font-size: 19px;
          cursor: pointer;
        }
        .body { padding: 17px 18px 18px; }
        .privacy {
          display: flex;
          gap: 9px;
          margin-bottom: 14px;
          padding: 10px 11px;
          border: 1px solid #d9d2c6;
          border-radius: 11px;
          color: #5c564d;
          background: #fffdf9;
          font-size: 12px;
        }
        .privacy b { color: #21725c; }
        label { display: block; margin: 0 0 7px; font-size: 12px; font-weight: 750; color: #4f4a43; }
        textarea {
          width: 100%;
          min-height: 118px;
          resize: vertical;
          padding: 11px 12px;
          border: 1px solid #c9c1b5;
          border-radius: 12px;
          outline: none;
          color: #20252d;
          background: #fff;
          font: 650 14px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        }
        textarea:focus { border-color: #a72a43; box-shadow: 0 0 0 3px rgba(167,42,67,.11); }
        .field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 12px 0;
          padding: 10px 11px;
          border-radius: 11px;
          background: #eeeae2;
        }
        .field-state { min-width: 0; }
        .field-state span { display: block; color: #5b554d; font-size: 11px; }
        .field-state strong { display: block; overflow: hidden; margin-top: 1px; color: #252b34; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
        .dot { display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 50%; background: #c18a26; }
        .dot.ok { background: #23836a; }
        button { font: inherit; }
        .mini, .secondary, .primary, .danger {
          border-radius: 10px;
          cursor: pointer;
          transition: transform .12s ease, opacity .12s ease, background .12s ease;
        }
        .mini:active, .secondary:active, .primary:active, .danger:active { transform: translateY(1px); }
        .mini { padding: 7px 9px; border: 1px solid #c8bfb3; color: #3f464f; background: #fff; font-size: 11px; font-weight: 700; }
        .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .primary { padding: 11px 12px; border: 1px solid #8f1d35; color: #fff; background: #8f1d35; font-weight: 800; }
        .primary:hover { background: #77172c; }
        .secondary { padding: 10px 11px; border: 1px solid #bdb4a8; color: #303741; background: #fff; font-weight: 700; }
        .danger { padding: 10px 11px; border: 1px solid #d2b6b6; color: #9c2f2f; background: #fff7f5; font-weight: 750; }
        button:disabled { cursor: not-allowed; opacity: .48; }
        .progress-wrap { margin-top: 14px; }
        .progress-meta { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 6px; color: #666057; font-size: 11px; font-weight: 700; }
        .track { height: 8px; overflow: hidden; border-radius: 999px; background: #ddd7cd; }
        .bar { width: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #8f1d35, #c83c57); transition: width .2s ease; }
        .current {
          min-height: 48px;
          margin-top: 11px;
          padding: 10px 11px;
          border: 1px solid #ded7cc;
          border-radius: 11px;
          color: #555047;
          background: #fffdf9;
          font-size: 12px;
        }
        .current strong { color: #8f1d35; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
        .log-title { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; }
        .log-title strong { font-size: 12px; }
        .log { max-height: 150px; overflow: auto; margin: 7px 0 0; padding: 0; list-style: none; }
        .log li { display: grid; grid-template-columns: 92px 1fr; gap: 8px; padding: 7px 0; border-top: 1px solid #e2dcd2; font-size: 11px; }
        .log code { color: #303741; font-weight: 800; }
        .ok-text { color: #21725c; }
        .warn-text { color: #986916; }
        .error-text { color: #a02c38; }
        .foot { margin-top: 12px; color: #766f65; font-size: 10px; }
      </style>
      <aside class="panel" role="dialog" aria-label="Cargador de cédulas EJE">
        <header class="head">
          <div><strong>Cargador de cédulas</strong><small>EJE · ejecución verificada</small></div>
          <button class="close" id="close" title="Cerrar" aria-label="Cerrar">×</button>
        </header>
        <div class="body">
          <div class="privacy"><span>●</span><div><b>Todo ocurre en esta pestaña.</b><br>No se envían datos ni se confirma el lote final.</div></div>
          <label for="codes">Cédulas a incorporar — una por línea</label>
          <textarea id="codes" spellcheck="false" placeholder="534087/2026&#10;534320/2026&#10;534321/2026"></textarea>
          <div class="field">
            <div class="field-state"><span><i class="dot" id="dot"></i>Campo de EJE</span><strong id="field-label">Buscando…</strong></div>
            <button class="mini" id="pick-field">Elegir campo</button>
          </div>
          <div class="actions">
            <button class="primary" id="start">Iniciar carga</button>
            <button class="secondary" id="pause" disabled>Pausar</button>
            <button class="danger" id="stop" disabled>Detener</button>
            <button class="secondary" id="skip" disabled>Omitir actual</button>
          </div>
          <div class="progress-wrap">
            <div class="progress-meta"><span id="progress-text">0 de 0</span><span id="state">Listo</span></div>
            <div class="track"><div class="bar" id="bar"></div></div>
          </div>
          <div class="current" id="current">Pegá la lista, verificá el campo detectado y comenzá.</div>
          <div class="log-title"><strong>Registro</strong><button class="mini" id="export">Exportar CSV</button></div>
          <ul class="log" id="log"></ul>
          <div class="foot">El proceso se detiene ante una respuesta dudosa. Nunca presiona “Crear lote”.</div>
        </div>
      </aside>`;

    const get = <T extends Element>(selector: string) => root.querySelector(selector) as T;
    const textarea = get<HTMLTextAreaElement>("#codes");
    const startButton = get<HTMLButtonElement>("#start");
    const pauseButton = get<HTMLButtonElement>("#pause");
    const stopButton = get<HTMLButtonElement>("#stop");
    const skipButton = get<HTMLButtonElement>("#skip");
    const stateLabel = get<HTMLElement>("#state");
    const currentLabel = get<HTMLElement>("#current");
    const progressText = get<HTMLElement>("#progress-text");
    const progressBar = get<HTMLElement>("#bar");
    const fieldLabel = get<HTMLElement>("#field-label");
    const fieldDot = get<HTMLElement>("#dot");
    const logList = get<HTMLUListElement>("#log");

    let targetField: HTMLInputElement | HTMLTextAreaElement | null = null;
    let queue: string[] = [];
    let index = 0;
    let running = false;
    let paused = false;
    let stopRequested = false;
    let skipRequested = false;
    let picking = false;
    const records: Array<{ code: string; status: string; detail: string; time: string }> = [];

    const normalize = (value: string) =>
      String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const compact = (value: string) => normalize(value).replace(/\s/g, "");

    const visible = (element: Element) => {
      const html = element as HTMLElement;
      const style = getComputedStyle(html);
      const rect = html.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 2 && rect.height > 2;
    };

    const parseCodes = (value: string) => {
      const found = value.match(/\b\d{4,9}\s*\/\s*20\d{2}\b/g) || [];
      return Array.from(new Set(found.map((item) => item.replace(/\s/g, ""))));
    };

    const describeField = (field: HTMLInputElement | HTMLTextAreaElement) => {
      const placeholder = field.getAttribute("placeholder") || field.getAttribute("aria-label") || "Campo sin etiqueta";
      return placeholder.length > 56 ? `${placeholder.slice(0, 53)}…` : placeholder;
    };

    const detectField = () => {
      const candidates = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"))
        .filter((field) => visible(field) && !field.disabled && !field.readOnly)
        .map((field) => {
          const own = normalize([
            field.getAttribute("placeholder"),
            field.getAttribute("aria-label"),
            field.getAttribute("name"),
            field.id,
          ].filter(Boolean).join(" "));
          const nearby = normalize(field.parentElement?.parentElement?.innerText || field.parentElement?.innerText || "");
          let score = 0;
          if (/cod.*barra/.test(own)) score += 14;
          if (own.includes("cedula")) score += 12;
          if (/cuij.*numero.*ano/.test(own) && nearby.includes("cedula")) score += 9;
          if (nearby.includes("cedula")) score += 5;
          if (own.includes("expediente") || nearby.startsWith("expediente")) score -= 8;
          if (own.includes("fecha") || own.includes("usuario")) score -= 12;
          return { field, score };
        })
        .sort((a, b) => b.score - a.score);

      return candidates[0]?.score >= 5 ? candidates[0].field : null;
    };

    const setTarget = (field: HTMLInputElement | HTMLTextAreaElement | null) => {
      if (targetField && targetField !== field) targetField.style.removeProperty("outline");
      targetField = field;
      if (field) {
        field.style.setProperty("outline", "3px solid rgba(35,131,106,.55)", "important");
        fieldLabel.textContent = describeField(field);
        fieldDot.classList.add("ok");
      } else {
        fieldLabel.textContent = "No detectado";
        fieldDot.classList.remove("ok");
      }
    };

    const distance = (a: Element, b: Element) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const ax = ar.left + ar.width / 2;
      const ay = ar.top + ar.height / 2;
      const bx = br.left + br.width / 2;
      const by = br.top + br.height / 2;
      return Math.hypot(ax - bx, ay - by);
    };

    const findControl = (label: string, near: Element) => {
      const wanted = normalize(label);
      return Array.from(document.querySelectorAll<HTMLElement>("button, [role='button'], input[type='button'], input[type='submit'], a"))
        .filter((element) => visible(element) && normalize((element as HTMLInputElement).value || element.innerText || element.textContent || "") === wanted)
        .sort((a, b) => distance(a, near) - distance(b, near))[0] || null;
    };

    const nativeSetValue = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
      const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      setter?.call(field, value);
      field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const pageHasCode = (code: string) => {
      const [number, year] = code.split("/");
      if (!number || !year) return false;
      const pageText = normalize(document.body.innerText || "");
      const escapedNumber = number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedYear = year.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`${escapedNumber}\\s*(?:/|\\n|–|-)?\\s*${escapedYear}`).test(pageText);
    };

    const pageError = () => {
      const text = normalize(document.body.innerText || "");
      const messages = ["no se encontraron", "sin resultados", "ocurrio un error", "error al", "dato invalido"];
      return messages.find((message) => text.includes(message)) || "";
    };

    const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

    const waitUntil = async (predicate: () => boolean, timeout = 16000, interval = 220) => {
      const started = Date.now();
      while (Date.now() - started < timeout) {
        if (predicate()) return true;
        if (stopRequested || skipRequested) return false;
        await delay(interval);
      }
      return false;
    };

    const addLog = (code: string, status: "ok" | "warn" | "error", detail: string) => {
      const item = document.createElement("li");
      item.innerHTML = `<code>${code}</code><span class="${status}-text">${detail}</span>`;
      logList.prepend(item);
      records.push({ code, status, detail, time: new Date().toISOString() });
    };

    const updateProgress = () => {
      const total = queue.length;
      const finished = Math.min(index, total);
      progressText.textContent = `${finished} de ${total}`;
      progressBar.style.width = total ? `${Math.round((finished / total) * 100)}%` : "0%";
    };

    const setControls = () => {
      startButton.disabled = running;
      pauseButton.disabled = !running;
      stopButton.disabled = !running;
      skipButton.disabled = !running;
      textarea.disabled = running;
      pauseButton.textContent = paused ? "Continuar" : "Pausar";
    };

    const stopWithError = (code: string, detail: string) => {
      running = false;
      paused = false;
      addLog(code, "error", detail);
      stateLabel.textContent = "Detenido por control";
      currentLabel.innerHTML = `Revisá <strong>${code}</strong>. Corregí la pantalla y presioná “Iniciar carga” para reintentar sin perder la cola.`;
      setControls();
    };

    const processQueue = async () => {
      while (running && index < queue.length) {
        while (paused && running && !stopRequested) await delay(180);
        if (!running || stopRequested) break;

        const code = queue[index];
        skipRequested = false;
        currentLabel.innerHTML = `Procesando <strong>${code}</strong>…`;
        stateLabel.textContent = "Verificando";

        if (!targetField || !targetField.isConnected) setTarget(detectField());
        if (!targetField) {
          stopWithError(code, "No se encontró el campo Cédula.");
          return;
        }

        if (pageHasCode(code)) {
          addLog(code, "warn", "Ya figuraba en la pantalla; no se repitió.");
          index += 1;
          updateProgress();
          continue;
        }

        try {
          targetField.scrollIntoView({ block: "center", behavior: "smooth" });
          targetField.focus();
          nativeSetValue(targetField, code);
          await delay(420);

          if (compact(targetField.value) !== compact(code)) throw new Error("EJE no aceptó el número en el campo Cédula.");

          const applyButton = findControl("Aplicar y agregar", targetField);
          if (!applyButton) throw new Error("No se encontró el botón “Aplicar y agregar”.");

          stateLabel.textContent = "Esperando a EJE";
          applyButton.click();

          const confirmed = await waitUntil(() => pageHasCode(code) || Boolean(pageError()));
          if (skipRequested) {
            addLog(code, "warn", "Omitida por el usuario.");
            index += 1;
            updateProgress();
            continue;
          }

          const error = pageError();
          if (error && !pageHasCode(code)) throw new Error(`EJE informó: ${error}.`);
          if (!confirmed || !pageHasCode(code)) throw new Error("No pudo comprobarse que la cédula fuera incorporada.");

          addLog(code, "ok", "Incorporada y verificada.");
          stateLabel.textContent = "Limpiando filtros";

          const clearButton = findControl("Limpiar", targetField);
          if (clearButton) {
            clearButton.click();
            await waitUntil(() => !targetField || compact(targetField.value) === "", 5000);
          } else {
            nativeSetValue(targetField, "");
          }

          index += 1;
          updateProgress();
          await delay(650);
        } catch (error) {
          stopWithError(code, error instanceof Error ? error.message : "Respuesta inesperada de EJE.");
          return;
        }
      }

      if (stopRequested) {
        running = false;
        paused = false;
        stateLabel.textContent = "Detenido";
        currentLabel.textContent = `Carga detenida. Quedan ${Math.max(queue.length - index, 0)} cédulas pendientes.`;
      } else if (index >= queue.length) {
        running = false;
        paused = false;
        stateLabel.textContent = "Completado";
        currentLabel.innerHTML = `<strong>${queue.length}</strong> cédulas recorridas. Revisá el listado y creá el lote manualmente cuando estés conforme.`;
      }
      setControls();
    };

    const start = () => {
      if (running) return;
      const parsed = parseCodes(textarea.value);
      if (!parsed.length) {
        currentLabel.textContent = "No se encontraron códigos con formato 000000/2026.";
        return;
      }

      if (!queue.length || parsed.join("|") !== queue.join("|")) {
        queue = parsed;
        index = 0;
        logList.innerHTML = "";
        records.length = 0;
      }

      setTarget(targetField?.isConnected ? targetField : detectField());
      if (!targetField) {
        currentLabel.textContent = "No pude identificar el campo. Presioná “Elegir campo” y hacé clic en el cuadro junto a Cédula.";
        stateLabel.textContent = "Falta elegir campo";
        return;
      }

      running = true;
      paused = false;
      stopRequested = false;
      skipRequested = false;
      stateLabel.textContent = "En curso";
      setControls();
      updateProgress();
      void processQueue();
    };

    startButton.addEventListener("click", start);
    pauseButton.addEventListener("click", () => {
      paused = !paused;
      stateLabel.textContent = paused ? "Pausado" : "En curso";
      setControls();
    });
    stopButton.addEventListener("click", () => {
      stopRequested = true;
      paused = false;
      stateLabel.textContent = "Deteniendo…";
    });
    skipButton.addEventListener("click", () => {
      skipRequested = true;
    });

    get<HTMLButtonElement>("#pick-field").addEventListener("click", () => {
      if (picking) return;
      picking = true;
      host.style.pointerEvents = "none";
      currentLabel.textContent = "Hacé clic una vez en el campo donde se ingresa el código de la cédula.";

      const choose = (event: MouseEvent) => {
        const path = event.composedPath();
        if (path.includes(host)) return;
        const element = event.target as Element | null;
        const field = element?.closest("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
        if (!field) return;
        event.preventDefault();
        event.stopPropagation();
        document.removeEventListener("click", choose, true);
        host.style.pointerEvents = "none";
        root.querySelector<HTMLElement>(".panel")!.style.pointerEvents = "auto";
        picking = false;
        setTarget(field);
        currentLabel.textContent = "Campo registrado. Ya podés iniciar la carga.";
      };

      document.addEventListener("click", choose, true);
    });

    get<HTMLButtonElement>("#export").addEventListener("click", () => {
      if (!records.length) {
        currentLabel.textContent = "Todavía no hay registros para exportar.";
        return;
      }
      const escape = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
      const csv = ["codigo,estado,detalle,fecha", ...records.map((record) => [record.code, record.status, record.detail, record.time].map(escape).join(","))].join("\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `registro_cedulas_eje_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    get<HTMLButtonElement>("#close").addEventListener("click", () => {
      if (running && !window.confirm("La carga está en curso. ¿Querés cerrar el cargador?")) return;
      stopRequested = true;
      targetField?.style.removeProperty("outline");
      host.remove();
    });

    setTarget(detectField());
    updateProgress();

    if (navigator.clipboard?.readText) {
      navigator.clipboard.readText().then((text) => {
        const codes = parseCodes(text);
        if (codes.length && !textarea.value) {
          textarea.value = codes.join("\n");
          currentLabel.textContent = `${codes.length} cédulas recuperadas del portapapeles. Revisalas antes de iniciar.`;
        }
      }).catch(() => undefined);
    }
  }

  return `javascript:(${ejeCedulasLoader.toString()})()`;
}
