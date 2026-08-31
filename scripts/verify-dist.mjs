import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist");
const chunks = [];

async function collect(directory) {
  for (const name of await readdir(directory)) {
    const absolute = path.join(directory, name);
    const info = await stat(absolute);
    if (info.isDirectory()) {
      await collect(absolute);
      continue;
    }
    if (/\.(?:html|css|js|mjs)$/i.test(name)) {
      chunks.push(await readFile(absolute, "utf8"));
    }
  }
}

await collect(root);
const bundle = chunks.join("\n");

const required = [
  "Observar",
  "eje-observe-button",
  "caseNumber",
  "Expediente",
  "copiado",
  "Pegalo en el buscador de EJE",
  "sec29-eje-observar",
  "v1.2",
  "evidencia operativa y detección por cláusulas",
  "La actuación dispone observar esta cédula",
  "Se comprobó el código de cédula",
  "Actuaciones y vencimientos",
  "Creador de actuaciones en lote",
  "Creador de Lotes - Actuaciones",
  "Creador de Lotes - Cédulas",
  "Confronte de Liquidaciones EJF",
  "Sistema de Actuaciones Judiciales",
  "biblioteca-judicial-inteligente.arielmarcelogomez7.chatgpt.site",
  "#lotes-actuaciones",
];

const forbidden = [
  "resolveEjeExpId",
  "/iol-api/api/public/expedientes/lista",
  "/iol-api/api/public/expedientes/ficha",
  "abierto directamente en Actuaciones de EJE",
];

const missing = required.filter((token) => !bundle.includes(token));
const presentForbidden = forbidden.filter((token) => bundle.includes(token));

if (missing.length || presentForbidden.length) {
  if (missing.length) {
    console.error(`La compilación no contiene: ${missing.join(", ")}`);
  }
  if (presentForbidden.length) {
    console.error(`La compilación conserva lógica que debía eliminarse: ${presentForbidden.join(", ")}`);
  }
  process.exit(1);
}

console.log("Compilación verificada: análisis v1.2, evidencia operativa y acceso unificado IA JUDICIAL.");
