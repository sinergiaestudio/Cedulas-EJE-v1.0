import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const lines = (...parts: string[]) => parts.join("\n");

function replaceRequired(source: string, search: string, replacement: string, label: string) {
  if (!source.includes(search)) {
    throw new Error(`[sec29-observation-workflow] No se encontró el anclaje: ${label}`);
  }
  return source.replace(search, replacement);
}

function patchCedulasApp(source: string) {
  // Git puede materializar CRLF en Windows; los contratos de transformación
  // usan LF para producir exactamente el mismo artefacto en Pages y local.
  let code = source.replace(/\r\n/g, "\n");

  code = replaceRequired(
    code,
    lines(
      "  evidence: string;",
      "  selected: boolean;",
      "  manual?: boolean;",
    ),
    lines(
      "  evidence: string;",
      "  selected: boolean;",
      "  caseNumber: string;",
      "  observed: boolean;",
      "  manual?: boolean;",
    ),
    "campos de AnalysisRow",
  );

  code = replaceRequired(
    code,
    '    .replace(/[“”«»]/g, \'"\')',
    lines(
      '    .replace(/[“”«»]/g, \'"\')',
      '    .replace(/[\\u00ad\\u200b-\\u200d\\ufeff]/g, "")',
    ),
    "normalización de caracteres invisibles",
  );

  code = replaceRequired(
    code,
    lines(
      "function extractCodes(value: string) {",
      "  const matches = value.match(/\\b\\d{4,9}\\s*\\/\\s*20\\d{2}\\b/g) ?? [];",
      '  return unique(matches.map((match) => match.replace(/\\s/g, "")));',
      "}",
      "",
      "function excerpt(value: string, needle: string, radius = 108) {",
    ),
    lines(
      "function extractCodes(value: string) {",
      "  const matches = value.match(/\\b\\d{4,9}\\s*\\/\\s*20\\d{2}\\b/g) ?? [];",
      '  return unique(matches.map((match) => match.replace(/\\s/g, "")));',
      "}",
      "",
      "function extractCaseNumber(value: string) {",
      "  const normalized = normalizeText(value);",
      "  const explicit = normalized.match(/\\bnumero\\s*:\\s*(?:exp\\s*)?(\\d{1,12}\\s*\\/\\s*20\\d{2}\\s*-\\s*[a-z0-9]+)\\b/i);",
      "  const fallback = normalized.match(/\\bexp\\s*:?\\s*(\\d{1,12}\\s*\\/\\s*20\\d{2}\\s*-\\s*[a-z0-9]+)\\b/i);",
      '  return (explicit?.[1] ?? fallback?.[1] ?? "").replace(/\\s/g, "");',
      "}",
      "",
      "function excerpt(value: string, needle: string, radius = 108) {",
    ),
    "extracción del número de expediente",
  );

  code = replaceRequired(
    code,
    lines(
      "export function analyzePage(text: string, page: number): { rows: AnalysisRow[]; audit: PageAudit } {",
      "  const normalized = normalizeText(text);",
    ),
    lines(
      "export function analyzePage(text: string, page: number): { rows: AnalysisRow[]; audit: PageAudit } {",
      "  const normalized = normalizeText(text);",
      "  const caseNumber = extractCaseNumber(text);",
    ),
    "expediente por página",
  );

  code = replaceRequired(
    code,
    lines(
      "  const observedMatch = consequence.match(/\\bobserv(?:e|ese)\\b/);",
      "  const observedStart = observedMatch?.index ?? -1;",
      "  const remittanceMatch = consequence.match(/\\bremit(?:a|an)se\\s+digitalmente\\b/);",
      "  const remittanceStart = remittanceMatch?.index ?? -1;",
      "  const remittanceEnd = observedStart >= 0 ? observedStart : consequence.length;",
      '  const remittanceSegment = remittanceStart >= 0 ? consequence.slice(remittanceStart, remittanceEnd) : "";',
      '  const observedSegment = observedStart >= 0 ? consequence.slice(observedStart) : "";',
      "",
      "  const explicitlyRemitted = extractCodes(remittanceSegment);",
      "  const observed = extractCodes(observedSegment);",
      "  const hasRemittanceVerb = /\\bremit(?:a|an)se\\s+digitalmente\\b/.test(remittanceSegment);",
      "  const hasOffice = /oficina\\s+de\\s+notificaciones\\s+del\\s+fuero/.test(remittanceSegment);",
      "  const hasDiligenciamiento = /diligenciamientos?/.test(remittanceSegment);",
    ),
    lines(
      "  const observedMatch = consequence.match(/\\bobserv(?:e|ese)\\b/);",
      "  const observedStart = observedMatch?.index ?? -1;",
      "  const remittancePattern = /\\bremit[\\p{L}\\s]{0,14}digitalmente\\b/u;",
      "  const remittanceMatch = consequence.match(remittancePattern);",
      "  const remittanceStart = remittanceMatch?.index ?? -1;",
      "  const remittanceEnd = observedStart >= 0 ? observedStart : consequence.length;",
      "  const remittanceSegment = remittanceStart >= 0",
      "    ? consequence.slice(remittanceStart, remittanceEnd)",
      "    : consequence.slice(0, remittanceEnd);",
      '  const observedSegment = observedStart >= 0 ? consequence.slice(observedStart) : "";',
      "",
      "  const explicitlyRemitted = extractCodes(remittanceSegment);",
      "  const observed = extractCodes(observedSegment);",
      "  const hasRemittanceVerb = remittancePattern.test(remittanceSegment);",
      "  const hasOffice = /oficina\\s+de\\s+notificaciones\\s+del\\s+fuero/.test(remittanceSegment);",
      "  const hasDiligenciamiento = /diligenciamientos?/.test(remittanceSegment);",
    ),
    "detección tolerante de remisión",
  );

  code = replaceRequired(
    code,
    lines(
      "      reason,",
      "      evidence,",
      '      selected: outcome === "include",',
    ),
    lines(
      "      reason,",
      "      evidence,",
      '      selected: outcome === "include",',
      "      caseNumber,",
      "      observed: isObserved,",
    ),
    "metadatos de cada resultado",
  );

  code = replaceRequired(
    code,
    lines(
      '  const [manualCode, setManualCode] = useState("");',
      "  const [showAudit, setShowAudit] = useState(false);",
    ),
    lines(
      '  const [manualCode, setManualCode] = useState("");',
      "  const [showAudit, setShowAudit] = useState(false);",
      '  const [openingCase, setOpeningCase] = useState<string | null>(null);',
      '  const [ejeNotice, setEjeNotice] = useState("");',
    ),
    "estado de apertura de EJE",
  );

  code = replaceRequired(
    code,
    lines(
      '    setCopyState("idle");',
      "    setShowAudit(false);",
    ),
    lines(
      '    setCopyState("idle");',
      "    setShowAudit(false);",
      '    setEjeNotice("");',
      "    setOpeningCase(null);",
    ),
    "reinicio del aviso EJE",
  );

  code = replaceRequired(
    code,
    lines(
      '        evidence: "Ingreso manual",',
      "        selected: true,",
      "        manual: true,",
    ),
    lines(
      '        evidence: "Ingreso manual",',
      "        selected: true,",
      '        caseNumber: "",',
      "        observed: false,",
      "        manual: true,",
    ),
    "fila manual",
  );

  code = replaceRequired(
    code,
    "  const exportAudit = () => {",
    lines(
      "  const copyToClipboard = async (value: string) => {",
      "    try {",
      "      await navigator.clipboard.writeText(value);",
      "      return true;",
      "    } catch {",
      "      const field = document.createElement(\"textarea\");",
      "      field.value = value;",
      "      field.style.position = \"fixed\";",
      "      field.style.opacity = \"0\";",
      "      field.style.pointerEvents = \"none\";",
      "      document.body.appendChild(field);",
      "      field.focus();",
      "      field.select();",
      "      const copied = document.execCommand(\"copy\");",
      "      field.remove();",
      "      return copied;",
      "    }",
      "  };",
      "",
      "  const openObservation = async (row: AnalysisRow) => {",
      '    const EJE_HOME = "https://eje.jusbaires.gob.ar/iurix-ui/u/home";',
      "    if (!row.caseNumber) {",
      '      setEjeNotice(`No fue posible leer el número de expediente de la página ${row.page}.`);',
      "      return;",
      "    }",
      "",
      "    setOpeningCase(row.id);",
      '    setEjeNotice(`Copiando ${row.caseNumber} y abriendo EJE…`);',
      '    const popup = window.open(EJE_HOME, "sec29-eje-observar");',
      "    const copied = await copyToClipboard(row.caseNumber);",
      "",
      "    if (popup && !popup.closed) popup.focus();",
      "",
      "    if (!popup) {",
      "      setEjeNotice(copied",
      "        ? `Expediente ${row.caseNumber} copiado. El navegador bloqueó la pestaña de EJE; abrila y pegalo en el buscador.`",
      "        : `No fue posible abrir EJE ni copiar automáticamente. Copiá el expediente ${row.caseNumber}.`);",
      "    } else {",
      "      setEjeNotice(copied",
      "        ? `Expediente ${row.caseNumber} copiado. Pegalo en el buscador de EJE y presioná Enter.`",
      "        : `EJE quedó abierto. Copiá manualmente el expediente ${row.caseNumber} y pegalo en el buscador.`);",
      "    }",
      "",
      "    setOpeningCase(null);",
      "  };",
      "",
      "  const exportAudit = () => {",
    ),
    "apertura del expediente en EJE",
  );

  code = replaceRequired(
    code,
    lines(
      '    const header = ["pagina", "codigo", "decision", "seleccionada", "motivo", "evidencia"].join(",");',
      '    const body = rows.map((row) => [row.page || "manual", row.code, row.outcome, row.selected ? "si" : "no", row.reason, row.evidence].map(safeCsv).join(","));',
    ),
    lines(
      '    const header = ["pagina", "expediente", "codigo", "decision", "observada", "seleccionada", "motivo", "evidencia"].join(",");',
      '    const body = rows.map((row) => [row.page || "manual", row.caseNumber, row.code, row.outcome, row.observed ? "si" : "no", row.selected ? "si" : "no", row.reason, row.evidence].map(safeCsv).join(","));',
    ),
    "auditoría con expediente",
  );

  code = replaceRequired(
    code,
    lines(
      "              </div>",
      "",
      '              <div className="results-table-wrap">',
    ),
    lines(
      "              </div>",
      "",
      '              {ejeNotice && <div className="eje-link-notice" role="status"><span aria-hidden="true">↗</span><p>{ejeNotice}</p></div>}',
      "",
      '              <div className="results-table-wrap">',
    ),
    "aviso de navegación EJE",
  );

  code = replaceRequired(
    code,
    '                  <thead><tr><th>Usar</th><th>Cédula</th><th>Página</th><th>Decisión</th><th>Fundamento</th></tr></thead>',
    '                  <thead><tr><th>Usar</th><th>Cédula</th><th>Página</th><th>Decisión</th><th>Fundamento</th><th>Acción</th></tr></thead>',
    "columna Acción",
  );

  code = replaceRequired(
    code,
    lines(
      '                        <td><p>{row.reason}</p><details><summary>Ver evidencia</summary><blockquote>{row.evidence}</blockquote></details></td>',
      "                      </tr>",
    ),
    lines(
      '                        <td><p>{row.reason}</p><details><summary>Ver evidencia</summary><blockquote>{row.evidence}</blockquote></details></td>',
      '                        <td className="eje-action-cell">',
      "                          {row.observed ? (",
      "                            <button",
      '                              className="eje-observe-button"',
      '                              type="button"',
      "                              disabled={!row.caseNumber || openingCase === row.id}",
      "                              title={row.caseNumber ? `Abrir ${row.caseNumber} en Actuaciones de EJE` : \"Expediente no legible\"}",
      "                              onClick={() => void openObservation(row)}",
      "                            >",
      '                              <span aria-hidden="true">↗</span>',
      '                              {openingCase === row.id ? "Abriendo…" : "Observar"}',
      "                            </button>",
      "                          ) : (",
      '                            <span className="eje-action-empty" aria-label="Sin acción directa">—</span>',
      "                          )}",
      "                        </td>",
      "                      </tr>",
    ),
    "botón Observar",
  );

  code = replaceRequired(
    code,
    '<tr><td colSpan={5} className="empty-row">No hay resultados en este filtro.</td></tr>',
    '<tr><td colSpan={6} className="empty-row">No hay resultados en este filtro.</td></tr>',
    "colspan de tabla",
  );

  code = replaceRequired(
    code,
    '  `Actuación Nro: 1869276/2026. Ciudad Autónoma de Buenos Aires.',
    '  `Número: EXP 12463/2020-0. Actuación Nro: 1869276/2026. Ciudad Autónoma de Buenos Aires.',
    "expediente del caso observado de demostración",
  );

  return code;
}


