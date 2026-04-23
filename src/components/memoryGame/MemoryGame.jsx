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

const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
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

  const [cards, setCards] = useState(() => buildDeck(runRef.current));
  const [flipped, setFlipped] = useState([]);
  const [locked, setLocked] = useState(false);
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
    setTimeLeft(timeLimitSeconds);
    setFinished(noSymbols);
    setTimedOut(false);
    setReported(false);
    setPreviewing(true);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewing(false), 1200);
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
    if (finished || noSymbols) return undefined;
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
  }, [finished, noSymbols]);

  const matchedPairs = Math.floor(cards.filter((c) => c.matched).length / 2);
  const totalPairs = Math.max(1, Math.floor(cards.length / 2));
  const solved = cards.length > 0 && cards.every((c) => c.matched);

  useEffect(() => {
    if (!solved || finished) return;
    setFinished(true);
  }, [solved, finished]);

  useEffect(() => {
    if (!finished || reported) return;
    const partialPoints = calcularPontos(matchedPairs, totalPairs);
    onScore?.({
      game: "Memoria",
      score: partialPoints,
      points: partialPoints,
      remainingSeconds: timeLeft,
      timedOut,
    });
    setReported(true);
  }, [
    finished,
    reported,
    onScore,
    matchedPairs,
    totalPairs,
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
          // sem contagem de erros; apenas mantém o estado visual do jogo
        }
        setFlipped([]);
        setLocked(false);
      }, 450);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Memoria</p>
          <h2>{finished ? "Resultado" : "Forme os pares"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">
          Pontos: {calcularPontos(matchedPairs, totalPairs)}
        </span>
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
          <p>{timedOut ? "Tempo esgotado" : "Concluido"}</p>
          <h3>Pontos totais: {calcularPontos(matchedPairs, totalPairs)}</h3>
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
          <button className="primary" onClick={resetGame}>
            Jogar de novo
          </button>
        </div>
      )}
    </div>
  );
}
