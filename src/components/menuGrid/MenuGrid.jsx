import "./menuGrid.style.css";

export default function MenuGrid({
  games,
  timeLimits,
  livesLimits,
  pairsLimits,
  gridSizes,
  quizQuestionLimits,
  onTimeLimitChange,
  onLivesChange,
  onPairsChange,
  onGridSizeChange,
  onQuizLimitChange,
  onSelect,
}) {
  return (
    <section className="menu-grid">
      {games.map((game) => (
        <article key={game.id} className="tile">
          <p className="eyebrow">{game.title}</p>
          <h3>{game.description}</h3>
          <label className="time-field">
            <span>Tempo máximo (s)</span>
            <input
              type="number"
              min={30}
              max={600}
              step={10}
              value={timeLimits?.[game.id] ?? 120}
              onChange={(e) =>
                onTimeLimitChange(game.id, Number(e.target.value))
              }
            />
          </label>
          <label className="time-field">
            <span>Vidas</span>
            <input
              type="number"
              min={1}
              max={9}
              step={1}
              value={livesLimits?.[game.id] ?? 3}
              onChange={(e) => onLivesChange(game.id, Number(e.target.value))}
            />
          </label>
          {game.id === "memory" && (
            <label className="time-field">
              <span>Pares de cartas</span>
              <select
                value={pairsLimits?.[game.id] ?? 6}
                onChange={(e) => onPairsChange(game.id, Number(e.target.value))}
              >
                {[4, 6, 8, 10, 12].map((val) => (
                  <option key={val} value={val}>
                    {val} pares
                  </option>
                ))}
              </select>
            </label>
          )}
          {game.id === "wordsearch" && (
            <label className="time-field">
              <span>Tamanho da grade</span>
              <select
                value={gridSizes?.[game.id] ?? 10}
                onChange={(e) =>
                  onGridSizeChange(game.id, Number(e.target.value))
                }
              >
                {[5, 8, 10, 12].map((val) => (
                  <option key={val} value={val}>
                    {val} x {val}
                  </option>
                ))}
              </select>
            </label>
          )}
          {game.id === "quiz" && (
            <label className="time-field">
              <span>Qtd. de perguntas</span>
              <select
                value={quizQuestionLimits?.[game.id] ?? 5}
                onChange={(e) =>
                  onQuizLimitChange(game.id, Number(e.target.value))
                }
              >
                {[3, 5, 7, 10].map((val) => (
                  <option key={val} value={val}>
                    {val} perguntas
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="primary" onClick={() => onSelect(game.id)}>
            Jogar agora
          </button>
        </article>
      ))}
    </section>
  );
}
