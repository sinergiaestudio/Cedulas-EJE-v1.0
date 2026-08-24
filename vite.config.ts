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
  let code = source;

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
      "  const resolveEjeExpId = async (caseNumber: string) => {",
      "    const controller = new AbortController();",
      "    const timeout = window.setTimeout(() => controller.abort(), 7000);",
      "    const normalizedCase = caseNumber.replace(/\\s/g, \"\").toLowerCase();",
      "",
      "    try {",
      "      const filter = JSON.stringify({ identificador: caseNumber });",
      "      const info = JSON.stringify({ filter, tipoBusqueda: \"CAU\", page: 0, size: 10 });",
      "      const listResponse = await fetch(\"https://eje.jusbaires.gob.ar/iol-api/api/public/expedientes/lista\", {",
      '        method: "POST",',
      '        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },',
      "        body: new URLSearchParams({ info }),",
      '        credentials: "omit",',
      "        signal: controller.signal,",
      "      });",
      "",
      "      if (!listResponse.ok) throw new Error(`Búsqueda EJE: ${listResponse.status}`);",
      "      const payload = await listResponse.json() as { content?: Array<{ expId?: number }> };",
      "      const candidates = unique((payload.content ?? [])",
      "        .map((item) => item.expId)",
      "        .filter((value): value is number => Number.isInteger(value)));",
      "",
      "      for (const candidate of candidates) {",
      "        try {",
      "          const fichaResponse = await fetch(`https://eje.jusbaires.gob.ar/iol-api/api/public/expedientes/ficha?expId=${candidate}`, {",
      '            credentials: "omit",',
      "            signal: controller.signal,",
      "          });",
      "          if (!fichaResponse.ok) continue;",
      "          const ficha = await fichaResponse.json() as { numero?: number; anio?: number; sufijo?: number | string };",
      "          const resolved = `${ficha.numero}/${ficha.anio}-${ficha.sufijo}`.toLowerCase();",
      "          if (resolved === normalizedCase) return candidate;",
      "        } catch {",
      "          // Si la ficha pública no responde, se conserva el primer candidato exacto de la búsqueda.",
      "        }",
      "      }",
      "",
      "      return candidates[0] ?? null;",
      "    } finally {",
      "      window.clearTimeout(timeout);",
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
      '    setEjeNotice(`Abriendo ${row.caseNumber} en EJE…`);',
      "    void navigator.clipboard?.writeText(row.caseNumber).catch(() => undefined);",
      '    const popup = window.open(EJE_HOME, "_blank");',
      "",
      "    try {",
      "      const expId = await resolveEjeExpId(row.caseNumber);",
      "      if (!expId) throw new Error(\"No se obtuvo el identificador interno.\");",
      "      const directUrl = `https://eje.jusbaires.gob.ar/iurix-ui/u/expediente/expId/${expId}/inicio/list`;",
      "      if (popup && !popup.closed) popup.location.href = directUrl;",
      '      else window.open(directUrl, "_blank", "noopener,noreferrer");',
      '      setEjeNotice(`Expediente ${row.caseNumber} abierto directamente en Actuaciones de EJE.`);',
      "    } catch {",
      '      if (!popup || popup.closed) window.open(EJE_HOME, "_blank", "noopener,noreferrer");',
      '      setEjeNotice(`Se abrió el buscador de EJE y se copió ${row.caseNumber}. Pegalo en la búsqueda si no se resolvió el acceso directo.`);',
      "    } finally {",
      "      setOpeningCase(null);",
      "    }",
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

function sec29ObservationWorkflow(): Plugin {
  return {
    name: "sec29-observation-workflow",
    enforce: "pre",
    transform(source, id) {
      if (!/[\\/]src[\\/]CedulasApp\\.tsx$/.test(id)) return null;
      return { code: patchCedulasApp(source), map: null };
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
