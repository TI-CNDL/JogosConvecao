import useCatchGameLogic from "./useCatchGameLogic";
import "./catchGame.style.css";

/**
 * CatchGame — Componente de View puro.
 *
 * Props (contrato padronizado):
 *   data             — (Não utilizado neste jogo, mas mantido pelo contrato)
 *   settings         — { timeLimitSeconds }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar partida
 *   onRoundComplete  — (Não se aplica)
 *   onGameOver       — Callback disparado quando o tempo esgota
 */
export default function CatchGame({
    data = {},
    settings = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const {
        canvasRef,
        stageRef,
        points,
        timeLeft,
        finished,
        timedOut,
        handlePointerMove,
        restartGame,
    } = useCatchGameLogic({ data, settings, onScore, onGameOver });

    const showResult = finished && timeLeft <= 0;

    return (
        <div className="catch-game panel">
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Cesta de Ofertas</p>
                    <h2>
                        {showResult ? "Fim de jogo" : "Colete os bons e desvie dos ruins"}
                    </h2>
                </div>
                <span className="pill">Tempo: {timeLeft}s</span>
                <span className="pill">Pontos: {points}</span>
            </div>

            <div
                ref={stageRef}
                className="catch-stage"
                onPointerDown={handlePointerMove}
                onPointerMove={handlePointerMove}
            >
                <canvas
                    ref={canvasRef}
                    className="catch-canvas"
                    aria-label="Área do jogo Cesta de Ofertas"
                />
            </div>

            <p className="catch-instructions">
                Arraste o dedo para mover a cesta. <strong>Item ruim coletado</strong> e{" "}
                <strong>item dourado perdido</strong> afetam a pontuação.
            </p>

            {showResult && (
                <div className="catch-result-box" aria-live="polite">
                    <p>{timedOut ? "Tempo esgotado" : "Partida concluida"}</p>
                    <h3>Pontos: {points}</h3>
                    <p>Tempo jogado: {settings.timeLimitSeconds - timeLeft}s</p>

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

                    <button className="primary" onClick={restartGame}>
                        Jogar de novo
                    </button>
                </div>
            )}
        </div>
    );
}
