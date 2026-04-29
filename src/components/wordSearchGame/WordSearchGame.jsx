import { useMemo } from "react";
import { useWordSearchLogic } from "./useWordSearchLogic";
import { calcularPontos } from "../../utils/scoring";
import "./wordSearchGame.style.css";

/**
 * Componente de renderização para Caça-palavras
 * Apenas responsável pela view, toda lógica está em useWordSearchLogic
 * @param {Object} data - Dados do jogo
 * @param {string[]} data.words - Palavras a encontrar
 * @param {Object} settings - Configurações
 * @param {number} settings.timeLimitSeconds - Tempo limite em segundos
 * @param {number} settings.gridSize - Tamanho da grade
 * @param {number} settings.maxAttempts - Max tentativas de geração
 * @param {number} settings.maxWords - Max palavras a usar
 * @param {Object} sessionScore - Contexto de placar (não usado neste componente mas disponível)
 * @param {Function} onScore - Callback quando jogo termina
 * @param {Array} ranking - Ranking para exibir ao final (retrocompatibilidade)
 */
export default function WordSearchGame({
  words = [],
  settings = {},
  sessionScore,
  onScore,
  ranking = [],
  // Retrocompatibilidade com props antigas
  timeLimitSeconds = 120,
  gridSize = null,
  maxAttempts = 50,
  maxWords = 5,
}) {
  // Mescla props antigas com novo padrão
  const normalizedSettings = useMemo(
    () => ({
      timeLimitSeconds: settings.timeLimitSeconds ?? timeLimitSeconds,
      gridSize: settings.gridSize ?? gridSize,
      maxAttempts: settings.maxAttempts ?? maxAttempts,
      maxWords: settings.maxWords ?? maxWords,
    }),
    [settings, timeLimitSeconds, gridSize, maxAttempts, maxWords],
  );

  const normalizedData = useMemo(
    () => ({
      words,
    }),
    [words],
  );

  // Consome o hook de lógica
  const logic = useWordSearchLogic(normalizedData, normalizedSettings, {
    onScore,
  });

  const gridStyle = useMemo(
    () => ({ "--ws-cols": logic.gridCols }),
    [logic.gridCols],
  );

  return (
    <div className="word-search panel" onPointerUp={logic.finishSelect}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">Caça-palavras</p>
          <h2>Encontre todas as palavras</h2>
        </div>
        <span className="pill">Tempo: {logic.timeLeft}s</span>
        <span className="pill">Pontos: {logic.score}</span>
        <span className="pill">
          {logic.found.size}/{logic.wordsFitting.length} achadas
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
        <div className="result-box" aria-live="polite">
          <p>
            {logic.noWords
              ? "Sem palavras para jogar."
              : "Não foi possível gerar a grade."}
          </p>
          <button className="primary" onClick={logic.reset}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="ws-words">
        {logic.wordsFitting.map((word) => (
          <span
            key={word}
            className={`word-chip ${logic.found.has(word) ? "done" : ""}`}
          >
            {word}
          </span>
        ))}
      </div>

      {(logic.finished || logic.timedOut) && (
        <div className="result-box" aria-live="polite">
          <p>{logic.timedOut ? "Tempo esgotado" : "Concluído"}</p>
          <p>Pontos: {logic.score}</p>
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
          <button className="primary" onClick={logic.reset}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}
