import { useMemo } from "react";
import useWordSearchLogic from "./useWordSearchLogic";
import "./wordSearchGame.style.css";

/**
 * WordSearchGame — Componente de View puro para Caça-palavras
 *
 * Props (contrato padronizado):
 *   data             — { words: Array<string> }
 *   settings         — { timeLimitSeconds, gridSize, maxAttempts, maxWords }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar partida
 *   onRoundComplete  — Callback disparado ao ganhar
 *   onGameOver       — Callback disparado ao perder (timeout)
 */
export default function WordSearchGame({
    data = {},
    settings = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    // Consome o hook de lógica
    const logic = useWordSearchLogic({
        data,
        settings,
        onScore,
        onRoundComplete,
        onGameOver,
    });

    const gridStyle = useMemo(
        () => ({ "--ws-cols": logic.gridCols }),
        [logic.gridCols],
    );

    return (
        <div className="wordsearch-game panel" onPointerUp={logic.finishSelect}>
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Caça-palavras</p>
                    <h2>Encontre todas as palavras</h2>
                </div>
                <span className="pill">Tempo: {logic.timeLeft}s</span>
                <span className="pill">Pontos: {logic.currentPoints}</span>
                <span className="pill">
                    {logic.found.size}/{logic.totalWords} achadas
                </span>
            </div>

            {!logic.noWords && !logic.generationFailed && logic.grid ? (
                <div className="ws-grid" role="grid" style={gridStyle}>
                    {logic.grid.map((row, rIdx) => (
                        <div className="ws-row" role="row" key={rIdx}>
                            {row.map((cell, cIdx) => {
                                const selectedClass = logic.isSelected(rIdx, cIdx)
                                    ? "selected"
                                    : "";
                                const foundClass = logic.isFound(rIdx, cIdx) ? "found" : "";

                                return (
                                    <button
                                        key={`${rIdx}-${cIdx}`}
                                        className={`ws-cell ${selectedClass} ${foundClass}`}
                                        onPointerDown={() => logic.beginSelect(rIdx, cIdx)}
                                        onPointerEnter={() => logic.extendSelect(rIdx, cIdx)}
                                        onPointerUp={logic.finishSelect}
                                    >
                                        {cell}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="ws-result-box" aria-live="polite">
                    <p>
                        {logic.noWords
                            ? "Sem palavras para jogar."
                            : "Não foi possível gerar a grade."}
                    </p>
                    <button className="primary" onClick={logic.resetGame}>
                        Tentar novamente
                    </button>
                </div>
            )}

            <div className="ws-words">
                {logic.wordsFitting.map((word) => (
                    <span
                        key={word}
                        className={`ws-word-chip ${logic.found.has(word) ? "done" : ""}`}
                    >
                        {word}
                    </span>
                ))}
            </div>

            {(logic.finished || logic.timedOut) && (
                <div className="ws-result-box" aria-live="polite">
                    <p>{logic.timedOut ? "Tempo esgotado" : "Concluído"}</p>
                    <h3>Pontos: {logic.currentPoints + (logic.timedOut ? 0 : logic.timeLeft)}</h3>
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
                    <button className="primary" onClick={logic.resetGame}>
                        Novo jogo
                    </button>
                </div>
            )}
        </div>
    );
}
