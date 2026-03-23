export type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseSemicolonCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ";") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

const OPTION_LETTER_PREFIX = /^[A-Da-d]\)\s*/;

function cleanOptionLabel(s: string): string {
  return s.trim().replace(OPTION_LETTER_PREFIX, "").trim();
}

function splitOptions(cell: string): string[] {
  const t = cell.replace(/^"|"$/g, "").trim();
  let parts: string[];
  if (t.includes("|")) {
    parts = t.split("|").map((s) => s.trim()).filter(Boolean);
  } else if (t.includes(";")) {
    parts = t.split(";").map((s) => s.trim()).filter(Boolean);
  } else {
    parts = t.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return parts.map(cleanOptionLabel).filter(Boolean);
}

function parseLine(line: string): { text: string; options: string[]; correct: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  let colQ: string;
  let colOpts: string;
  let colCorrect: string;

  if (trimmed.includes("\t")) {
    const parts = trimmed.split("\t");
    if (parts.length < 3) return null;
    colQ = parts[0].trim();
    colOpts = parts.slice(1, -1).join("\t").trim();
    colCorrect = parts[parts.length - 1].trim();
  } else {
    const parts = parseSemicolonCsvLine(trimmed);
    if (parts.length < 3) return null;
    colQ = parts[0].replace(/^"|"$/g, "").trim();
    colOpts = parts[1];
    colCorrect = parts[parts.length - 1].replace(/^"|"$/g, "").trim();
  }

  if (!colQ || !colCorrect) return null;

  const options = splitOptions(colOpts);
  if (options.length < 2) return null;

  return { text: colQ, options, correct: colCorrect };
}

function isHeaderLine(line: string): boolean {
  const lower = line.toLowerCase();
  return lower.includes("otázka") && (lower.includes("možn") || lower.includes("odpov"));
}

export function parseQuestionsFile(raw: string): Question[] {
  const text = raw.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  const out: Question[] = [];
  let row = 0;

  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    if (isHeaderLine(line)) continue;
    const parsed = parseLine(line);
    if (!parsed) continue;

    const correctNorm = normalize(parsed.correct);
    let correctIndex = parsed.options.findIndex((o) => normalize(o) === correctNorm);
    if (correctIndex < 0) {
      correctIndex = parsed.options.findIndex(
        (o) => normalize(o).includes(correctNorm) || correctNorm.includes(normalize(o))
      );
    }
    if (correctIndex < 0) {
      console.warn("[kvíz] Bez shody správné odpovědi:", parsed.text.slice(0, 70));
      continue;
    }

    row += 1;
    out.push({
      id: String(row),
      text: parsed.text,
      options: parsed.options,
      correctIndex,
    });
  }

  return out;
}
