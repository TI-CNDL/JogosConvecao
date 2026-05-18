import { useMemo } from "react";
import useWordSearchLogic from "./useWordSearchLogic";
import "./wordSearchGame.style.css";

/**
 * COMPONENTE VISUAL DO JOGO CAÇA-PALAVRAS (WordSearchGame.jsx)
 * Responsável exclusivamente pela renderização da interface gráfica (View).
 * Apresenta o cabeçalho com HUD reativo (tempo, pontos e progresso de palavras encontradas),
 * a grade interativa de células de letras (suportando seleção contínua por arraste/toque),
 * a lista de palavras-alvo (chips indicando o status de conclusão) e o painel de resultados com mini-ranking.
 *
 * @param {Object} props - Propriedades recebidas do componente orquestrador (App).
 * @param {Object} props.data - Dados brutos da rodada contendo a lista de palavras (`data.words`).
 * @param {Object} props.settings - Configurações da partida (ex: `timeLimitSeconds`, `gridSize`, `maxAttempts`, `maxWords`).
 * @param {Array} props.ranking - Lista de top jogadores para exibição no mini-ranking final da sessão.
 * @param {Function} props.onScore - Callback disparada ao finalizar a partida para registrar a pontuação.
 * @param {Function} props.onRoundComplete - Callback disparada ao encontrar todas as palavras com sucesso.
 * @param {Function} props.onGameOver - Callback disparada ao esgotar o tempo da partida.
 */
export default function WordSearchGame({
    data = {},
    config = {},
    settings = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const activeSettings = { ...config, ...settings };
    // Consome o Custom Hook que gerencia a geração da grade, validação de arraste, temporizadores e pontuação
    const logic = useWordSearchLogic({
        data,
        settings: activeSettings,
        onScore,
        onRoundComplete,
        onGameOver,
    });

    // Memoriza a variável CSS com o número de colunas da grade para garantir o alinhamento correto
    const gridStyle = useMemo(
        () => ({ "--ws-cols": logic.gridCols }),
        [logic.gridCols],
    );

    return (
        // Contêiner principal do painel de Caça-palavras
        // Captura o término do arraste (onPointerUp) globalmente para evitar travamentos de seleção caso o cursor saia da grade
        <div className="wordsearch-game panel" onPointerUp={logic.finishSelect}>
            
            {/* ── CABEÇALHO DO PAINEL: Exibe título, tempo restante, pontos acumulados e contagem de palavras achadas ── */}
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

            {/* ── GRADE INTERATIVA DE LETRAS (OU AVISO DE FALHA DE GERAÇÃO) ── */}
            {!logic.noWords && !logic.generationFailed && logic.grid ? (
                <div className="ws-grid" role="grid" style={gridStyle}>
                    {/* Itera sobre as linhas da grade gerada */}
                    {logic.grid.map((row, rIdx) => (
                        <div className="ws-row" role="row" key={rIdx}>
                            {/* Itera sobre as células individuais de cada linha */}
                            {row.map((cell, cIdx) => {
                                // Aplica classes visuais dinâmicas caso a célula esteja selecionada no momento ou já faça parte de uma palavra encontrada
                                const selectedClass = logic.isSelected(rIdx, cIdx)
                                    ? "selected"
                                    : "";
                                const foundClass = logic.isFound(rIdx, cIdx) ? "found" : "";

                                return (
                                    <button
                                        key={`${rIdx}-${cIdx}`}
                                        className={`ws-cell ${selectedClass} ${foundClass}`}
                                        onPointerDown={() => logic.beginSelect(rIdx, cIdx)}   // Inicia a seleção no clique/toque
                                        onPointerEnter={() => logic.extendSelect(rIdx, cIdx)} // Expande a seleção ao arrastar sobre as células
                                        onPointerUp={logic.finishSelect}                      // Finaliza e valida a seleção ao soltar
                                    >
                                        {cell}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            ) : (
                /* TELA DE AVISO: Exibida caso não haja palavras cadastradas ou o algoritmo de encaixe tenha falhado */
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

            {/* ── LISTA DE PALAVRAS-ALVO (CHIPS VISUAIS) ── */}
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

            {/* ── MODAL FINAL DE RESULTADOS E MINI-RANKING ── */}
            {(logic.finished || logic.timedOut) && (
                <div className="ws-result-box" aria-live="polite">
                    <p>{logic.timedOut ? "Tempo esgotado" : "Concluído"}</p>
                    <h3>Pontos: {logic.currentPoints + (logic.timedOut ? 0 : logic.timeLeft)}</h3>
                    
                    {/* RENDERIZAÇÃO DO MINI-RANKING DA SESSÃO */}
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
                    
                    {/* BOTÃO PARA REINICIAR A PARTIDA */}
                    <button className="primary" onClick={logic.resetGame}>
                        Novo jogo
                    </button>
                </div>
            )}
        </div>
    );
}
