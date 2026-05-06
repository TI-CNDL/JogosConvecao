import "./menuGrid.style.css";

export default function MenuGrid({
  games,
  timeLimits,
  catchInitialFallTimes,
  wordSearchWordLimits,
  wordSearchWordBounds,
  hangmanWordLengths,
  labirintoWordLengths,
  pairsLimits,
  gridSizes,
  quizQuestionBounds,
  quizQuestionLimits,
  soletraWordBounds,
  soletraWordLimits,
  onTimeLimitChange,
  onCatchInitialFallTimeChange,
  onWordSearchWordLimitChange,
  onHangmanWordLengthChange,
  onLabirintoWordLengthChange,
  onPairsChange,
  onGridSizeChange,
  onQuizLimitChange,
  onSoletraWordLimitChange,
  onOpenAdminHub,
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
              value={timeLimits?.[game.id] ?? 30}
              onChange={(e) =>
                onTimeLimitChange(game.id, Number(e.target.value))
              }
            />
          </label>
          {game.id === "catch" && (
            <label className="time-field">
              <span>Tempo inicial da queda (s)</span>
              <input
                type="number"
                min={3}
                max={30}
                step={1}
                value={catchInitialFallTimes?.[game.id] ?? 10}
                onChange={(e) =>
                  onCatchInitialFallTimeChange(game.id, Number(e.target.value))
                }
              />
            </label>
          )}
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
          {game.id === "whac" && (
            <label className="time-field">
              <span>Tamanho da grade</span>
              <select
                value={gridSizes?.[game.id] ?? 12}
                onChange={(e) =>
                  onGridSizeChange(game.id, Number(e.target.value))
                }
              >
                {[12, 16, 20, 25].map((val) => (
                  <option key={val} value={val}>
                    {val} slots
                  </option>
                ))}
              </select>
            </label>
          )}
          {game.id === "wordsearch" && (
            <>
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
              <label className="time-field">
                <span>Qtd. de palavras</span>
                <input
                  type="number"
                  min={wordSearchWordBounds?.min ?? 1}
                  max={wordSearchWordBounds?.max ?? 1}
                  step={1}
                  value={
                    wordSearchWordLimits?.[game.id] ??
                    Math.min(5, wordSearchWordBounds?.max ?? 5)
                  }
                  onChange={(e) =>
                    onWordSearchWordLimitChange(game.id, Number(e.target.value))
                  }
                  disabled={(wordSearchWordBounds?.max ?? 0) < 1}
                />
              </label>
            </>
          )}
          {game.id === "labirinto" && (
            <>
              <label className="time-field">
                <span>Tamanho do labirinto</span>
                <select
                  value={gridSizes?.[game.id] ?? 8}
                  onChange={(e) =>
                    onGridSizeChange(game.id, Number(e.target.value))
                  }
                >
                  {[8, 10].map((val) => (
                    <option key={val} value={val}>
                      {val} x {val}
                    </option>
                  ))}
                </select>
              </label>
              <label className="time-field">
                <span>Qtd. de letras</span>
                <input
                  type="number"
                  min={3}
                  max={12}
                  step={1}
                  value={labirintoWordLengths?.[game.id] ?? 5}
                  onChange={(e) =>
                    onLabirintoWordLengthChange(game.id, Number(e.target.value))
                  }
                />
              </label>
            </>
          )}
          {game.id === "quiz" && (
            <label className="time-field">
              <span>Qtd. de perguntas</span>
              <input
                type="number"
                min={quizQuestionBounds?.min ?? 0}
                max={quizQuestionBounds?.max ?? 0}
                step={1}
                value={
                  quizQuestionLimits?.[game.id] ??
                  Math.min(5, quizQuestionBounds?.max ?? 5)
                }
                onChange={(e) =>
                  onQuizLimitChange(game.id, Number(e.target.value))
                }
                disabled={(quizQuestionBounds?.max ?? 0) < 1}
              />
            </label>
          )}
          {game.id === "soletra" && (
            <label className="time-field">
              <span>Qtd. de palavras</span>
              <input
                type="number"
                min={soletraWordBounds?.min ?? 0}
                max={soletraWordBounds?.max ?? 0}
                step={1}
                value={
                  soletraWordLimits?.[game.id] ??
                  Math.min(3, soletraWordBounds?.max ?? 3)
                }
                onChange={(e) =>
                  onSoletraWordLimitChange(game.id, Number(e.target.value))
                }
                disabled={(soletraWordBounds?.max ?? 0) < 1}
              />
            </label>
          )}
          {game.id === "hangman" && (
            <label className="time-field">
              <span>Qtd. de letras</span>
              <input
                type="number"
                min={3}
                max={12}
                step={1}
                value={hangmanWordLengths?.[game.id] ?? 5}
                onChange={(e) =>
                  onHangmanWordLengthChange(game.id, Number(e.target.value))
                }
              />
            </label>
          )}
          <button className="primary" onClick={() => onSelect(game.id)}>
            Jogar agora
          </button>
        </article>
      ))}
      <article className="tile">
        <p className="eyebrow">Administração</p>
        <h3>Hub CRUD do Banco</h3>
        <p className="muted">
          Veja usuários, palavras, frases, perguntas, respostas e demais
          registros.
        </p>
        <button className="primary" onClick={onOpenAdminHub}>
          Abrir hub de dados
        </button>
      </article>
    </section>
  );
}
