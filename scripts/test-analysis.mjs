import assert from "node:assert/strict";
import { analyzePageV2, analyzeTextsV2 } from "../src/cedulaAnalysis.ts";

const remitCodes = Array.from({ length: 19 }, (_, index) => `${700000 + index}/2026`);
const observedPairs = Array.from({ length: 6 }, (_, index) => [
  `${800000 + index}/2026`,
  `${900000 + index}/2025`,
]);

const pages = remitCodes.map((code, index) => `
2026 - Encabezado institucional
JUZGADO DE PRUEBA
Número: EXP ${100000 + index}/2026-0
Actuación Nro: ${1900000 + index}/2026
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº ${code}.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.
`);

observedPairs.forEach(([code, citedAct], index) => {
  pages.push(`
2026 - Encabezado institucional
JUZGADO DE PRUEBA
Número: EXP ${200000 + index}/2026-0
Actuación Nro: ${1950000 + index}/2026
Ciudad Autónoma de Buenos Aires.
Obsérvese la cédula${index === 3 ? " ley 22.172" : ""} nº ${code} ingresada a través del “Portal del Litigante”, por poseer errores en su confección.
Ello, dado que se ha omitido transcribir de forma completa la actuación nº ${citedAct}.
`);
});

pages.push(`
2026 - Encabezado institucional
Número: EXP 34690/2026-0
Actuación Nro: 1948675/2026
Ciudad Autónoma de Buenos Aires.
Agréguese la contestación de oficio, téngase presente y hágase saber.
`);

const result = analyzeTextsV2(pages);
const included = result.rows.filter((row) => row.outcome === "include");
const observed = result.rows.filter((row) => row.observed);

assert.equal(included.length, 19, "debe detectar todas las remisiones inequívocas");
assert.equal(observed.length, 6, "debe detectar todas las cédulas observadas");
assert.equal(result.rows.length, 25, "no debe convertir expediente o actuación en cédula");
assert.equal(result.rows.filter((row) => row.outcome === "review").length, 0);

for (const [code, citedAct] of observedPairs) {
  assert.ok(result.rows.some((row) => row.code === code && row.observed));
  assert.ok(!result.rows.some((row) => row.code === citedAct));
}

assert.ok(result.rows.every((row) => !row.evidence.startsWith("2026 - Encabezado institucional")));
assert.ok(included.every((row) => row.evidence.startsWith("Se hace saber")));
assert.ok(observed.every((row) => row.evidence.startsWith("Obsérvese")));
assert.ok(included.every((row) => row.evidence.includes("En consecuencia")));

const mixed = analyzePageV2(`
Número: EXP 12463/2020-0.
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar las cédulas presentadas a través del Portal del Litigante bajo los códigos nº 610001/2026 y nº 610002/2026.
En consecuencia, remítase digitalmente la pieza nº 610001/2026 a la Oficina de Notificaciones del fuero para su respectivo diligenciamiento y obsérvese la cédula ingresada bajo el código nº 610002/2026 —de idéntico contenido—.
`, 1);

assert.equal(mixed.rows.find((row) => row.code === "610001/2026")?.outcome, "include");
assert.equal(mixed.rows.find((row) => row.code === "610002/2026")?.outcome, "exclude");

const irrelevant = analyzePageV2(`
Número: EXP 12345/2026-0
Actuación Nro: 1999999/2026
Ciudad Autónoma de Buenos Aires.
Agréguese y téngase presente.
`, 1);
assert.deepEqual(irrelevant.rows, []);

console.log("Analizador v2 verificado: 19 remisiones, 6 observaciones y evidencia operativa.");
