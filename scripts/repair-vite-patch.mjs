import { readFile, writeFile } from "node:fs/promises";

const path = "vite.config.ts";
const source = await readFile(path, "utf8");
const broken = 'if (!/[\\\\/]src[\\\\/]CedulasApp\\\\.tsx$/.test(id)) return null;';
const fixed = 'if (!/[\\\\/]src[\\\\/]CedulasApp\\.tsx(?:\\?.*)?$/.test(id)) return null;';

if (source.includes(fixed)) {
  console.log("El selector del módulo CedulasApp ya está corregido.");
} else if (source.includes(broken)) {
  await writeFile(path, source.replace(broken, fixed), "utf8");
  console.log("Selector del módulo CedulasApp corregido antes de compilar.");
} else {
  console.error("No se encontró el selector esperado en vite.config.ts.");
  process.exit(1);
}
