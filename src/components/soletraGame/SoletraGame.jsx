import useSoletraGameLogic from "./useSoletraGameLogic";
import "./soletraGame.style.css";

/**
 * SoletraGame — Componente de View puro.
 *
 * Props (contrato padronizado):
 *   data             — { roundData: { exemplos: [...] } }
 *   settings         — { timeLimitSeconds, wordLimit }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar partida
 *   onRoundComplete  — Callback disparado ao encontrar todas as palavras
 *   onGameOver       — Callback disparado quando o tempo esgota
 */
export default function SoletraGame({
  data = {},
  settings = {},
  ranking = [],
  onScore,
  onRoundComplete,
  onGameOver,
}) {
  const {
    MAX_HINTS_PER_WORD,
    targets,
    honeycomb,
    typedChars,
    foundIndexes,
    hintLevels,
    activeWordLength,
    totalWords,
    timeLeft,
    finished,
    timedOut,
    feedback,
    lastAttemptColors,
    currentPoints,
    pushLetter,
    backspace,
    useHint,
    confirmWord,
    resetGame,
    buildMaskedWord,
    sessionUnits,
    currentUnitIndex,
  } = useSoletraGameLogic({
    data,
    settings,
    onScore,
    onRoundComplete,
    onGameOver,
  });

  return (
    <div className="soletra-game panel">
      {/* ── Cabeçalho ── */}
      <div className="panel-head">
        <div>
          <p className="eyebrow">Soletra</p>
          <h2>
            {finished ? "Resultado" : `Descubra as ${totalWords || 0} palavras`}
          </h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Pontos: {currentPoints}</span>
      </div>

      {/* ── Progresso das palavras ── */}
      <div className="soletra-targets" aria-label="Progresso das palavras">
        {sessionUnits.map((unit, unitIdx) => {
          const solved = foundIndexes.has(unitIdx);
          const isCurrent = unitIdx === currentUnitIndex && !solved;
          const isLocked = unitIdx > currentUnitIndex;
          const hintLevel = hintLevels[unitIdx] ?? 0;
          const revealedByTimeout = timedOut && finished;
          const unsolvedTimeout = revealedByTimeout && !solved;

          const display =
            solved || revealedByTimeout
              ? unit.target.palavra
              : buildMaskedWord(unit.target.palavra, hintLevel);

          return (
            <div
              key={`${unit.target.palavra}-${unitIdx}`}
              className={`soletra-target-row ${solved ? "solved-word" : ""} ${isCurrent ? "current-word" : ""} ${isLocked ? "locked-word" : ""}`}
            >
              <div
                className={`soletra-target-slot ${solved ? "solved" : ""} ${unsolvedTimeout ? "unsolved-timeout" : ""} ${isLocked && !revealedByTimeout ? "locked" : ""}`}
              >
                {display}
              </div>
              <button
                className="soletra-hint-btn"
                onClick={() => useHint(unitIdx)}
                disabled={
                  finished ||
                  solved ||
                  hintLevel >= MAX_HINTS_PER_WORD ||
                  isLocked
                }
                aria-label={`Dica da palavra ${unitIdx + 1}`}
                title={isLocked ? `Resolva a palavra ${unitIdx} primeiro` : ""}
              >
                💡
              </button>
              <div className="soletra-target-hint">
                {isLocked ? (
                  <span className="soletra-locked-msg">
                    Resolva a palavra anterior
                  </span>
                ) : solved ? (
                  "✓ Palavra encontrada"
                ) : isCurrent ? (
                  <span className="soletra-current-hint">
                    {unit.target.dica}
                  </span>
                ) : (
                  unit.target.dica
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Letras digitadas ── */}
      <div
        className="soletra-input"
        aria-label="Letras digitadas"
        style={{
          gridTemplateColumns: `repeat(${activeWordLength}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: activeWordLength }).map((_, idx) => {
          const letter = typedChars[idx];
          const colorClass = lastAttemptColors
            ? lastAttemptColors[idx] || ""
            : "";
          return (
            <div
              key={`slot-${idx}`}
              className={`soletra-input-slot ${colorClass}`}
            >
              {letter ?? ""}
            </div>
          );
        })}
      </div>

      {/* ── Colmeia de letras ── */}
      <div
        className="soletra-honeycomb"
        role="group"
        aria-label="Colmeia de letras"
      >
        <button
          className="soletra-hex-btn top"
          onClick={() => pushLetter(honeycomb[0])}
          disabled={finished}
        >
          {honeycomb[0]}
        </button>
        <button
          className="soletra-hex-btn top-right"
          onClick={() => pushLetter(honeycomb[1])}
          disabled={finished}
        >
          {honeycomb[1]}
        </button>
        <button
          className="soletra-hex-btn right"
          onClick={() => pushLetter(honeycomb[2])}
          disabled={finished}
        >
          {honeycomb[2]}
        </button>
        <button
          className="soletra-hex-btn bottom"
          onClick={() => pushLetter(honeycomb[3])}
          disabled={finished}
        >
          {honeycomb[3]}
        </button>
        <button
          className="soletra-hex-btn bottom-left"
          onClick={() => pushLetter(honeycomb[4])}
          disabled={finished}
        >
          {honeycomb[4]}
        </button>
        <button
          className="soletra-hex-btn left"
          onClick={() => pushLetter(honeycomb[5])}
          disabled={finished}
        >
          {honeycomb[5]}
        </button>
        <button
          className="soletra-hex-btn center"
          onClick={() => pushLetter(honeycomb[6])}
          disabled={finished}
        >
          {honeycomb[6]}
        </button>
      </div>

      {/* ── Ações ── */}
      <div className="soletra-actions">
        <button className="ghost" onClick={backspace} disabled={finished}>
          Apagar
        </button>
        <button className="primary" onClick={confirmWord} disabled={finished}>
          Enviar
        </button>
      </div>

      {/* ── Feedback ── */}
      {feedback ? <p className="soletra-feedback">{feedback}</p> : null}

      {/* ── Resultado final ── */}
      {finished && (
        <div className="soletra-result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : "Rodada concluida"}</p>
          <h3>Pontos: {currentPoints + (timedOut ? 0 : timeLeft)}</h3>
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
          <button className="primary" onClick={resetGame}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}
