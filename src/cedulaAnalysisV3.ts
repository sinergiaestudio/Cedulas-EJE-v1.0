export type Outcome = "include" | "exclude" | "review";

export type AnalysisRow = {
  id: string;
  code: string;
  page: number;
  outcome: Outcome;
  reason: string;
  evidence: string;
  selected: boolean;
  caseNumber: string;
  observed: boolean;
  manual?: boolean;
};

export type PageAudit = {
  page: number;
  status: "valid" | "ignored" | "review";
  title: string;
  detail: string;
  codes: string[];
};

export type PageAnalysis = {
  rows: AnalysisRow[];
  audit: PageAudit;
};

const CODE_PATTERN = /\b\d{4,9}\s*\/\s*20\d{2}\b/g;
const CASE_PATTERN = /\bnumero\s*:\s*(?:exp\s*)?(\d{1,12}\s*\/\s*20\d{2}\s*-\s*[a-z0-9]+)\b/i;
const FALLBACK_CASE_PATTERN = /\bexp\s*:?\s*(\d{1,12}\s*\/\s*20\d{2}\s*-\s*[a-z0-9]+)\b/i;
const OBSERVATION_PATTERN = /\bobserv(?:e|ese|ense)\b/g;
const REMITTANCE_PATTERN = /\bremit(?:a|an)?se\b[\s\S]{0,64}?\bdigitalmente\b/;
const REASON_BOUNDARY_PATTERN =
  /\bpor\s+(?:poseer|omitir|carecer|contener|haber|no|ser|resultar|advertirse|encontrarse)\b|\bello\s*,?\s*(?:atento|dado)\b|\bdado\s+que\b|\btoda\s+vez\s+que\b|\batento\s+a\s+que\b|\bdebido\s+a\b|\bpuesto\s+que\b/;

export function normalizeAnalysisText(value: string) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”«»]/g, '"')
    .replace(/[\u00ad\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function normalizeCode(value: string) {
  return value.replace(/\s/g, "");
}

export function extractCodesV2(value: string) {
  const matches = String(value ?? "").match(CODE_PATTERN) ?? [];
  return unique(matches.map(normalizeCode));
}

export function extractCaseNumberV2(value: string) {
  const normalized = normalizeAnalysisText(value);
  const match = normalized.match(CASE_PATTERN) ?? normalized.match(FALLBACK_CASE_PATTERN);
  return normalizeCode(match?.[1] ?? "");
}

function compactPhrase(value: string) {
  return normalizeAnalysisText(value).replace(/[^a-z0-9]/g, "");
}

function cleanedLines(value: string) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function operativeBody(value: string) {
  const lines = cleanedLines(value);
  let start = lines.findIndex((line) => {
    const normalized = normalizeAnalysisText(line);
    return normalized.startsWith("ciudad autonoma de buenos aires")
      || normalized.startsWith("nota:");
  });

  if (start < 0) {
    start = lines.findIndex((line) => {
      const normalized = normalizeAnalysisText(line);
      return normalized.includes("se hace saber que se ha procedido a confrontar")
        || normalized.includes("tengase por confrontad")
        || /\bobserv(?:e|ese|ense)\s+la\s+cedula/.test(normalized)
        || normalized.includes("en consecuencia");
    });
  }

  return lines.slice(start >= 0 ? start : 0).join(" ");
}

function trimEvidence(value: string, maxLength = 720) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const clipped = clean.slice(0, maxLength);
  const lastBoundary = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("; "),
    clipped.lastIndexOf(", "),
  );
  const end = lastBoundary > maxLength * 0.68 ? lastBoundary + 1 : maxLength;
  return `${clipped.slice(0, end).trim()}…`;
}

function evidenceFrom(
  value: string,
  kind: "include" | "observe" | "law" | "review",
  code: string,
) {
  const body = operativeBody(value);
  const patterns = kind === "include"
    ? [
        /se hace saber que se ha procedido a confrontar/i,
        /en consecuencia/i,
        /rem[ií]t(?:a|an)?se/i,
      ]
    : kind === "observe"
      ? [
          /obs[eé]rv(?:e|ese|ense)\s+la\s+c[eé]dula/i,
          /obs[eé]rv(?:e|ese|ense)/i,
        ]
      : kind === "law"
        ? [
            /t[eé]ngase\s+por\s+confrontad[ao]s?/i,
            /c[eé]dula\s+ley\s*22\s*\.?\s*172/i,
          ]
        : [
            new RegExp(code.replace("/", "\\/")),
            /se hace saber/i,
            /en consecuencia/i,
          ];

  let start = -1;
  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match?.index !== undefined) {
      start = match.index;
      break;
    }
  }

  if (start < 0) start = 0;
  return trimEvidence(body.slice(start));
}

