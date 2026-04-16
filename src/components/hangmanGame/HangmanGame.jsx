import { useEffect, useMemo, useState, useCallback } from "react";
import "./hangmanGame.style.css";

export default function HangmanGame({
  words = [],
  onScore,
  timeLimitSeconds = 150,
  livesLimit = 6,
  ranking = [],
}) {
  const normalize = (text) =>
    (text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const alphabet = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ".split(""), []);
  const normalizedWords = useMemo(
    () => words.map((w) => (w ?? "").toUpperCase()).filter((w) => w.length > 0),
    [words],
  );

  const pickRandomWord = useCallback(() => {
    if (normalizedWords.length === 0) return "";
    const idx = Math.floor(Math.random() * normalizedWords.length);
    return normalizedWords[idx];
  }, [normalizedWords]);

  const [secret, setSecret] = useState(() => pickRandomWord());
  const [guessed, setGuessed] = useState(new Set());
  const [errors, setErrors] = useState(0);
  const maxErrors = livesLimit;
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);
  const noWords = normalizedWords.length === 0;

  useEffect(() => {
    setErrors(0);
  }, [livesLimit]);

  useEffect(() => {
    // Reset completo ao mudar props
    setSecret(pickRandomWord());
    setGuessed(new Set());
    setErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(noWords);
    setTimedOut(false);
    setReported(false);
  }, [pickRandomWord, timeLimitSeconds, livesLimit, noWords]);

  const secretNormalized = useMemo(() => normalize(secret), [secret]);

  const masked = secret
    .split("")
    .map((letter, idx) => (guessed.has(secretNormalized[idx]) ? letter : "_"))
    .join(" ");

  const won =
    secret.length > 0 &&
    secretNormalized.split("").every((letter) => guessed.has(letter));
  const lost = errors >= maxErrors;

  useEffect(() => {
    if (finished) return undefined;
    if (noWords) return undefined;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true);
          setTimedOut(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (noWords) return;
    if ((won || lost) && !finished) {
      setFinished(true);
    }
  }, [won, lost, finished, noWords]);

  useEffect(() => {
    if (finished && !reported) {
      const elapsedMs = Math.max(0, (timeLimitSeconds - timeLeft) * 1000);
      onScore?.({
        game: "Forca",
        score: Math.max(0, maxErrors - errors),
        elapsedMs,
        timedOut: timedOut || lost || noWords,
      });
      setReported(true);
    }
  }, [
    finished,
    reported,
    onScore,
    errors,
    maxErrors,
    timeLeft,
    timedOut,
    lost,
    timeLimitSeconds,
    noWords,
  ]);

  const pick = (letter) => {
    const normalizedLetter = normalize(letter);
    if (won || lost || guessed.has(normalizedLetter) || finished || noWords)
      return;
    setGuessed((prev) => new Set(prev).add(normalizedLetter));
    if (!secretNormalized.includes(normalizedLetter)) {
      setErrors((prev) => prev + 1);
    }
  };

  const reset = () => {
    setSecret(pickRandomWord());
    setGuessed(new Set());
    setErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(noWords);
    setTimedOut(false);
    setReported(false);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Forca</p>
          <h2>
            {won
              ? "Você venceu!"
              : lost
                ? "Tente novamente"
                : "Adivinhe a palavra"}
          </h2>
        </div>
        <span className={`pill ${errors >= maxErrors - 2 ? "warning" : ""}`}>
          Vidas: {maxErrors - errors}
        </span>
        <span className="pill">Tempo: {timeLeft}s</span>
      </div>
      <div className="hangman-word" aria-live="polite">
        {noWords ? "Sem palavras" : masked}
      </div>
      <div className="keyboard">
        {alphabet.map((letter) => (
          <button
            key={letter}
            className="key"
            disabled={won || lost || guessed.has(letter) || finished || noWords}
            onClick={() => pick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      {finished && (
        <div className="result-box">
          <p>
            {timedOut
              ? "Tempo esgotado"
              : won
                ? "Boa! Palavra revelada."
                : `A palavra era ${secret}.`}
          </p>
          <p>Tempo: {timeLimitSeconds - timeLeft}s</p>
          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.score} pts</span>
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
