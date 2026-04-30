import React from "react";
import useLabirintoLogic from "./useLabirintoLogic";
import "./labirintoGame.style.css";

/**
 * LabirintoGame — Componente de View puro.
 *
 * Props (contrato padronizado):
 *   data             — { words: Array<string> }
 *   settings         — { timeLimitSeconds, gridSize }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar partida
 *   onRoundComplete  — Callback disparado ao achar a palavra a tempo
 *   onGameOver       — Callback disparado quando o tempo esgota
 */
export default function LabirintoGame({
    data = {},
    settings = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const logic = useLabirintoLogic({
        data,
        settings,
        onScore,
        onRoundComplete,
        onGameOver,
    });

    const {
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
    const boardGridSize = grid?.length || settings.gridSize || 8;
    const shouldMarkFirstCheckpoint = true;

    // Pontos correntes baseados no progresso
    const currentPoints = Math.floor(
        (Math.max(0, progress + 1) / (word.length || 1)) * 100,
    );

    return (
        <div className="labirinto-game panel" onPointerUp={endDrag}>
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Labirinto</p>
                    <h2>{finished ? "Resultado" : "Forme a palavra no caminho"}</h2>
                </div>
                <span className="pill">Tempo: {timeLeft}s</span>
                <span className="pill">Pontos: {currentPoints}</span>
            </div>

            <div className="labirinto-word-progress" aria-label="Letras já passadas">
                {collectedLetters.length === 0 ? (
                    <span className="labirinto-word-progress-empty">
                        A palavra vai surgir conforme a linha avança.
                    </span>
                ) : (
                    collectedLetters.map((ch, idx) => (
                        <span
                            key={`wp-${idx}`}
                            className="labirinto-word-progress-char done"
                        >
                            {ch}
                        </span>
                    ))
                )}
            </div>

            {!hasRound ? (
                <div className="labirinto-result-box">
                    <p>Não foi possível montar o labirinto agora.</p>
                    <button className="primary" onClick={newGame}>
                        Tentar novamente
                    </button>
                </div>
            ) : (
                <>
                    <div className="labirinto-maze-hint">
                        Arraste com o dedo/mouse a partir da primeira letra e siga os
                        corredores.
                        {hintText ? (
                            <span className="labirinto-hint-msg"> {hintText}</span>
                        ) : null}
                    </div>

                    <div className="labirinto-maze-actions">
                        <button
                            className="primary"
                            onClick={resetAttempt}
                            disabled={finished}
                        >
                            Limpar
                        </button>
                        <button
                            className="primary"
                            onClick={showHint}
                            disabled={finished}
                        >
                            Dica
                        </button>
                    </div>

                    <div
                        ref={boardRef}
                        className="labirinto-maze-board"
                        style={{ width: "100%", maxWidth: 560 }}
                    >
                        <div
                            className="labirinto-maze-grid"
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
                                            className={`labirinto-maze-cell ${isTrail ? "trail" : ""} ${isStartCheckpoint ? "checkpoint" : ""}`}
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
                        </div>

                        <div className="labirinto-maze-overlay" aria-hidden="true">
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
                </>
            )}

            {finished && (
                <div className="labirinto-result-box" aria-live="polite">
                    <p>{timedOut ? "Tempo esgotado" : `Palavra ${word} concluída`}</p>
                    <h3>Pontos: {currentPoints}</h3>
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
