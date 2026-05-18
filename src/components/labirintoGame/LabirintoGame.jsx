import { useEffect } from "react";
import useLabirintoLogic from "./useLabirintoLogic";
import "./labirintoGame.style.css";

/**
 * Componente principal da interface do Jogo Labirinto (View).
 * Sua responsabilidade é puramente visual e de captura de eventos de usuário (clique e arraste).
 * Toda a lógica de estado, tempo, checagem de regras e geometria é delegada ao hook `useLabirintoLogic`.
 *
 * @param {Object} props — Propriedades recebidas do componente pai (App principal).
 * @param {Object} props.data — Dados do jogo, contendo a lista de palavras (`words`).
 * @param {Object} props.config — Configurações da partida (ex: `timeLimitSeconds`, `gridSize`).
 * @param {Object} props.sessionScore — Dados da pontuação da sessão atual (se houver).
 * @param {Function} props.onScore — Callback chamada ao pontuar ou finalizar a partida.
 * @param {Function} props.onRoundComplete — Callback chamada ao completar um round com sucesso.
 * @param {Function} props.onGameOver — Callback chamada quando o jogo termina por esgotamento de tempo.
 */
export default function LabirintoGame({
  data = {},
  config = {},
  sessionScore,
  onScore,
  onRoundComplete,
  onGameOver,
}) {
  // Inicializa o Custom Hook passando todas as props recebidas.
  // O hook retorna o estado atualizado e as funções de manipulação do jogo.
  const logic = useLabirintoLogic({
    data,
    config,
    sessionScore,
    onScore,
    onRoundComplete,
    onGameOver,
  });

  // Desestrutura todas as variáveis de estado, referências e métodos de ação fornecidos pelo hook.
  const {
    word,                      // A palavra atual a ser formada no labirinto
    grid,                      // Matriz bidimensional representando as células do tabuleiro
    checkpointMap,             // Mapa que associa a chave da célula (r-c) ao índice da letra na palavra
    shouldMarkFirstCheckpoint, // Flag indicando se o primeiro checkpoint deve ser destacado (início do jogo)
    boardGridSize,             // Tamanho do grid (ex: 8 para 8x8)
    progress,                  // Índice da última letra correta alcançada (-1 se nenhuma)
    trail,                     // Array de coordenadas [{r, c}] por onde o jogador já passou
    trailSet,                  // Set contendo as chaves 'r-c' da trilha para busca rápida (O(1))
    errors,                    // Contagem de erros cometidos na partida
    timeLeft,                  // Tempo restante em segundos
    finished,                  // Flag indicando se a partida foi encerrada (vitória ou derrota)
    timedOut,                  // Flag indicando se o encerramento foi por esgotamento do tempo
    hintText,                  // Texto da dica atual a ser exibida ao jogador
    boardRef,                  // Referência do DOM para o contêiner do grid (usada no ResizeObserver)
    cellSize,                  // Tamanho dinâmico calculado de cada célula em pixels
    hasRound,                  // Flag indicando se um round válido foi gerado e está pronto
    wallSegments,              // Array com as coordenadas absolutas das paredes (barreiras)
    trailSegments,             // Array com as coordenadas absolutas das linhas de conexão do rastro
    collectedLetters,          // Array contendo as letras já coletadas pelo jogador no percurso
    timeLimitSeconds,          // Tempo total limite configurado para a partida
    startDrag,                 // Função disparada ao iniciar o toque/clique em uma célula (PointerDown)
    dragOver,                  // Função disparada ao arrastar o dedo/mouse sobre uma célula (PointerEnter)
    endDrag,                   // Função disparada ao soltar o dedo/mouse (PointerUp)
    handleClick,               // Função disparada ao clicar diretamente em uma célula (Click padrão)
    resetAttempt,              // Função para limpar o rastro atual e recomeçar a tentativa
    newGame,                   // Função para gerar um novo labirinto com outra palavra
    showHint,                  // Função para calcular e exibir uma dica de direção
    posKey,                    // Função auxiliar para gerar a chave de posição 'r-c'
  } = logic;

  // Efeito de depuração (Debug) para monitorar no console as dimensões e alinhamento do grid
  // sempre que o tamanho da célula (cellSize) for recalculado.
  useEffect(() => {
    if (boardRef.current) {
      const style = window.getComputedStyle(boardRef.current);
      console.debug(`[Labirinto V3] Grid Rendered: width=${style.width}, height=${style.height}, padding=${style.padding}, border=${style.borderWidth}`);
    }
  }, [cellSize]);

  return (
    // Contêiner principal do painel do jogo.
    // O evento onPointerUp global garante que o arraste seja encerrado mesmo se o usuário soltar o clique fora do tabuleiro.
    <div className="labirinto-panel" onPointerUp={endDrag}>
      
      {/* CABEÇALHO DO PAINEL: Exibe título, tempo restante, pontuação parcial e erros */}
      <div className="panel-head">
        <div>
          <p className="eyebrow">Labirinto</p>
          <h2>{finished ? "Resultado" : "Forme a palavra no caminho"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Pontos: {Math.floor((Math.max(0, progress + 1) / (word.length || 1)) * 100)}</span>
        <span className="pill">Erros: {errors}</span>
      </div>

      {/* BARRA DE PROGRESSO DA PALAVRA: Mostra as letras coletadas no percurso em tempo real */}
      <div className="labirinto-word-progress" aria-label="Letras ja passadas">
        {collectedLetters.length === 0 ? (
          // Exibido no início quando nenhuma letra foi alcançada ainda
          <span className="labirinto-word-progress-empty">
            A palavra vai surgir conforme a linha avança.
          </span>
        ) : (
          // Mapeia e exibe cada letra já alcançada na trilha
          collectedLetters.map((ch, idx) => (
            <span key={`wp-${idx}`} className="labirinto-word-progress-char done">
              {ch}
            </span>
          ))
        )}
      </div>

      {/* CONTROLE DE FLUXO: Se não foi possível gerar o labirinto, exibe tela de erro/tentar novamente */}
      {!hasRound ? (
        <div className="result-box">
          <p>Nao foi possivel montar o labirinto agora.</p>
          <button className="primary" onClick={newGame}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {/* CAIXA DE DICAS E INSTRUÇÕES */}
          <div className="labirinto-hint">
            Arraste com o dedo/mouse a partir da primeira letra e siga os corredores.
            {/* Se houver um texto de dica ativo, exibe em destaque */}
            {hintText ? <span className="labirinto-hint-msg"> {hintText}</span> : null}
          </div>

          {/* BOTÕES DE AÇÃO: Limpar rastro e Solicitar dica */}
          <div className="labirinto-actions">
            <button
              className="primary"
              onClick={resetAttempt}
              disabled={finished} // Desativa se o jogo já terminou
            >
              Limpar
            </button>
            <button className="primary" onClick={showHint} disabled={finished}>
              Dica
            </button>
          </div>

          {/* ÁREA DO TABULEIRO (GRID E OVERLAYS) */}
          <div className="labirinto-board" style={{ width: "100%"}}>
            
            {/* O Grid principal contendo os botões interativos */}
            <div
              ref={boardRef}
              className="labirinto-grid"
              role="grid"
              aria-label="Labirinto de letras"
              style={{
                // Define dinamicamente o número de colunas do CSS Grid com base na configuração
                gridTemplateColumns: `repeat(${boardGridSize}, minmax(0, 1fr))`,
              }}
            >
              {/* Mapeia as linhas e colunas da matriz para renderizar as células */}
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const key = posKey(r, c);
                  const isTrail = trailSet.has(key); // Verifica se a célula faz parte da trilha atual
                  const cpIndex = checkpointMap.get(key);
                  // Verifica se a célula é o checkpoint inicial da palavra
                  const isStartCheckpoint =
                    shouldMarkFirstCheckpoint &&
                    cpIndex !== undefined &&
                    cell.letter === word[0];

                  return (
                    // Botão interativo representando uma célula do labirinto
                    <button
                      key={cell.key}
                      role="gridcell"
                      className={`labirinto-cell ${isTrail ? "trail" : ""} ${isStartCheckpoint ? "checkpoint" : ""}`}
                      onPointerDown={() => startDrag(r, c)} // Inicia o arraste ao pressionar
                      onPointerEnter={() => dragOver(r, c)} // Continua o arraste ao passar por cima
                      onPointerUp={endDrag}                 // Encerra o arraste ao soltar
                      onClick={() => handleClick(r, c)}     // Suporte a clique simples
                      disabled={finished}                   // Bloqueia interações após o fim do jogo
                    >
                      {/* Caractere contido na célula (visível se preenchido, oculto se vazio) */}
                      <span className={`labirinto-cell-letter ${cell.letter ? "filled" : "empty"}`}>
                        {cell.letter}
                      </span>
                    </button>
                  );
                }),
              )}

              {/* CAMADA DE SOBREPOSIÇÃO (OVERLAY): Desenha elementos gráficos por cima dos botões */}
              <div className="labirinto-overlay" aria-hidden="true">
                
                {/* 1. Desenha as linhas que conectam as células da trilha (rastro) */}
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

                {/* 2. Desenha os nós (pontos centrais) nas interseções da trilha */}
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

                {/* 3. Desenha as paredes (barreiras físicas que impedem a passagem) */}
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

      {/* TELA DE RESULTADO FINAL: Exibida quando a partida é concluída (vitória ou tempo esgotado) */}
      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : `Palavra ${word} concluida`}</p>
          {/* Cálculo da pontuação final somando o bônus de tempo restante */}
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