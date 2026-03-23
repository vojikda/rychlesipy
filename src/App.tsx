import { useCallback, useMemo, useState } from "react";
import { questions } from "./data/questions";
import "./App.css";

type Phase = "welcome" | "quiz" | "result";

export default function App() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const progress = useMemo(
    () => (total ? ((index + (answered ? 1 : 0)) / total) * 100 : 0),
    [index, answered, total]
  );

  const start = useCallback(() => {
    setPhase("quiz");
    setIndex(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  }, []);

  const pick = useCallback(
    (optionIndex: number) => {
      if (answered || !current) return;
      setSelected(optionIndex);
      setAnswered(true);
      if (optionIndex === current.correctIndex) {
        setScore((s) => s + 1);
      } else {
        setScore((s) => s - 1);
      }
    },
    [answered, current]
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

  if (total === 0) {
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

  return (
    <div className="app">
      <div className="card">
        {phase === "welcome" && (
          <>
            <span className="badge">Kvíz</span>
            <h1>Vítej u kvízu</h1>
            <p className="lead">
              Čeká tě {total} otázek se čtyřmi odpověďmi. Začínáš na <strong>0 bodech</strong>: za správnou odpověď
              dostaneš <strong>+1 bod</strong>, za špatnou <strong>−1 bod</strong> (skóre může jít i do mínusu).
            </p>
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
            <h1>Tvoje skóre</h1>
            <p className="result-score">{score}</p>
            <p className="result-detail">
              Celkem {total} otázek. Za správnou odpověď jsi dostal bod, za špatnou jsi bod ztratil.
            </p>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={start}>
                Hrát znovu
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setPhase("welcome")}>
                Úvod
              </button>
            </div>
          </>
        )}
      </div>
      <p className="footer-note">
        Data: <code className="inline-code">src/data/otazky.tsv</code> · import:{" "}
        <code className="inline-code">npm run import-quiz -- soubor.xlsx</code>
      </p>
    </div>
  );
}
