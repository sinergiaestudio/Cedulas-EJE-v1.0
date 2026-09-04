import assert from "node:assert/strict";
import { analyzePageV2, analyzeTextsV2 } from "../src/cedulaAnalysisV3.ts";

// Regresión basada en el PDF real de 15 páginas usado para entrenar el Remitidor.
// Resultado esperado: 9 cédulas para remitir, 6 para observar, 0 a revisar
// y 1 página ajena correspondiente a un oficio.
const pages = [
`2026 - Año del 30° Aniversario
Número: EXP 259712/2025-0
Actuación Nro: 2029652/2026
Ciudad Autónoma de Buenos Aires.
Obsérvese la cédula Ley nº 22.172 presentada a través del “Portal del Litigante” bajo el código nº 581543/2026, por poseer errores en su confección.
Ello, atento a que se omitió acompañar a la misma copia de la presentación obrante en la actuación nº 1592335/2026.`,
`Número: EXP 316892/2025-0
Actuación Nro: 2029430/2026
Ciudad Autónoma de Buenos Aires.
Obsérvese la cédula presentada a través del “Portal del Litigante” bajo el código nº 581584/2026, por poseer errores en su confección.
Ello, atento a que se omitió acompañar a la misma copia de la presentación obrante en la actuación nº 1429113/2026.`,
`Número: EXP 160230/2023-0
Actuación Nro: 2028442/2026
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar el oficio presentado y el mismo se encuentra en condiciones de ser diligenciado.`,
`Número: EXP 263551/2025-0
Actuación Nro: 2014566/2026
Ciudad Autónoma de Buenos Aires.
Obsérvese la cédula ley 22.172 nº 579532/2026 ingresada a través del “Portal del Litigante”, por poseer errores en su confección. Ello, dado que se ha omitido adjuntar la actuación nº 606463/2026 (cfr. lo ordenado en la actuación nº 612259/2026).`,
`Número: EXP 257320/2025-0
Actuación Nro: 2010754/2026
Ciudad Autónoma de Buenos Aires.
Obsérvese la cédula nº 578085/2026 ingresada a través del “Portal del Litigante”, por poseer errores en su confección.
Ello, dado que se ha omitido transcribir de forma completa la actuación nº 2550547/2025.`,
`Número: EXP 76702/2020-0
Actuación Nro: 2010706/2026
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 574281/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 92014/2026-0
Actuación Nro: 2010579/2026
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 577683/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 216282/2024-0
Actuación Nro: 2010566/2026
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 576648/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 202850/2025-0
Actuación Nro: 1998849/2026
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar las cédulas presentadas a través del “Portal del Litigante” bajo los códigos nº 575112/2026 y nº 575114/2026.
En consecuencia, obsérvese la cedula ingresada bajo el código nº 575112/2026 por omitir indicar que la pieza debe notificarse bajo responsabilidad de la parte actora y remítase digitalmente la pieza n° 575114/2026 a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 176550/2024-0
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 574964/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 210331/2026-0
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 574938/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 76261/2022-0
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 574591/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 44464/2019-0
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 573860/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 309274/2022-0
Ciudad Autónoma de Buenos Aires.
Se hace saber que se ha procedido a confrontar la cédula presentada a través del “Portal del Litigante” bajo el código nº 573539/2026.
En consecuencia, remítase digitalmente la precitada pieza a la “Oficina de Notificaciones del fuero” para su respectivo diligenciamiento.`,
`Número: EXP 10374/2016-0
Actuación Nro: 1991244/2026
Ciudad Autónoma de Buenos Aires.
Obsérvese la cédula nº 572664/2026 ingresada a través del “Portal del Litigante”, por poseer errores en su confección. Ello, dado que se ha omitido transcribir de forma completa la actuación de páginas 12/13 del expediente papel digitalizado.`
];

const expectedRemit = [
  "574281/2026",
  "577683/2026",
  "576648/2026",
  "575114/2026",
  "574964/2026",
  "574938/2026",
  "574591/2026",
  "573860/2026",
  "573539/2026",
];

const expectedObserve = [
  "581543/2026",
  "581584/2026",
  "579532/2026",
  "578085/2026",
  "575112/2026",
  "572664/2026",
];

const result = analyzeTextsV2(pages);
const remit = result.rows.filter((row) => row.outcome === "include");
const observed = result.rows.filter((row) => row.observed);

assert.deepEqual(remit.map((row) => row.code), expectedRemit);
assert.deepEqual(observed.map((row) => row.code), expectedObserve);
assert.equal(remit.length, 9);
assert.equal(observed.length, 6);
assert.equal(result.rows.length, 15);
assert.equal(result.rows.filter((row) => row.outcome === "review").length, 0);
assert.equal(result.audits.filter((audit) => audit.status === "ignored" && !audit.codes.length).length, 1);

const forbidden = [
  "1592335/2026",
  "1429113/2026",
  "606463/2026",
  "612259/2026",
  "2550547/2025",
  "2028442/2026",
];

for (const code of forbidden) {
  assert.ok(!result.rows.some((row) => row.code === code), `${code} no debe tratarse como cédula`);
}

assert.ok(observed.every((row) => /obs[eé]rvese/i.test(row.evidence.slice(0, 40))));
assert.ok(remit.every((row) => row.evidence.includes("remítase digitalmente")));
assert.equal(result.rows.find((row) => row.code === "575112/2026")?.caseNumber, "202850/2025-0");
assert.equal(result.rows.find((row) => row.code === "575114/2026")?.outcome, "include");

const plural = analyzePageV2(`
Número: EXP 1/2026-0
Ciudad Autónoma de Buenos Aires.
Obsérvense las cédulas n° 600001/2026 y n° 600002/2026 por contener errores.
`, 1);
assert.deepEqual(plural.rows.filter((row) => row.observed).map((row) => row.code), [
  "600001/2026",
  "600002/2026",
]);

console.log("Regresión real verificada: 9 cédulas para remitir, 6 para observar y 1 página ajena.");
