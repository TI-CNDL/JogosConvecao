import useWhacGameLogic from "./useWhacGameLogic";
import "./whacGame.style.css";

/**
 * WhacGame — Componente Whac-A-Mole Futurista (Omni-Catch)
 *
 * Props (contrato padronizado):
 *   data             — {}
 *   settings         — { timeLimitSeconds }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar
 *   onGameOver       — Callback disparado ao terminar
 */
export default function WhacGame({
  data = {},
  settings = {},
  ranking = [],
  onScore,
  onGameOver,
  onPlayAgain,
}) {
  const logic = useWhacGameLogic({
    data,
    settings,
    onScore,
    onGameOver,
  });

  const gridColumns = Math.max(
    3,
    Math.min(6, Math.ceil(Math.sqrt(logic.gridSize))),
  );

  return (
    <div className="whac-game panel">
      {/* ── Cabeçalho ── */}
      <div className="panel-head">
        <div>
          <p className="eyebrow">Omni-Catch</p>
          <h2>{logic.gameStarted ? "Acerte os Alvos" : "Prepare-se"}</h2>
        </div>
        <span className="pill">Tempo: {logic.timeLeft}s</span>
      </div>

      {/* ── Tela inicial ── */}
      {!logic.gameStarted && (
        <div className="whac-intro">
          <p className="whac-intro-text">Seu alvo é:</p>
          <div className="whac-target-display">{logic.targetIcon}</div>
          <p className="whac-intro-hint">
            Clique nele o máximo que conseguir em {logic.timeLimitSeconds}{" "}
            segundos!
          </p>
          <button className="primary whac-start-btn" onClick={logic.startGame}>
            Começar
          </button>
        </div>
      )}

      {/* ── Jogo ativo ── */}
      {logic.gameStarted && !logic.finished && (
        <>
          {/* Área de Target Info */}
          <div className="whac-target-info">
            <span className="whac-target-label">Seu alvo:</span>
            <span className="whac-target-icon">{logic.targetIcon}</span>
          </div>

          {/* Grade de Slots configurável */}
          <div
            className="whac-grid"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: logic.gridSize }).map((_, index) => {
              const slot = logic.activeSlots.find(
                (item) => item.index === index,
              );
              const isActive = Boolean(slot);
              const isClicked = slot ? logic.clickedIds.has(slot.id) : false;
              const icon = slot?.icon ?? null;
              const itemDuration = slot ? `${slot.duration}ms` : undefined;

              return (
                <button
                  key={index}
                  className={`whac-slot ${isActive ? "active" : ""} ${
                    slot?.isTarget ? "target" : ""
                  } ${isClicked ? "clicked" : ""}`}
                  onClick={() => logic.handleSlotClick(index)}
                  disabled={!isActive || isClicked}
                  style={
                    isActive && itemDuration
                      ? { animationDuration: itemDuration }
                      : undefined
                  }
                >
                  {isActive && <span className="whac-icon">{icon}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Resultado final ── */}
      {logic.finished && (
        <div className="whac-result-box" aria-live="polite">
          <p>Tempo Esgotado!</p>
          <h3>Pontos Finais: {logic.score}</h3>

          {/* Mini-ranking */}
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

          <button className="primary" onClick={onPlayAgain}>
            Novo Jogo
          </button>
        </div>
      )}
    </div>
  );
}