function findConfrontationSegment(normalizedBody: string) {
  const confrontationMatch = normalizedBody.match(
    /procedido\s+a\s+confrontar|tengase\s+por\s+confrontad[ao]s?/,
  );
  if (!confrontationMatch || confrontationMatch.index === undefined) return "";

  const start = confrontationMatch.index;
  const consequence = normalizedBody.indexOf("en consecuencia", start);
  const segment = normalizedBody.slice(start, consequence >= 0 ? consequence : normalizedBody.length);

  // "Confrontar" también se usa para oficios y otras piezas. Solo pertenece
  // a este circuito cuando la propia cláusula identifica una cédula.
  return /\bcedula(?:s)?\b/.test(segment) ? segment : "";
}

function findRemittanceSegment(normalizedBody: string) {
  const match = normalizedBody.match(REMITTANCE_PATTERN);
  if (!match || match.index === undefined) return "";

  const start = match.index;
  const after = normalizedBody.slice(start + match[0].length);
  const observedAfter = after.search(/\bobserv(?:e|ese|ense)\b/);
  const end = observedAfter >= 0
    ? start + match[0].length + observedAfter
    : normalizedBody.length;

  return normalizedBody.slice(start, end);
}

function firstCodeEnd(value: string) {
  const match = value.match(CODE_PATTERN);
  if (!match?.length) return -1;
  const code = match[0];
  const index = value.indexOf(code);
  return index < 0 ? -1 : index + code.length;
}

/**
 * Aísla únicamente las numeraciones vinculadas con el mandato "Obsérvese".
 *
 * La cláusula se corta antes de:
 * - una remisión posterior dentro de una providencia mixta;
 * - la motivación del defecto ("por poseer", "por omitir", "Ello...", etc.);
 * - otra orden de observación.
 *
 * De esta manera no se confunden las actuaciones citadas como fundamento con
 * la cédula que efectivamente debe observarse.
 */
export function extractObservedCodesV3(normalizedBody: string) {
  const results: string[] = [];
  const starts = Array.from(normalizedBody.matchAll(OBSERVATION_PATTERN));

  starts.forEach((match, index) => {
    const start = match.index ?? 0;
    const nextObservation = starts[index + 1]?.index ?? normalizedBody.length;
    let segment = normalizedBody.slice(start, nextObservation);

    const remittanceBoundary = segment.search(/\bremit(?:a|an)?se\b/);
    if (remittanceBoundary >= 0) {
      segment = segment.slice(0, remittanceBoundary);
    }

    const cedulaStart = segment.search(/\bcedula(?:s)?\b/);
    if (cedulaStart < 0) return;

    let actionClause = segment.slice(cedulaStart);
    const firstEnd = firstCodeEnd(actionClause);
    if (firstEnd < 0) return;

    const afterFirstCode = actionClause.slice(firstEnd);
    const reasonBoundary = afterFirstCode.search(REASON_BOUNDARY_PATTERN);
    if (reasonBoundary >= 0) {
      actionClause = actionClause.slice(0, firstEnd + reasonBoundary);
    }

    results.push(...extractCodesV2(actionClause));
  });

  return unique(results);
}

function positiveRemittance(normalizedBody: string) {
  const compact = compactPhrase(normalizedBody);
  const hasVerb = compact.includes("remitasedigitalmente")
    || compact.includes("remitansedigitalmente")
    || REMITTANCE_PATTERN.test(normalizedBody);
  const hasOffice = compact.includes("oficinadenotificacionesdelfuero");
  const hasDiligenciamiento = compact.includes("diligenciamiento");
  return hasVerb && hasOffice && hasDiligenciamiento;
}

function genericPluralRemittance(normalizedBody: string, remittanceSegment: string) {
  const compact = compactPhrase(remittanceSegment || normalizedBody);
  return compact.includes("remitansedigitalmente")
    || compact.includes("precitadaspiezas")
    || compact.includes("respectivosdiligenciamientos");
}

