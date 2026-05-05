import useMemoryGameLogic from "./useMemoryGameLogic";
import "./memoryGame.style.css";

/**
 * MemoryGame — Componente de View puro.
 *
 * Props (contrato padronizado):
 *   data             — { symbols: string[] }
 *   settings         — { timeLimitSeconds, pairCount, seed }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar partida
 *   onRoundComplete  — Callback disparado ao completar todos os pares
 *   onGameOver       — Callback disparado quando o tempo esgota
 */
export default function MemoryGame({
  data = {},
  settings = {},
  ranking = [],
  onScore,
  onRoundComplete,
  onGameOver,
}) {
  const {
    cards,
    flipped,
    previewing,
    finished,
    timedOut,
    noSymbols,
    timeLeft,
    matchedPairs,
    totalPairs,
    currentPoints,
    handleFlip,
    resetGame,
  } = useMemoryGameLogic({
    data,
    settings,
    onScore,
    onRoundComplete,
    onGameOver,
  });

  return (
    <div className="memory-game panel">
      {/* ── Cabeçalho ── */}
      <div className="panel-head">
        <div>
          <p className="eyebrow">Memoria</p>
          <h2>{finished ? "Resultado" : "Forme os pares"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Pontos: {currentPoints}</span>
      </div>

      {/* ── Tabuleiro ── */}
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
                {show ? (
                  card.imageUrl ? (
                    <img
                      src={
                        card.imageUrl.startsWith("http")
                          ? card.imageUrl
                          : `http://localhost:4000${card.imageUrl.startsWith("/") ? "" : "/"}${card.imageUrl}`
                      }
                      alt={card.label}
                      className="card-img"
                    />
                  ) : (
                    <span>{card.label}</span>
                  )
                ) : (
                  "?"
                )}
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

      {/* ── Resultado ── */}
      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : "Concluido"}</p>
          <h3>Pontos totais: {currentPoints + (timedOut ? 0 : timeLeft)}</h3>
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
