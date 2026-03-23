import { useCallback, useMemo, useState } from "react";
import { questions, type Question } from "./data/questions";
import { getResultTitle, pickScoreQuip } from "./quizFlavor";
import { playQuizSound } from "./quizSounds";
import "./App.css";

type Phase = "welcome" | "quiz" | "result";

const QUESTIONS_PER_ROUND = 20;
const SOUND_STORAGE_KEY = "rychlesipy-sound";

/** Náhodně zamíchá a vrátí nejvýše `count` otázek. */
function pickRoundQuestions(all: Question[], count: number): Question[] {
  const copy = [...all];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

function readSoundPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [guessInput, setGuessInput] = useState("");
  const [scorePrediction, setScorePrediction] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(readSoundPreference);

  const poolSize = questions.length;
  const roundSize = Math.min(QUESTIONS_PER_ROUND, poolSize);
  const total = roundQuestions.length;
  const current = roundQuestions[index];
  const progress = useMemo(
    () => (total ? ((index + (answered ? 1 : 0)) / total) * 100 : 0),
    [index, answered, total]
  );

  const scoreQuip = useMemo(() => pickScoreQuip(score), [score]);
  const resultTitle = useMemo(() => getResultTitle(score, total), [score, total]);

  const goWelcome = useCallback(() => {
    setPhase("welcome");
    setRoundQuestions([]);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setGuessInput("");
    setScorePrediction(null);
  }, []);

  const start = useCallback(() => {
    const raw = guessInput.trim();
    const n = parseInt(raw, 10);
    setScorePrediction(raw === "" || !Number.isFinite(n) ? null : n);

    setRoundQuestions(pickRoundQuestions(questions, QUESTIONS_PER_ROUND));
    setPhase("quiz");
    setIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  }, [guessInput]);

  const pick = useCallback(
    (optionIndex: number) => {
      if (answered || !current) return;
      setSelected(optionIndex);
      setAnswered(true);
      if (optionIndex === current.correctIndex) {
        setScore((s) => s + 1);
        playQuizSound("correct", soundEnabled);
      } else {
        setScore((s) => s - 1);
        playQuizSound("wrong", soundEnabled);
      }
    },
    [answered, current, soundEnabled]
  );

  const next = useCallback(() => {
    if (index + 1 >= total) {
      setPhase("result");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }, [index, total]);

  const setSoundOn = useCallback((on: boolean) => {
    setSoundEnabled(on);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  if (poolSize === 0) {
    return (
      <div className="app">
        <div className="card">
          <span className="badge">Kvíz</span>
          <h1>Žádné otázky</h1>
          <p className="lead">
            Doplň <code className="inline-code">src/data/otazky.tsv</code> nebo importuj Excel:{" "}
            <code className="inline-code">npm run import-quiz -- tvuj-soubor.xlsx</code>
          </p>
        </div>
      </div>
    );
  }

  const lastWasCorrect = answered && selected === current?.correctIndex;

  const predictionHint =
    scorePrediction === null ? null : score === scorePrediction ? (
      <span className="prediction-hit">Trefa – sedí to přesně na bod!</span>
    ) : score > scorePrediction ? (
      <span className="prediction-beat">Ještě líp než jsi čekal – máš o {score - scorePrediction} bodů víc.</span>
    ) : (
      <span className="prediction-miss">
        Nakonec o {scorePrediction - score} bodů méně než v odhadu – příště to sedne.
      </span>
    );

  return (
    <div className="app">
      <div className="card">
        {phase === "welcome" && (
          <>
            <span className="badge">Kvíz</span>
            <h1>Vítej u kvízu</h1>
            <p className="lead">
              V databázi je <strong>{poolSize}</strong> otázek; v jednom kole uvidíš <strong>{roundSize}</strong>{" "}
              náhodně vybraných. Začínáš na <strong>0 bodech</strong>: za správnou odpověď <strong>+1 bod</strong>, za
              špatnou <strong>−1 bod</strong> (skóre může jít i do mínusu).
            </p>
            <div className="welcome-field">
              <label className="field-label" htmlFor="guess-score">
                Tvůj odhad bodů na konci kola
              </label>
              <input
                id="guess-score"
                className="guess-input"
                type="number"
                inputMode="numeric"
                placeholder={`např. 5 (rozsah cca −${roundSize} až +${roundSize})`}
                min={-roundSize}
                max={roundSize}
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
              />
              <p className="field-hint">Volitelné – když nevyplníš, na konci se odhad neukáže.</p>
            </div>
            <label className="sound-row">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundOn(e.target.checked)}
              />
              <span>Zvuky při správné / špatné odpovědi</span>
            </label>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={start}>
                Začít
              </button>
            </div>
          </>
        )}

        {phase === "quiz" && current && (
          <>
            <div className="score-pill" aria-live="polite">
              <span className="label">Body</span>
              <span>{score}</span>
            </div>
            <p className="score-quip" aria-live="polite">
              {scoreQuip}
            </p>
            <div className="progress-wrap">
              <div className="progress-label">
                <span>
                  Otázka {index + 1} z {total}
                </span>
              </div>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={index + 1}
                aria-valuemin={1}
                aria-valuemax={total}
              >
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <p className="question-text">{current.text}</p>
            <div className="options" role="list">
              {current.options.map((label, i) => {
                const isCorrect = i === current.correctIndex;
                const isWrongPick = answered && selected === i && !isCorrect;
                const classes = [
                  "option",
                  answered && isCorrect ? "correct" : "",
                  isWrongPick ? "incorrect" : "",
                  answered && selected !== i && !isCorrect ? "dim" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={i}
                    type="button"
                    className={classes}
                    disabled={answered}
                    onClick={() => pick(i)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {answered && (
              <>
                <p className={`feedback ${lastWasCorrect ? "good" : "bad"}`}>
                  {lastWasCorrect ? "+1 bod — správně." : "−1 bod — špatně."}
                </p>
                <div className="actions">
                  <button type="button" className="btn btn-primary" onClick={next}>
                    {index + 1 >= total ? "Vyhodnocení" : "Další otázka"}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {phase === "result" && (
          <>
            <span className="badge">Konec</span>
            <h1 className="result-earned-title">{resultTitle.title}</h1>
            <p className="result-earned-sub">{resultTitle.subtitle}</p>
            <p className="result-score">{score}</p>
            <p className="result-detail">
              Celkem {total} otázek. Za správnou odpověď jsi dostal bod, za špatnou jsi bod ztratil.
            </p>
            {scorePrediction !== null && (
              <p className="prediction-summary">
                Tvůj odhad: <strong>{scorePrediction}</strong> · výsledek: <strong>{score}</strong>
                <br />
                {predictionHint}
              </p>
            )}
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={goWelcome}>
                Hrát znovu
              </button>
              <button type="button" className="btn btn-ghost" onClick={goWelcome}>
                Úvod
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