export function analyzePageV2(text: string, page: number): PageAnalysis {
  const body = operativeBody(text);
  const normalizedBody = normalizeAnalysisText(body || text);
  const caseNumber = extractCaseNumberV2(text);
  const confrontationSegment = findConfrontationSegment(normalizedBody);
  let confronted = extractCodesV2(confrontationSegment);
  const observed = extractObservedCodesV3(normalizedBody);
  const remittanceSegment = findRemittanceSegment(normalizedBody);
  const explicitlyRemitted = extractCodesV2(remittanceSegment);
  const positiveClause = positiveRemittance(normalizedBody);
  const isLey22172 = /ley\s*(?:n(?:ro|o)?\.?\s*)?22\s*\.?\s*172/.test(normalizedBody);
  const genericPlural = genericPluralRemittance(normalizedBody, remittanceSegment);

  if (positiveClause && !confronted.length) {
    const consequenceStart = normalizedBody.indexOf("en consecuencia");
    const preConsequence = consequenceStart >= 0
      ? normalizedBody.slice(0, consequenceStart)
      : normalizedBody;
    confronted = extractCodesV2(preConsequence);
  }

  let included: string[] = [];
  let unresolved: string[] = [];

  if (positiveClause && explicitlyRemitted.length) {
    included = explicitlyRemitted.filter((code) => !observed.includes(code));
  } else if (positiveClause && confronted.length === 1) {
    included = confronted.filter((code) => !observed.includes(code));
  } else if (positiveClause && confronted.length > 1 && genericPlural) {
    included = confronted.filter((code) => !observed.includes(code));
  } else if (positiveClause && confronted.length > 1) {
    unresolved = confronted.filter((code) => !observed.includes(code));
  }

  const allCandidates = unique([...confronted, ...explicitlyRemitted, ...observed]);
  const relevantButUnreadable = positiveClause
    || Boolean(confrontationSegment)
    || /\bobserv(?:e|ese|ense)\b/.test(normalizedBody);

  if (!allCandidates.length) {
    return {
      rows: [],
      audit: {
        page,
        status: relevantButUnreadable ? "review" : "ignored",
        title: relevantButUnreadable
          ? "Actuación relevante sin código de cédula legible"
          : "Página sin remisión pertinente",
        detail: relevantButUnreadable
          ? "La redacción corresponde al circuito de cédulas, pero no fue posible aislar una numeración vinculada con seguridad."
          : "No se detectó una cláusula de confronte, remisión u observación de cédula.",
        codes: [],
      },
    };
  }

  const rows = allCandidates.map<AnalysisRow>((code, codeIndex) => {
    const isIncluded = included.includes(code);
    const isObserved = observed.includes(code);
    let outcome: Outcome;
    let reason: string;
    let evidenceKind: "include" | "observe" | "law" | "review";

    if (isIncluded && isObserved) {
      outcome = "review";
      reason = "La misma numeración aparece remitida y observada; requiere control humano.";
      evidenceKind = "review";
    } else if (isIncluded && positiveClause) {
      outcome = "include";
      reason = explicitlyRemitted.includes(code)
        ? "La numeración está asignada expresamente a la remisión a la Oficina de Notificaciones."
        : "La actuación remite la pieza —o todas las piezas— a la Oficina de Notificaciones.";
      evidenceKind = "include";
    } else if (isObserved) {
      outcome = "exclude";
      reason = "La actuación dispone observar esta cédula.";
      evidenceKind = "observe";
    } else if (isLey22172) {
      outcome = "exclude";
      reason = "Cédula Ley 22.172: no corresponde remitirla a la Oficina de Notificaciones del fuero.";
      evidenceKind = "law";
    } else if (unresolved.includes(code)) {
      outcome = "review";
      reason = "Hay varias cédulas y la redacción no permite asignar con certeza cuál se remite.";
      evidenceKind = "review";
    } else if (!positiveClause) {
      outcome = "review";
      reason = "Se detectó una numeración vinculada con una cédula, pero no una orden inequívoca de remisión u observación.";
      evidenceKind = "review";
    } else {
      outcome = "review";
      reason = "La relación entre la numeración y la cláusula de remisión no es inequívoca.";
      evidenceKind = "review";
    }

    return {
      id: `p${page}-${code}-${codeIndex}`,
      code,
      page,
      outcome,
      reason,
      evidence: evidenceFrom(text, evidenceKind, code),
      selected: outcome === "include",
      caseNumber,
      observed: isObserved,
    };
  });

  const includedCount = rows.filter((row) => row.outcome === "include").length;
  const reviewCount = rows.filter((row) => row.outcome === "review").length;
  const observedCount = rows.filter((row) => row.observed).length;

  return {
    rows,
    audit: {
      page,
      status: reviewCount ? "review" : includedCount ? "valid" : "ignored",
      title: reviewCount
        ? "Requiere revisión"
        : includedCount
          ? `${includedCount} cédula${includedCount === 1 ? "" : "s"} para remitir`
          : observedCount
            ? `${observedCount} cédula${observedCount === 1 ? "" : "s"} observada${observedCount === 1 ? "" : "s"}`
            : isLey22172
              ? "Cédula Ley 22.172 no remitida"
              : "Sin remisión pertinente",
      detail: includedCount
        ? "Se comprobó el código de cédula y la fórmula de remisión a la Oficina de Notificaciones."
        : observedCount
          ? "Se aisló únicamente la numeración de la cédula observada; las actuaciones citadas como fundamento no se listan como cédulas."
          : reviewCount
            ? "La página requiere una decisión humana antes de incorporarla al listado."
            : "No corresponde incorporar esta numeración al listado para remitir.",
      codes: allCandidates,
    },
  };
}

export function analyzeTextsV2(pages: string[]) {
  const rows: AnalysisRow[] = [];
  const audits: PageAudit[] = [];
  const alreadyIncluded = new Map<string, number>();

  pages.forEach((text, pageIndex) => {
    const result = analyzePageV2(text, pageIndex + 1);
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
