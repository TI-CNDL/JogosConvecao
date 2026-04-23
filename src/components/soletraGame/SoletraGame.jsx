import { useEffect, useMemo, useState } from "react";
import "./soletraGame.style.css";

const ROUND = {
  center: "N",
  letters: ["E", "Z", "T", "R", "O", "L", "N"],
  words: ["NORTE", "TERNO", "TRENO", "LENTO", "TONEL", "TENOR", "RETONO"],
};

const normalize = (value) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

export default function SoletraGame({
  onScore,
  timeLimitSeconds = 120,
  ranking = [],
}) {
  const validWords = useMemo(() => ROUND.words.map(normalize), []);
  const letterPool = useMemo(() => ROUND.letters.map(normalize), []);
  const center = normalize(ROUND.center);

  const [typed, setTyped] = useState("");
  const [found, setFound] = useState(new Set());
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    setTyped("");
    setFound(new Set());
    setErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
    setTimedOut(false);
    setReported(false);
  }, [timeLimitSeconds]);

  useEffect(() => {
    if (finished) return undefined;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (found.size === validWords.length && !finished) {
      setFinished(true);
    }
  }, [found, validWords.length, finished]);

  useEffect(() => {
    if (finished && !reported) {
      const elapsedMs = Math.max(0, (timeLimitSeconds - timeLeft) * 1000);
      onScore?.({
        game: "Soletra",
        score: errors,
        elapsedMs,
        timedOut,
      });
      setReported(true);
    }
  }, [
    finished,
    reported,
    onScore,
    errors,
    timeLeft,
    timeLimitSeconds,
    timedOut,
  ]);

  const pushLetter = (letter) => {
    if (finished) return;
    setTyped((prev) => `${prev}${letter}`);
  };

  const backspace = () => {
    if (finished) return;
    setTyped((prev) => prev.slice(0, -1));
  };

  const shuffle = () => {
    if (finished) return;
    setTyped((prev) => prev.split("").reverse().join(""));
  };

  const confirmWord = () => {
    if (finished) return;
    const word = normalize(typed);
    if (!word) {
      setErrors((prev) => prev + 1);
      return;
    }
    const hasCenter = word.includes(center);
    const isAllowedChars = word
      .split("")
      .every((letter) => letterPool.includes(letter));
    const exists = validWords.includes(word);
    const alreadyFound = found.has(word);

    if (!hasCenter || !isAllowedChars || !exists || alreadyFound) {
      setErrors((prev) => prev + 1);
      return;
    }

    setFound((prev) => new Set(prev).add(word));
    setTyped("");
  };

  const reset = () => {
    setTyped("");
    setFound(new Set());
    setErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
    setTimedOut(false);
    setReported(false);
  };

  const sortedFound = [...found].sort((a, b) => a.localeCompare(b));

  return (
    <div className="soletra panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Soletra</p>
          <h2>{finished ? "Resultado" : "Monte palavras"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Erros: {errors}</span>
        <span className="pill">
          {found.size}/{validWords.length}
        </span>
      </div>

      <div className="soletra-word">{typed || "_"}</div>

      <div className="soletra-grid">
        {letterPool.map((letter) => (
          <button
            key={letter}
            className={`letter-btn ${letter === center ? "center" : ""}`}
            onClick={() => pushLetter(letter)}
            disabled={finished}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="soletra-actions">
        <button className="ghost" onClick={backspace} disabled={finished}>
          Apagar
        </button>
        <button className="ghost" onClick={shuffle} disabled={finished}>
          Inverter
        </button>
        <button className="primary" onClick={confirmWord} disabled={finished}>
          Confirmar
        </button>
      </div>

      <div className="soletra-found panel">
        <p className="eyebrow">Palavras encontradas</p>
        {sortedFound.length === 0 ? (
          <p className="muted">Nenhuma palavra válida ainda.</p>
        ) : (
          <div className="found-list">
            {sortedFound.map((word) => (
              <span key={word} className="found-item">
                {word}
              </span>
            ))}
          </div>
        )}
      </div>

      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : "Partida concluída"}</p>
          <p>
            Erros: {errors} | Encontradas: {found.size}/{validWords.length} |
            Tempo: {timeLimitSeconds - timeLeft}s
          </p>
          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.score} erros</span>
                  <span>{Math.round((row.elapsedMs ?? 0) / 1000)}s</span>
                </div>
              ))}
            </div>
          )}
          <button className="primary" onClick={reset}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}
