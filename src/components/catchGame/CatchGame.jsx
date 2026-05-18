import useCatchGameLogic from "./useCatchGameLogic";
import "./catchGame.style.css";

/**
 * COMPONENTE VISUAL DA CESTA DE OFERTAS (CatchGame.jsx)
 * Responsável exclusivamente pela renderização da interface gráfica (View), exibição
 * do cabeçalho com pontuação e cronômetro, a área do jogo em HTML5 Canvas e a tela final.
 * Toda a lógica de física, animação (requestAnimationFrame) e pontuação fica no hook `useCatchGameLogic`.
 *
 * @param {Object} props - Propriedades recebidas do componente pai (App principal).
 * @param {Object} props.data - Objeto de dados (não utilizado neste jogo contínuo, mantido pelo contrato).
 * @param {Object} props.settings - Configurações da partida (ex: `timeLimitSeconds`).
 * @param {Array} props.ranking - Lista com os top jogadores para exibição no mini-ranking final.
 * @param {Function} props.onScore - Callback acionada ao finalizar a partida para registrar os pontos globais.
 * @param {Function} props.onRoundComplete - Callback de vitória (não se aplica a este jogo por tempo).
 * @param {Function} props.onGameOver - Callback acionada quando o tempo se esgota.
 */
export default function CatchGame({
    data = {},
    settings = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    // Inicializa o Custom Hook desestruturando as referências do DOM, estado do HUD e manipuladores de eventos
    const {
        canvasRef,         // Referência para o elemento <canvas> onde os itens e a cesta são desenhados
        stageRef,          // Referência para a div contêiner (usada para calcular dimensões e eventos de toque)
        points,            // Pontuação atual acumulada
        timeLeft,          // Tempo restante no cronômetro regressivo
        finished,          // Flag indicando se a partida foi encerrada
        timedOut,          // Flag indicando se o fim de jogo foi causado pelo término do tempo
        handlePointerMove, // Função disparada ao mover o mouse ou tocar na tela para mover a cesta
        restartGame,       // Função para reiniciar a partida
    } = useCatchGameLogic({ data, settings, onScore, onGameOver });

    // Determina se a tela final de resultado deve ser exibida
    const showResult = finished && timeLeft <= 0;

    return (
        // Contêiner principal do painel do jogo
        <div className="catch-game panel">
            
            {/* CABEÇALHO DO PAINEL: Exibe título, tempo restante e pontos atuais */}
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

            {/* ÁREA INTERATIVA DO JOGO (STAGE): Captura eventos de clique/toque e movimento */}
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

            {/* INSTRUÇÕES BÁSICAS DE JOGABILIDADE */}
            <p className="catch-instructions">
                Arraste o dedo para mover a cesta. <strong>Item ruim coletado</strong> e{" "}
                <strong>item dourado perdido</strong> afetam a pontuação.
            </p>

            {/* TELA DE RESULTADO FINAL (MODAL INTERNO DE FIM DE JOGO) */}
            {showResult && (
                <div className="catch-result-box" aria-live="polite">
                    <p>{timedOut ? "Tempo esgotado" : "Partida concluida"}</p>
                    <h3>Pontos: {points}</h3>
                    <p>Tempo jogado: {settings.timeLimitSeconds - timeLeft}s</p>

                    {/* MINI-RANKING: Exibe os 5 melhores jogadores da Cesta de Ofertas */}
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

                    {/* BOTÃO DE REINÍCIO */}
                    <button className="primary" onClick={restartGame}>
                        Jogar de novo
                    </button>
                </div>
            )}
        </div>
    );
}
