import { useEffect, useRef, useState } from "react";
import "./memoryGame.style.css";

const mulberry32 = (seed) => {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = (list, rng = Math.random) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function MemoryGame({
  symbols = [],
  onScore,
  timeLimitSeconds = 120,
  ranking = [],
  seed = null,
  pairCount = null,
}) {
  const noSymbols = symbols.length === 0;
  const previewTimer = useRef(null);
  const runRef = useRef(0);

  const buildDeck = (runKey = 0) => {
    const rng =
      seed === null ? Math.random : mulberry32(Number(seed) + Number(runKey));
    const maxPairs = pairCount ?? symbols.length;
    const shuffledSymbols = shuffle(symbols, rng);
    const selected = shuffledSymbols.slice(
      0,
      Math.max(0, Math.min(maxPairs, symbols.length)),
    );
    const doubled = selected.flatMap((label) => [label, label]);
    return shuffle(doubled, rng).map((label, index) => ({
      id: `${label}-${index}`,
      label,
      matched: false,
    }));
  };

  const [cards, setCards] = useState(() => {
    return buildDeck(runRef.current);
  });
  const [flipped, setFlipped] = useState([]);
  const [locked, setLocked] = useState(false);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const resetGame = () => {
    runRef.current += 1;
    setCards(buildDeck(runRef.current));
    setFlipped([]);
    setLocked(false);
    setErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(noSymbols);
    setTimedOut(false);
    setReported(false);
    setPreviewing(true);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewing(false), 3000);
  };

  useEffect(() => {
    resetGame();
  }, [symbols, timeLimitSeconds, seed, pairCount]);

  useEffect(
    () => () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (finished) return undefined;
    if (noSymbols) return undefined;
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
    if (noSymbols) return;
    if (finished && !reported) {
      const elapsedMs = Math.max(0, (timeLimitSeconds - timeLeft) * 1000);
      onScore?.({
        game: "Memória",
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
    timeLimitSeconds,
    timeLeft,
    timedOut,
  ]);

  const handleFlip = (cardId) => {
    if (locked || finished || noSymbols || previewing) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.matched || flipped.includes(cardId)) return;

    const next = [...flipped, cardId];
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      const [first, second] = next.map((id) => cards.find((c) => c.id === id));
      const isMatch = first.label === second.label;
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            next.includes(c.id) && isMatch ? { ...c, matched: true } : c,
          ),
        );
        if (!isMatch) {
          setErrors((prev) => prev + 1);
        }
        setFlipped([]);
        setLocked(false);
      }, 500);
    }
  };

  const solved = cards.every((c) => c.matched);

  useEffect(() => {
    if (solved && !finished) {
      setFinished(true);
    }
  }, [solved, finished]);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Memória</p>
          <h2>Forme os pares</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Erros: {errors}</span>
        {finished && !timedOut && (
          <span className="pill success">Concluído</span>
        )}
        {timedOut && <span className="pill warning">Tempo esgotado</span>}
        {noSymbols && <span className="pill warning">Sem cartas</span>}
      </div>
      {!noSymbols ? (
        <div className="memory-grid">
          {cards.map((card) => {
            const show =
              previewing || card.matched || flipped.includes(card.id);
            return (
              <button
                key={card.id}
                className={`card ${show ? "card-flipped" : ""} ${card.matched ? "card-matched" : ""}`}
                onClick={() => handleFlip(card.id)}
                aria-label={`Carta ${card.label}`}
              >
                <span>{show ? card.label : "?"}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="result-box" aria-live="polite">
          <p>Sem cartas para jogar.</p>
          <button className="primary" onClick={resetGame}>
            Tentar de novo
          </button>
        </div>
      )}
      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : "Concluído"}</p>
          <h3>
            Erros: {errors} | Tempo: {timeLimitSeconds - timeLeft}s
          </h3>
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
          <button className="primary" onClick={resetGame}>
            Jogar de novo
          </button>
        </div>
      )}
    </div>
  );
}
