#!/usr/bin/env node
/**
 * Převod Excelu (.xlsx) na src/data/otazky.tsv
 * Sloupce: A = otázka, B = možnosti (A)…; B)…; …), C = správná odpověď (text jako u jedné možnosti).
 *
 * Použití: npm run import-quiz -- /cesta/k/souboru.xlsx
 * Výchozí výstup: src/data/otazky.tsv
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "src", "data", "otazky.tsv");

const input = process.argv[2];
if (!input) {
  console.error("Použití: npm run import-quiz -- <soubor.xlsx>");
  process.exit(1);
}

const abs = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
if (!fs.existsSync(abs)) {
  console.error("Soubor neexistuje:", abs);
  process.exit(1);
}

const wb = XLSX.readFile(abs);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

const prefixRe = /^[A-Da-d]\)\s*/;

function cellStr(v) {
  if (v == null) return "";
  return String(v).replace(/\r\n/g, "\n").trim();
}

function splitOptions(raw) {
  const s = cellStr(raw);
  if (!s) return [];
  return s
    .split(";")
    .map((p) => p.trim().replace(prefixRe, "").trim())
    .filter(Boolean);
}

function escTsv(s) {
  return cellStr(s).replace(/\t/g, " ").replace(/\r?\n/g, " ");
}

const lines = [
  "# Vygenerováno z Excelu – sloupce: Otázka, Možnosti (oddělené ;), Správná odpověď",
  "Otázka\tMožnosti\tSprávná",
];

let count = 0;
for (const row of rows) {
  const q = cellStr(row[0]);
  const optsRaw = row[1];
  const correct = cellStr(row[2]);
  if (!q || !optsRaw || !correct) continue;
  if (/otázka/i.test(q) && q.length < 35) continue;

  const options = splitOptions(optsRaw);
  if (options.length < 2) continue;

  lines.push(`${escTsv(q)}\t${options.map(escTsv).join(";")}\t${escTsv(correct)}`);
  count++;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log("Zapsáno", count, "otázek →", path.relative(root, outPath));
