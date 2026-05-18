import useWhacGameLogic from "./useWhacGameLogic";
import "./whacGame.style.css";

/**
 * COMPONENTE VISUAL DO JOGO WHAC-A-MOLE FUTURISTA / OMNI-CATCH (WhacGame.jsx)
 * Responsável exclusivamente pela renderização da interface gráfica (View).
 * Apresenta a tela inicial de preparação (exibindo o ícone-alvo da partida),
 * a grade dinâmica de slots interativos (onde alvos e distratores surgem e desaparecem)
 * e o painel final de pontuação com mini-ranking.
 *
 * @param {Object} props - Propriedades recebidas do componente orquestrador (App).
 * @param {Object} props.data - Dados da rodada (atualmente sem uso de banco externo para este jogo).
 * @param {Object} props.settings - Configurações da partida (ex: `timeLimitSeconds`).
 * @param {Array} props.ranking - Lista de top jogadores para exibição no mini-ranking final.
 * @param {Function} props.onScore - Callback disparada ao finalizar a partida para registrar a pontuação.
 * @param {Function} props.onGameOver - Callback disparada ao término do jogo.
 * @param {Function} props.onPlayAgain - Callback disparada ao clicar em "Novo Jogo".
 */
export default function WhacGame({
  data = {},
  settings = {},
  ranking = [],
  onScore,
  onGameOver,
  onPlayAgain,
}) {
  // Desestrutura o Custom Hook que gerencia o loop de spawn, temporizadores e pontuação
  const logic = useWhacGameLogic({
    data,
    settings,
    onScore,
    onGameOver,
  });

  // Calcula dinamicamente o número de colunas da grade com base no tamanho total (gridSize)
  // Mantém um mínimo de 3 e máximo de 6 colunas para um layout quadrado/retangular balanceado
  const gridColumns = Math.max(
    3,
    Math.min(6, Math.ceil(Math.sqrt(logic.gridSize))),
  );

  return (
    // Contêiner principal do painel do Jogo Omni-Catch
    <div className="whac-game panel">
      
      {/* ── CABEÇALHO DO PAINEL: Exibe título e tempo restante ── */}
      <div className="panel-head">
        <div>
          <p className="eyebrow">Omni-Catch</p>
          <h2>{logic.gameStarted ? "Acerte os Alvos" : "Prepare-se"}</h2>
        </div>
        <span className="pill">Tempo: {logic.timeLeft}s</span>
      </div>

      {/* ── TELA INICIAL DE INTRODUÇÃO (PREPARAÇÃO) ── */}
      {!logic.gameStarted && (
        <div className="whac-intro">
          <p className="whac-intro-text">Seu alvo é:</p>
          
          {/* EXIBIÇÃO EM DESTAQUE DO ÍCONE ALVO DA PARTIDA */}
          <div className="whac-target-display">{logic.targetIcon}</div>
          
          <p className="whac-intro-hint">
            Clique nele o máximo que conseguir em {logic.timeLimitSeconds}{" "}
            segundos!
          </p>
          
          {/* BOTÃO PARA INICIAR O LOOP DO JOGO */}
          <button className="primary whac-start-btn" onClick={logic.startGame}>
            Começar
          </button>
        </div>
      )}

      {/* ── TELA DO JOGO ATIVO (GRADE DE SLOTS) ── */}
      {logic.gameStarted && !logic.finished && (
        <>
          {/* BARRA DE LEMBRETE DO ALVO ATUAL */}
          <div className="whac-target-info">
            <span className="whac-target-label">Seu alvo:</span>
            <span className="whac-target-icon">{logic.targetIcon}</span>
          </div>

          {/* GRADE DINÂMICA DE SLOTS INTERATIVOS */}
          <div
            className="whac-grid"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            }}
          >
            {/* Itera sobre o número total de slots configurados (gridSize) */}
            {Array.from({ length: logic.gridSize }).map((_, index) => {
              // Busca se há um item ativo posicionado neste índice de slot
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
                  disabled={!isActive || isClicked} // Desabilita slots vazios ou já clicados
                  style={
                    isActive && itemDuration
                      ? { animationDuration: itemDuration } // Sincroniza a animação CSS com a duração do item
                      : undefined
                  }
                >
                  {/* RENDERIZA O ÍCONE (ALVO OU DISTRATOR) CASO O SLOT ESTEJA ATIVO */}
                  {isActive && <span className="whac-icon">{icon}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── MODAL FINAL DE RESULTADOS E MINI-RANKING ── */}
      {logic.finished && (
        <div className="whac-result-box" aria-live="polite">
          <p>{logic.timeLeft > 0 ? "Concluido!" : "Tempo Esgotado!"}</p>
          <h3>Pontos Finais: {logic.score + (logic.timeLeft > 0 ? logic.timeLeft : 0)}</h3>

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
          <button className="primary" onClick={onPlayAgain}>
            Novo Jogo
          </button>
        </div>
      )}
    </div>
  );
}
