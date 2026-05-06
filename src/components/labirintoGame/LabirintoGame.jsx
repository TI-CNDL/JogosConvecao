import { useEffect } from "react";
import useLabirintoLogic from "./useLabirintoLogic";
import "./labirintoGame.style.css";

export default function LabirintoGame({
  data = {},
  config = {},
  sessionScore,
  onScore,
  onRoundComplete,
  onGameOver,
}) {
  const logic = useLabirintoLogic({
    data,
    config,
    sessionScore,
    onScore,
    onRoundComplete,
    onGameOver,
  });

  const {
    word,
    grid,
    checkpointMap,
    shouldMarkFirstCheckpoint,
    boardGridSize,
    progress,
    trail,
    trailSet,
    errors,
    timeLeft,
    finished,
    timedOut,
    hintText,
    boardRef,
    cellSize,
    hasRound,
    wallSegments,
    trailSegments,
    collectedLetters,
    timeLimitSeconds,
    startDrag,
    dragOver,
    endDrag,
    handleClick,
    resetAttempt,
    newGame,
    showHint,
    posKey,
  } = logic;

  // Debug de alinhamento no lado visual
  useEffect(() => {
    if (boardRef.current) {
      const style = window.getComputedStyle(boardRef.current);
      console.debug(`[Labirinto V3] Grid Rendered: width=${style.width}, height=${style.height}, padding=${style.padding}, border=${style.borderWidth}`);
    }
  }, [cellSize]);

  return (
    <div className="labirinto-panel" onPointerUp={endDrag}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">Labirinto</p>
          <h2>{finished ? "Resultado" : "Forme a palavra no caminho"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Pontos: {Math.floor((Math.max(0, progress + 1) / (word.length || 1)) * 100)}</span>
        <span className="pill">Erros: {errors}</span>
      </div>

      <div className="labirinto-word-progress" aria-label="Letras ja passadas">
        {collectedLetters.length === 0 ? (
          <span className="labirinto-word-progress-empty">
            A palavra vai surgir conforme a linha avança.
          </span>
        ) : (
          collectedLetters.map((ch, idx) => (
            <span key={`wp-${idx}`} className="labirinto-word-progress-char done">
              {ch}
            </span>
          ))
        )}
      </div>

      {!hasRound ? (
        <div className="result-box">
          <p>Nao foi possivel montar o labirinto agora.</p>
          <button className="primary" onClick={newGame}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="labirinto-hint">
            Arraste com o dedo/mouse a partir da primeira letra e siga os
            corredores.
            {hintText ? <span className="labirinto-hint-msg"> {hintText}</span> : null}
          </div>

          <div className="labirinto-actions">
            <button
              className="primary"
              onClick={resetAttempt}
              disabled={finished}
            >
              Limpar
            </button>
            <button className="primary" onClick={showHint} disabled={finished}>
              Dica
            </button>
          </div>

          <div
            className="labirinto-board"
            style={{ width: "100%"}}
          >
            <div
              ref={boardRef}
              className="labirinto-grid"
              role="grid"
              aria-label="Labirinto de letras"
              style={{
                gridTemplateColumns: `repeat(${boardGridSize}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const key = posKey(r, c);
                  const isTrail = trailSet.has(key);
                  const cpIndex = checkpointMap.get(key);
                  const isStartCheckpoint =
                    shouldMarkFirstCheckpoint &&
                    cpIndex !== undefined &&
                    cell.letter === word[0];

                  return (
                    <button
                      key={cell.key}
                      role="gridcell"
                      className={`labirinto-cell ${isTrail ? "trail" : ""} ${isStartCheckpoint ? "checkpoint" : ""}`}
                      onPointerDown={() => startDrag(r, c)}
                      onPointerEnter={() => dragOver(r, c)}
                      onPointerUp={endDrag}
                      onClick={() => handleClick(r, c)}
                      disabled={finished}
                    >
                      <span
                        className={`labirinto-cell-letter ${cell.letter ? "filled" : "empty"}`}
                      >
                        {cell.letter}
                      </span>
                    </button>
                  );
                }),
              )}
              <div className="labirinto-overlay" aria-hidden="true">
              {trailSegments.map((seg) => (
                <div
                  key={seg.key}
                  className="labirinto-trail-segment"
                  style={{
                    left: seg.x,
                    top: seg.y,
                    width: seg.width,
                    height: seg.height,
                  }}
                />
              ))}
              {trail.map((p, idx) => (
                <div
                  key={`node-${idx}`}
                  className="labirinto-trail-node"
                  style={{
                    left: p.c * cellSize + cellSize / 2,
                    top: p.r * cellSize + cellSize / 2,
                    width: Math.max(14, cellSize * 0.28),
                    height: Math.max(14, cellSize * 0.28),
                  }}
                />
              ))}
              {wallSegments.map((seg) => (
                <div
                  key={seg.key}
                  className="labirinto-wall-segment"
                  style={{
                    left: seg.x,
                    top: seg.y,
                    width: seg.width,
                    height: seg.height,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </>
      )}

      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : `Palavra ${word} concluida`}</p>
          <h3>Pontos: {Math.floor((Math.max(0, progress + 1) / (word.length || 1)) * 100) + (timedOut ? 0 : timeLeft)}</h3>
          <p>
            Erros: {errors} | Tempo jogado: {timeLimitSeconds - timeLeft}s
          </p>
          <button className="primary" onClick={newGame}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}