import { readFile, writeFile } from "node:fs/promises";

const path = "vite.config.ts";
let source = await readFile(path, "utf8");
let changed = false;

const brokenSelector = 'if (!/[\\\\/]src[\\\\/]CedulasApp\\\\.tsx$/.test(id)) return null;';
const fixedSelector = 'if (!/[\\\\/]src[\\\\/]CedulasApp\\.tsx(?:\\?.*)?$/.test(id)) return null;';

if (source.includes(brokenSelector)) {
  source = source.replace(brokenSelector, fixedSelector);
  changed = true;
  console.log("Selector del módulo CedulasApp corregido antes de compilar.");
} else if (source.includes(fixedSelector)) {
  console.log("El selector del módulo CedulasApp ya está corregido.");
} else {
  console.error("No se encontró el selector esperado en vite.config.ts.");
  process.exit(1);
}

const legacyStart = '      "  const resolveEjeExpId = async (caseNumber: string) => {",';
const simplifiedStart = '      "  const copyToClipboard = async (value: string) => {",';
const exportStart = '      "  const exportAudit = () => {",';

const simplifiedObservationBlock = [
  '      "  const copyToClipboard = async (value: string) => {",',
  '      "    try {",',
  '      "      await navigator.clipboard.writeText(value);",',
  '      "      return true;",',
  '      "    } catch {",',
  '      "      const field = document.createElement(\\"textarea\\");",',
  '      "      field.value = value;",',
  '      "      field.style.position = \\"fixed\\";",',
  '      "      field.style.opacity = \\"0\\";",',
  '      "      field.style.pointerEvents = \\"none\\";",',
  '      "      document.body.appendChild(field);",',
  '      "      field.focus();",',
  '      "      field.select();",',
  '      "      const copied = document.execCommand(\\"copy\\");",',
  '      "      field.remove();",',
  '      "      return copied;",',
  '      "    }",',
  '      "  };",',
  '      "",',
  '      "  const openObservation = async (row: AnalysisRow) => {",',
  '      \'    const EJE_HOME = "https://eje.jusbaires.gob.ar/iurix-ui/u/home";\',',
  '      "    if (!row.caseNumber) {",',
  '      \'      setEjeNotice(`No fue posible leer el número de expediente de la página ${row.page}.`);\',',
  '      "      return;",',
  '      "    }",',
  '      "",',
  '      "    setOpeningCase(row.id);",',
  '      \'    setEjeNotice(`Copiando ${row.caseNumber} y abriendo EJE…`);\',',
  '      \'    const popup = window.open(EJE_HOME, "sec29-eje-observar");\',',
  '      "    const copied = await copyToClipboard(row.caseNumber);",',
  '      "",',
  '      "    if (popup && !popup.closed) popup.focus();",',
  '      "",',
  '      "    if (!popup) {",',
  '      "      setEjeNotice(copied",',
  '      "        ? `Expediente ${row.caseNumber} copiado. El navegador bloqueó la pestaña de EJE; abrila y pegalo en el buscador.`",',
  '      "        : `No fue posible abrir EJE ni copiar automáticamente. Copiá el expediente ${row.caseNumber}.`);",',
  '      "    } else {",',
  '      "      setEjeNotice(copied",',
  '      "        ? `Expediente ${row.caseNumber} copiado. Pegalo en el buscador de EJE y presioná Enter.`",',
  '      "        : `EJE quedó abierto. Copiá manualmente el expediente ${row.caseNumber} y pegalo en el buscador.`);",',
  '      "    }",',
  '      "",',
  '      "    setOpeningCase(null);",',
  '      "  };",',
  '      "",',
].join("\n") + "\n";

if (source.includes(legacyStart)) {
  const start = source.indexOf(legacyStart);
  const end = source.indexOf(exportStart, start);

  if (end < 0) {
    console.error("No se encontró el cierre del bloque de apertura de EJE.");
    process.exit(1);
  }

  source = source.slice(0, start) + simplifiedObservationBlock + source.slice(end);
  changed = true;
  console.log("La acción Observar fue simplificada: copia el expediente y abre EJE.");
} else if (source.includes(simplifiedStart)) {
  console.log("La acción Observar ya usa el flujo simplificado.");
} else {
  console.error("No se encontró el bloque de la acción Observar en vite.config.ts.");
  process.exit(1);
}

const analysisMarker = "function patchAnalysisV2(source: string)";
const workflowMarker = "function sec29ObservationWorkflow(): Plugin";
const analysisFunction = String.raw`
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
`;

if (!source.includes(analysisMarker)) {
  const insertionPoint = source.indexOf(workflowMarker);
  if (insertionPoint < 0) {
    console.error("No se encontró el punto de inserción del analizador v2.");
    process.exit(1);
  }
  source = source.slice(0, insertionPoint) + analysisFunction + "\n" + source.slice(insertionPoint);
  changed = true;
  console.log("Analizador v2 incorporado al flujo de compilación.");
}

const legacyTransform = "return { code: patchCedulasApp(source), map: null };";
const analysisTransform = "return { code: patchAnalysisV2(patchCedulasApp(source)), map: null };";

if (source.includes(legacyTransform)) {
  source = source.replace(legacyTransform, analysisTransform);
  changed = true;
  console.log("El analizador v2 quedó enlazado después del flujo Observar.");
} else if (!source.includes(analysisTransform)) {
  console.error("No se encontró la transformación principal de CedulasApp.");
  process.exit(1);
}

if (changed) {
  await writeFile(path, source, "utf8");
}