function patchAnalysisV2(source: string) {
  let code = source;
  const importAnchor = 'import { createEjeBookmarklet } from "./ejeBookmarklet";';
  const analysisImport = 'import { analyzePageV2, analyzeTextsV2 } from "./cedulaAnalysis";';

  if (!code.includes(analysisImport)) {
    if (!code.includes(importAnchor)) {
      throw new Error("[sec29-analysis-v2] No se encontró el import del bookmarklet.");
    }
    code = code.replace(importAnchor, importAnchor + "\n" + analysisImport);
  }

  const analysisBlock = /export function analyzePage\([\s\S]*?\n}\n\nexport function analyzeTexts\([\s\S]*?\n}\n\nfunction reconstructPageText/;
  if (!analysisBlock.test(code)) {
    throw new Error("[sec29-analysis-v2] No se encontró el analizador anterior.");
  }

  code = code.replace(
    analysisBlock,
    "export const analyzePage = analyzePageV2;\n\n"
      + "export const analyzeTexts = analyzeTextsV2;\n\n"
      + "function reconstructPageText",
  );

  code = code.replace(
    "v1.0 · criterio conservador y trazable",
    "v1.2 · evidencia operativa y detección por cláusulas",
  );

  return code;
}

function sec29ObservationWorkflow(): Plugin {
  return {
    name: "sec29-observation-workflow",
    enforce: "pre",
    transform(source, id) {
      if (!/[\\/]src[\\/]CedulasApp\.tsx(?:\?.*)?$/.test(id)) return null;
      return { code: patchAnalysisV2(patchCedulasApp(source)), map: null };
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [sec29ObservationWorkflow(), react()],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
