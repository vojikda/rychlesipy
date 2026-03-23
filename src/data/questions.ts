import raw from "./otazky.tsv?raw";
import { parseQuestionsFile, type Question } from "./parseQuestionsFile";

export type { Question };
export const questions = parseQuestionsFile(raw);
