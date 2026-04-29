import React from "react";
import "./labirintoGame.style.css";
import useLabirintoLogic from "./useLabirintoLogic";
import { calcularPontos } from "../../utils/scoring";

export default function LabirintoGame(props) {
  const {
    onScore,
    timeLimitSeconds,
    ranking = [],
    words = [],
    gridSize,
  } = props;
  const logic = useLabirintoLogic({
    words,
    timeLimitSeconds,
    gridSize,
    onScore,
  });

  const {
    round,
    word,
    grid,
    checkpointMap,
    progress,
    trail,
    trailSet,
    timeLeft,
    finished,
    timedOut,
    hintText,
    boardRef,
    cellSize,
    hasRound,
    collectedLetters,
    wallSegments,
    trailSegments,
    startDrag,
    dragOver,
    endDrag,
    handleClick,
    resetAttempt,
    newGame,
    showHint,
  } = logic;

  const posKey = (r, c) => `${r}-${c}`;
  const boardGridSize = grid?.length || gridSize || 8;
  const shouldMarkFirstCheckpoint = true;

  return (
    <div className="labirinto panel" onPointerUp={endDrag}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">Labirinto</p>
          <h2>{finished ? "Resultado" : "Forme a palavra no caminho"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">
          Pontos: {calcularPontos(progress + 1, word.length || 1)}
        </span>
      </div>

      <div className="word-progress" aria-label="Letras ja passadas">
        {collectedLetters.length === 0 ? (
          <span className="word-progress-empty">
            A palavra vai surgir conforme a linha avança.
          </span>
        ) : (
          collectedLetters.map((ch, idx) => (
            <span key={`wp-${idx}`} className="word-progress-char done">
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
          <div className="maze-hint">
            Arraste com o dedo/mouse a partir da primeira letra e siga os
            corredores.
            {hintText ? <span className="hint-msg"> {hintText}</span> : null}
          </div>

          <div className="maze-actions">
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
            ref={boardRef}
            className="maze-board"
            style={{ width: "100%", maxWidth: 560 }}
          >
            <div
              className="maze-grid"
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
                      className={`maze-cell ${isTrail ? "trail" : ""} ${isStartCheckpoint ? "checkpoint" : ""}`}
                      onPointerDown={() => startDrag(r, c)}
                      onPointerEnter={() => dragOver(r, c)}
                      onPointerUp={endDrag}
                      onClick={() => handleClick(r, c)}
                      disabled={finished}
                    >
                      <span
                        className={`cell-letter ${cell.letter ? "filled" : "empty"}`}
                      >
                        {cell.letter}
                      </span>
                    </button>
                  );
                }),
              )}
            </div>

            <div className="maze-overlay" aria-hidden="true">
              {trailSegments.map((seg) => (
                <div
                  key={seg.key}
                  className="trail-segment"
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
                  className="trail-node"
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
                  className="wall-segment"
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
        </>
      )}

      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : `Palavra ${word} concluida`}</p>
          <p>Pontos: {calcularPontos(progress + 1, word.length || 1)}</p>
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
          <button className="primary" onClick={newGame}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}
