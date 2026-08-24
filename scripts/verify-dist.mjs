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
  "v1.1",
];

const missing = required.filter((token) => !bundle.includes(token));
if (missing.length) {
  console.error(`La compilación no contiene: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Compilación verificada: la acción Observar y la versión 1.1 están incluidas.");
