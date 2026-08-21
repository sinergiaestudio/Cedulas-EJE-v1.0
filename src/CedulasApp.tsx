"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { createEjeBookmarklet } from "./ejeBookmarklet";

type Outcome = "include" | "exclude" | "review";
type Filter = "all" | "include" | "exclude" | "review";

type AnalysisRow = {
  id: string;
  code: string;
  page: number;
  outcome: Outcome;
  reason: string;
  evidence: string;
  selected: boolean;
  manual?: boolean;
};

type PageAudit = {
  page: number;
  status: "valid" | "ignored" | "review";
  title: string;
  detail: string;
  codes: string[];
};

type PositionedText = {
  str: string;
  x: number;
  y: number;
};

export const DEMO_PAGES = [
  `Actuación Nro: 1870095/2026. Ciudad Autónoma de Buenos Aires. Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 532353/2026. En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
  `Actuación Nro: 1869276/2026. Ciudad Autónoma de Buenos Aires. Se hace saber que se ha procedido a confrontar las cédulas presentadas a través del “Portal del Litigante” bajo los códigos nº 534087/2026 y nº 535446/2026. En consecuencia, remítase digitalmente la pieza nº 534087/2026 a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento y obsérvese la cédula ingresada bajo el código nº 535446/2026 —de idéntico contenido—.`,
  `Actuación Nro: 1869000/2026. Ciudad Autónoma de Buenos Aires. Se hace saber que se ha procedido a confrontar las cédulas presentadas a través del “Portal del Litigante” bajo los códigos nº 534320/2026 y nº 534321/2026. En consecuencia, remítanse digitalmente las precitadas piezas a la “Oficina de Notificaciones del fuero” para sus respectivos diligenciamientos.`,
  `Actuación Nro: 1868112/2026. Agréguese. Téngase por confrontada la cédula Ley 22.172 ingresada bajo el código nº 531111/2026 y hágase saber a la parte interesada que deberá continuar su trámite.`,
  `Actuación Nro: 1867001/2026. Agréguese la documentación acompañada, téngase presente y hágase saber.`,
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”«»]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function extractCodes(value: string) {
  const matches = value.match(/\b\d{4,9}\s*\/\s*20\d{2}\b/g) ?? [];
  return unique(matches.map((match) => match.replace(/\s/g, "")));
}

function excerpt(value: string, needle: string, radius = 108) {
  const normalized = normalizeText(value);
  const position = normalized.indexOf(needle);
  if (position < 0) return value.replace(/\s+/g, " ").trim().slice(0, radius * 2);
  const start = Math.max(position - radius, 0);
  const end = Math.min(position + needle.length + radius, normalized.length);
  return `${start > 0 ? "…" : ""}${normalized.slice(start, end)}${end < normalized.length ? "…" : ""}`;
}

export function analyzePage(text: string, page: number): { rows: AnalysisRow[]; audit: PageAudit } {
  const normalized = normalizeText(text);
  const confrontationStart = normalized.search(/procedido\s+a\s+confrontar|tengase\s+por\s+confrontad[ao]s?/);
  const consequenceStart = normalized.indexOf("en consecuencia", Math.max(confrontationStart, 0));
  const confrontationEnd = consequenceStart >= 0 ? consequenceStart : normalized.length;
  const confrontationSegment = confrontationStart >= 0 ? normalized.slice(confrontationStart, confrontationEnd) : "";
  const confronted = extractCodes(confrontationSegment);

  const consequence = consequenceStart >= 0 ? normalized.slice(consequenceStart) : normalized;
  const observedMatch = consequence.match(/\bobserv(?:e|ese)\b/);
  const observedStart = observedMatch?.index ?? -1;
  const remittanceMatch = consequence.match(/\bremit(?:a|an)se\s+digitalmente\b/);
  const remittanceStart = remittanceMatch?.index ?? -1;
  const remittanceEnd = observedStart >= 0 ? observedStart : consequence.length;
  const remittanceSegment = remittanceStart >= 0 ? consequence.slice(remittanceStart, remittanceEnd) : "";
  const observedSegment = observedStart >= 0 ? consequence.slice(observedStart) : "";

  const explicitlyRemitted = extractCodes(remittanceSegment);
  const observed = extractCodes(observedSegment);
  const hasRemittanceVerb = /\bremit(?:a|an)se\s+digitalmente\b/.test(remittanceSegment);
  const hasOffice = /oficina\s+de\s+notificaciones\s+del\s+fuero/.test(remittanceSegment);
  const hasDiligenciamiento = /diligenciamientos?/.test(remittanceSegment);
  const positiveClause = hasRemittanceVerb && hasOffice && hasDiligenciamiento;
  const isLey22172 = /ley\s*(?:n(?:ro|o)?\.?\s*)?22\s*\.?\s*172/.test(normalized);
  const genericPlural = /\bremitanse\b|precitadas\s+piezas|respectivos\s+diligenciamientos/.test(remittanceSegment);

  let included: string[] = [];
  let unresolved: string[] = [];

  if (positiveClause && explicitlyRemitted.length) {
    included = explicitlyRemitted;
  } else if (positiveClause && confronted.length === 1) {
    included = confronted;
  } else if (positiveClause && confronted.length > 1 && genericPlural) {
    included = confronted;
  } else if (positiveClause && confronted.length > 1) {
    unresolved = confronted;
  }

  const allCandidates = unique([...confronted, ...explicitlyRemitted, ...observed]);

  if (!allCandidates.length) {
    const relevantButUnreadable = positiveClause || confrontationStart >= 0;
    return {
      rows: [],
      audit: {
        page,
        status: relevantButUnreadable ? "review" : "ignored",
        title: relevantButUnreadable ? "Actuación relevante sin código legible" : "Página sin remisión pertinente",
        detail: relevantButUnreadable
          ? "La redacción parece vinculada con una remisión, pero no fue posible aislar una numeración de cédula."
          : "No se detectó una cláusula de confronte y remisión a la Oficina de Notificaciones.",
        codes: [],
      },
    };
  }

  const evidence = excerpt(text, positiveClause ? "remit" : isLey22172 ? "ley" : "confront");
  const rows = allCandidates.map<AnalysisRow>((code, codeIndex) => {
    const isIncluded = included.includes(code);
    const isObserved = observed.includes(code);
    let outcome: Outcome;
    let reason: string;

    if (isIncluded && isObserved) {
      outcome = "review";
      reason = "La misma numeración aparece remitida y observada; requiere control humano.";
    } else if (isIncluded && positiveClause) {
      outcome = "include";
      reason = explicitlyRemitted.includes(code)
        ? "La numeración está asignada expresamente a la remisión a la Oficina de Notificaciones."
        : "La actuación remite la pieza —o todas las piezas— a la Oficina de Notificaciones.";
    } else if (isObserved) {
      outcome = "exclude";
      reason = "La actuación dispone observar esta cédula.";
    } else if (isLey22172) {
      outcome = "exclude";
      reason = "Cédula Ley 22.172: no corresponde remitirla a la Oficina de Notificaciones del fuero.";
    } else if (!positiveClause) {
      outcome = "exclude";
      reason = "No contiene la remisión expresa exigida a la Oficina de Notificaciones del fuero.";
    } else if (unresolved.includes(code)) {
      outcome = "review";
      reason = "Hay varias cédulas y la redacción no permite asignar con certeza cuál se remite.";
    } else {
      outcome = "review";
      reason = "La relación entre la numeración y la cláusula de remisión no es inequívoca.";
    }

    return {
      id: `p${page}-${code}-${codeIndex}`,
      code,
      page,
      outcome,
      reason,
      evidence,
      selected: outcome === "include",
    };
  });

  const includedCount = rows.filter((row) => row.outcome === "include").length;
  const reviewCount = rows.filter((row) => row.outcome === "review").length;
  const observedCount = rows.filter((row) => row.reason.includes("observar")).length;

  return {
    rows,
    audit: {
      page,
      status: reviewCount ? "review" : includedCount ? "valid" : "ignored",
      title: reviewCount
        ? "Requiere revisión"
        : includedCount
          ? `${includedCount} cédula${includedCount === 1 ? "" : "s"} para cargar`
          : isLey22172
            ? "Cédula Ley 22.172 excluida"
            : observedCount
              ? "Cédula observada"
              : "Sin remisión pertinente",
      detail: positiveClause
        ? "Se comprobó la fórmula de remisión a la Oficina de Notificaciones y se vinculó con la numeración correspondiente."
        : "No se cumplió la fórmula positiva requerida para una carga automática.",
      codes: allCandidates,
    },
  };
}

export function analyzeTexts(pages: string[]) {
  const rows: AnalysisRow[] = [];
  const audits: PageAudit[] = [];
  const alreadyIncluded = new Map<string, number>();

  pages.forEach((text, pageIndex) => {
    const result = analyzePage(text, pageIndex + 1);
    audits.push(result.audit);
    result.rows.forEach((row) => {
      if (row.outcome === "include") {
        const firstPage = alreadyIncluded.get(row.code);
        if (firstPage) {
          rows.push({
            ...row,
            outcome: "exclude",
            selected: false,
            reason: `Duplicada: ya fue seleccionada desde la página ${firstPage}.`,
          });
          return;
        }
        alreadyIncluded.set(row.code, row.page);
      }
      rows.push(row);
    });
  });

  return { rows, audits };
}

function reconstructPageText(items: PositionedText[]) {
  const sorted = [...items].sort((a, b) => Math.abs(b.y - a.y) > 2.4 ? b.y - a.y : a.x - b.x);
  const lines: Array<{ y: number; items: PositionedText[] }> = [];

  sorted.forEach((item) => {
    const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2.4);
    if (line) line.items.push(item);
    else lines.push({ y: item.y, items: [item] });
  });

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => line.items.sort((a, b) => a.x - b.x).map((item) => item.str).join(" "))
    .join("\n");
}

function downloadText(filename: string, contents: string, mimeType: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(new Blob([contents], { type: mimeType }));
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeCsv(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function CedulasApp() {
  const [rows, setRows] = useState<AnalysisRow[]>([]);
  const [audits, setAudits] = useState<PageAudit[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [fileName, setFileName] = useState("");
  const [fileMeta, setFileMeta] = useState("");
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [manualCode, setManualCode] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const bookmarkRef = useRef<HTMLAnchorElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bookmarklet = useMemo(() => createEjeBookmarklet(), []);

  useEffect(() => {
    bookmarkRef.current?.setAttribute("href", bookmarklet);
  }, [bookmarklet]);

  const selectedRows = useMemo(() => rows.filter((row) => row.selected), [rows]);
  const selectedCodes = useMemo(() => unique(selectedRows.map((row) => row.code)), [selectedRows]);
  const excludedCount = rows.filter((row) => row.outcome === "exclude").length;
  const reviewCount = rows.filter((row) => row.outcome === "review").length;
  const ignoredPages = audits.filter((audit) => audit.status === "ignored" && !audit.codes.length).length;

  const filteredRows = rows.filter((row) => {
    if (filter === "all") return true;
    return row.outcome === filter;
  });

  const applyAnalysis = (texts: string[], name: string, meta: string) => {
    const analysis = analyzeTexts(texts);
    setRows(analysis.rows);
    setAudits(analysis.audits);
    setFileName(name);
    setFileMeta(meta);
    setFilter("all");
    setCopyState("idle");
    setShowAudit(false);
  };

  const analyzeFile = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setError("Seleccioná un archivo PDF.");
      return;
    }
    if (file.size > 80 * 1024 * 1024) {
      setError("El PDF supera 80 MB. Dividilo en dos archivos para mantener un procesamiento estable.");
      return;
    }

    setAnalyzing(true);
    setProgress(2);
    setError("");
    setRows([]);
    setAudits([]);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.mjs", window.document.baseURI).toString();
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      const pdfDocument = await loadingTask.promise;
      const texts: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const content = await page.getTextContent();
        const items = content.items
          .filter((item): item is typeof item & { str: string; transform: number[] } => "str" in item && "transform" in item)
          .map<PositionedText>((item) => ({
            str: item.str,
            x: item.transform[4] ?? 0,
            y: item.transform[5] ?? 0,
          }));
        texts.push(reconstructPageText(items));
        setProgress(Math.round((pageNumber / pdfDocument.numPages) * 100));
      }

      if (!texts.some((text) => text.replace(/\s/g, "").length > 30)) {
        throw new Error("El PDF no contiene texto seleccionable. Parece una imagen escaneada y requiere OCR antes de poder analizarse con seguridad.");
      }

      applyAnalysis(texts, file.name, `${pdfDocument.numPages} páginas · ${(file.size / 1024 / 1024).toFixed(1)} MB · procesamiento local`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible leer el PDF.");
      setProgress(0);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void analyzeFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void analyzeFile(file);
  };

  const runDemo = () => {
    setError("");
    setProgress(100);
    applyAnalysis(DEMO_PAGES, "Demostración de criterios", "5 páginas simuladas · incluye los cuatro supuestos de las capturas");
  };

  const toggleRow = (id: string) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, selected: !row.selected } : row));
    setCopyState("idle");
  };

  const addManualCode = () => {
    const code = extractCodes(manualCode)[0];
    if (!code) {
      setError("La numeración manual debe tener el formato 000000/2026.");
      return;
    }
    if (selectedCodes.includes(code)) {
      setError("Esa cédula ya está seleccionada.");
      return;
    }
    setRows((current) => [
      ...current,
      {
        id: `manual-${Date.now()}-${code}`,
        code,
        page: 0,
        outcome: "review",
        reason: "Añadida manualmente por el usuario.",
        evidence: "Ingreso manual",
        selected: true,
        manual: true,
      },
    ]);
    setManualCode("");
    setError("");
    setCopyState("idle");
  };

  const copyCodes = async () => {
    if (!selectedCodes.length) return;
    const text = selectedCodes.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 3500);
  };

  const copyInstaller = async () => {
    try {
      await navigator.clipboard.writeText(bookmarklet);
      setError("");
    } catch {
      setError("El navegador no permitió copiar el instalador. Probá arrastrando el botón a la barra de marcadores.");
    }
  };

  const exportAudit = () => {
    const header = ["pagina", "codigo", "decision", "seleccionada", "motivo", "evidencia"].join(",");
    const body = rows.map((row) => [row.page || "manual", row.code, row.outcome, row.selected ? "si" : "no", row.reason, row.evidence].map(safeCsv).join(","));
    downloadText(`auditoria_cedulas_${new Date().toISOString().slice(0, 10)}.csv`, `\uFEFF${[header, ...body].join("\n")}`, "text/csv;charset=utf-8");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><span>C</span></div>
        <div className="brand-copy">
          <strong>Cédulas EJE</strong>
          <span>Analizador y cargador asistido</span>
        </div>
        <div className="privacy-pill"><i /> Procesamiento local</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">SECRETARÍA 29 · FLUJO DE NOTIFICACIONES</p>
          <h1>Del PDF al lote,<br /><em>sin copiar una por una.</em></h1>
          <p className="hero-description">
            Detecta únicamente las cédulas remitidas a la Oficina de Notificaciones,
            separa observadas y Ley 22.172, y prepara una carga controlada dentro de EJE.
          </p>
        </div>
        <div className="workflow-map" aria-label="Flujo de trabajo">
          <div className="workflow-item active"><span>01</span><div><b>Analizar</b><small>Leer el PDF</small></div></div>
          <div className="workflow-line" />
          <div className={`workflow-item ${rows.length ? "active" : ""}`}><span>02</span><div><b>Revisar</b><small>Confirmar criterios</small></div></div>
          <div className="workflow-line" />
          <div className={`workflow-item ${selectedCodes.length ? "active" : ""}`}><span>03</span><div><b>Cargar</b><small>Ejecutar en EJE</small></div></div>
        </div>
      </section>

      <div className="workspace-grid">
        <section className="main-column">
          <article className="surface upload-surface">
            <div className="section-heading">
              <div>
                <span className="section-number">01</span>
                <div><h2>Analizar PDF</h2><p>El archivo permanece en tu navegador.</p></div>
              </div>
              <button className="text-button" onClick={runDemo}>Probar con los 4 casos</button>
            </div>

            <div
              className={`dropzone ${dragging ? "dragging" : ""} ${analyzing ? "working" : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !analyzing && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click(); }}
            >
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileInput} hidden />
              <div className="upload-symbol" aria-hidden="true"><span>PDF</span><i>↑</i></div>
              {analyzing ? (
                <>
                  <h3>Leyendo actuaciones…</h3>
                  <p>Reconstruyendo texto y vinculando cada código con su decisión.</p>
                  <div className="analysis-progress"><div style={{ width: `${progress}%` }} /></div>
                  <small>{progress}%</small>
                </>
              ) : (
                <>
                  <h3>Arrastrá el PDF completo</h3>
                  <p>o hacé clic para seleccionarlo</p>
                  <small>PDF con texto seleccionable · hasta 80 MB</small>
                </>
              )}
            </div>

            {error && <div className="error-banner" role="alert"><b>Control:</b> {error}</div>}

            {fileName && !analyzing && (
              <div className="file-summary">
                <div className="file-icon">PDF</div>
                <div><strong>{fileName}</strong><span>{fileMeta}</span></div>
                <button onClick={() => fileInputRef.current?.click()}>Cambiar</button>
              </div>
            )}
          </article>

          {audits.length > 0 && (
            <article className="surface results-surface">
              <div className="section-heading results-heading">
                <div>
                  <span className="section-number">02</span>
                  <div><h2>Resultado verificable</h2><p>Cada decisión conserva página, motivo y evidencia.</p></div>
                </div>
                <button className="outline-button" onClick={exportAudit}>Exportar auditoría</button>
              </div>

              <div className="metrics">
                <div className="metric include"><span>{selectedCodes.length}</span><p>Para cargar</p></div>
                <div className="metric exclude"><span>{excludedCount}</span><p>Excluidas</p></div>
                <div className="metric review"><span>{reviewCount}</span><p>A revisar</p></div>
                <div className="metric ignored"><span>{ignoredPages}</span><p>Páginas ajenas</p></div>
              </div>

              <div className="filters" role="tablist" aria-label="Filtrar resultados">
                {([
                  ["all", "Todas"],
                  ["include", "Para cargar"],
                  ["exclude", "Excluidas"],
                  ["review", "A revisar"],
                ] as Array<[Filter, string]>).map(([value, label]) => (
                  <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>
                ))}
              </div>

              <div className="results-table-wrap">
                <table className="results-table">
                  <thead><tr><th>Usar</th><th>Cédula</th><th>Página</th><th>Decisión</th><th>Fundamento</th></tr></thead>
                  <tbody>
                    {filteredRows.length ? filteredRows.map((row) => (
                      <tr key={row.id} className={`row-${row.outcome}`}>
                        <td>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            disabled={row.outcome === "exclude"}
                            onChange={() => toggleRow(row.id)}
                            aria-label={`Seleccionar cédula ${row.code}`}
                          />
                        </td>
                        <td><code>{row.code}</code>{row.manual && <small>manual</small>}</td>
                        <td>{row.page || "—"}</td>
                        <td><span className={`decision ${row.outcome}`}>{row.outcome === "include" ? "Remitir" : row.outcome === "exclude" ? "Excluir" : "Revisar"}</span></td>
                        <td><p>{row.reason}</p><details><summary>Ver evidencia</summary><blockquote>{row.evidence}</blockquote></details></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="empty-row">No hay resultados en este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="manual-row">
                <div><b>¿Falta una cédula?</b><span>Podés incorporarla manualmente; quedará marcada en la auditoría.</span></div>
                <div><input value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="000000/2026" onKeyDown={(event) => { if (event.key === "Enter") addManualCode(); }} /><button onClick={addManualCode}>Añadir</button></div>
              </div>

              <button className="audit-toggle" onClick={() => setShowAudit((current) => !current)}>
                <span>{showAudit ? "Ocultar" : "Ver"} control página por página</span><b>{audits.length} páginas</b>
              </button>
              {showAudit && (
                <div className="page-audit-list">
                  {audits.map((audit) => (
                    <div key={audit.page} className={`page-audit ${audit.status}`}>
                      <span>Pág. {audit.page}</span><div><b>{audit.title}</b><p>{audit.detail}</p></div><code>{audit.codes.join(" · ") || "—"}</code>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}
        </section>

        <aside className="side-column">
          <article className="surface action-card sticky-card">
            <div className="section-heading compact">
              <div><span className="section-number">03</span><div><h2>Preparar EJE</h2><p>La creación final del lote queda bajo tu control.</p></div></div>
            </div>

            <div className={`selection-box ${selectedCodes.length ? "ready" : ""}`}>
              <span>Cédulas seleccionadas</span>
              <strong>{selectedCodes.length}</strong>
              <small>{selectedCodes.length ? "Sin duplicados" : "Analizá un PDF para continuar"}</small>
            </div>

            <button className="copy-primary" disabled={!selectedCodes.length} onClick={() => void copyCodes()}>
              <span>{copyState === "copied" ? "✓" : "1"}</span>
              <div><b>{copyState === "copied" ? "Lista copiada" : "Copiar lista aprobada"}</b><small>{copyState === "copied" ? "Ya podés ir a EJE" : "Una cédula por línea"}</small></div>
            </button>

            <div className="installer">
              <p className="installer-kicker">INSTALACIÓN ÚNICA · SIN PROGRAMAS</p>
              <h3>Guardá el cargador en Chrome</h3>
              <p>Mostrá la barra de marcadores con <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> y arrastrá este botón:</p>
              <a ref={bookmarkRef} className="bookmark-button" href="#" onClick={(event) => event.preventDefault()} draggable>
                <span>＋</span> Cargador EJE
              </a>
              <button className="copy-installer" onClick={() => void copyInstaller()}>Copiar código del marcador</button>
            </div>

            <ol className="eje-steps">
              <li><span>1</span><p>En EJE, abrí <b>Crear lote</b> y dejá seleccionada la opción <b>Cédula</b>.</p></li>
              <li><span>2</span><p>Hacé clic en el marcador <b>Cargador EJE</b> y pegá la lista.</p></li>
              <li><span>3</span><p>Iniciá. La herramienta aplica, comprueba la incorporación, limpia y recién entonces avanza.</p></li>
            </ol>

            <div className="safety-note"><i>!</i><p><b>Freno seguro.</b> Si EJE no confirma una cédula, el ciclo se detiene en esa misma numeración. Nunca crea el lote final.</p></div>
          </article>
        </aside>
      </div>

      <footer>
        <p>Herramienta de asistencia operativa · No modifica EJE ni transmite expedientes.</p>
        <span>v1.0 · criterio conservador y trazable</span>
      </footer>
    </main>
  );
}
