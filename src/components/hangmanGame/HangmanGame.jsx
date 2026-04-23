import { useEffect, useMemo, useState, useCallback } from "react";
import "./hangmanGame.style.css";

const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
};

export default function HangmanGame({
  words = [],
  onScore,
  timeLimitSeconds = 150,
  ranking = [],
}) {
  const maxLives = 5;
  const normalize = (text) =>
    (text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const alphabet = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ".split(""), []);
  const normalizedWords = useMemo(
    () =>
      words
        .map((word) => (word ?? "").toUpperCase())
        .filter((word) => word.length > 0),
    [words],
  );

  const pickRandomWord = useCallback(() => {
    if (normalizedWords.length === 0) return "";
    const idx = Math.floor(Math.random() * normalizedWords.length);
    return normalizedWords[idx];
  }, [normalizedWords]);

  const [secret, setSecret] = useState(() => pickRandomWord());
  const [guessed, setGuessed] = useState(new Set());
  const [lives, setLives] = useState(maxLives);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);

  const noWords = normalizedWords.length === 0;

  useEffect(() => {
    setSecret(pickRandomWord());
    setGuessed(new Set());
    setLives(maxLives);
    setTimeLeft(timeLimitSeconds);
    setFinished(noWords);
    setTimedOut(false);
    setReported(false);
  }, [pickRandomWord, timeLimitSeconds, noWords]);

  const secretNormalized = useMemo(() => normalize(secret), [secret]);

  const masked = secret
    .split("")
    .map((letter, idx) => (guessed.has(secretNormalized[idx]) ? letter : "_"))
    .join(" ");

  const won =
    secret.length > 0 &&
    secretNormalized.split("").every((letter) => guessed.has(letter));

  const revealedCount = secretNormalized
    .split("")
    .filter((letter) => guessed.has(letter)).length;

  useEffect(() => {
    if (finished || noWords || lives <= 0) return undefined;
    const id = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setFinished(true);
          setTimedOut(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finished, noWords, lives]);

  useEffect(() => {
    if (noWords || finished || lives <= 0) return;
    if (won) {
      setFinished(true);
    }
  }, [won, finished, noWords, lives]);

  useEffect(() => {
    if (finished && !reported) {
      const partialPoints = calcularPontos(revealedCount, secret.length || 1);
      onScore?.({
        game: "Forca",
        score: partialPoints,
        points: partialPoints,
        remainingSeconds: timeLeft,
        timedOut: timedOut || noWords,
      });
      setReported(true);
    }
  }, [
    finished,
    reported,
    onScore,
    revealedCount,
    secret,
    timeLeft,
    timedOut,
    noWords,
  ]);

  const pick = (letter) => {
    const normalizedLetter = normalize(letter);
    if (won || guessed.has(normalizedLetter) || finished || noWords) return;
    setGuessed((prev) => new Set(prev).add(normalizedLetter));

    if (!secretNormalized.includes(normalizedLetter)) {
      setLives((currentLives) => {
        const nextLives = Math.max(0, currentLives - 1);
        if (nextLives === 0) {
          setFinished(true);
          setTimedOut(false);
        }
        return nextLives;
      });
    }
  };

  const reset = () => {
    setSecret(pickRandomWord());
    setGuessed(new Set());
    setLives(maxLives);
    setTimeLeft(timeLimitSeconds);
    setFinished(noWords);
    setTimedOut(false);
    setReported(false);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>{finished ? "Resultado" : "Adivinhe a palavra"}</h2>
        </div>
        <span className="pill">Vidas: {lives}</span>
        <span className="pill">
          Pontos: {calcularPontos(revealedCount, secret.length || 1)}
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
            disabled={won || guessed.has(letter) || finished || noWords}
            onClick={() => pick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      {finished && (
        <div className="result-box">
          <p>
            {noWords
              ? "Sem palavras para jogar."
              : lives <= 0
                ? `Você ficou sem vidas. A palavra era ${secret}.`
                : timedOut
                  ? `Tempo esgotado. A palavra era ${secret}.`
                  : `A palavra era ${secret}.`}
          </p>
          <p>Pontos: {calcularPontos(revealedCount, secret.length || 1)}</p>
          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.totalPoints ?? 0} pts</span>
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
