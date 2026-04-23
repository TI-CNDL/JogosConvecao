import { useEffect, useMemo, useState } from "react";
import "./soletraGame.style.css";

const DEFAULT_ROUND_DATA = {
  exemplos: [
    {
      letras: ["L", "O", "G", "I", "S", "T", "A"],
      alvos: [
        {
          palavra: "LOGISTA",
          dica: "Profissional que organiza operacoes de transporte e distribuicao.",
        },
        {
          palavra: "SOLO",
          dica: "Modo individual de operacao, com foco em uma unica pessoa.",
        },
        {
          palavra: "SIGLA",
          dica: "Abreviacao comum em termos tecnicos do varejo.",
        },
      ],
    },
  ],
};

const MAX_HINTS_PER_WORD = 3;

const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
};

const normalize = (value) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const sortLetters = (word) => normalize(word).split("").sort().join("");

const buildHoneycomb = (letters) => {
  const fallback = ["A", "B", "C", "D", "E", "F", "G"];
  const safe = [...letters];
  while (safe.length < 7) safe.push(fallback[safe.length]);
  return safe.slice(0, 7);
};

const normalizeRound = (rawRound) => {
  const letters = buildHoneycomb((rawRound?.letras ?? []).map(normalize));
  const targets = (rawRound?.alvos ?? [])
    .slice(0, 3)
    .map((item) => ({
      palavra: normalize(item.palavra),
      dica: item.dica || "Sem dica cadastrada.",
    }))
    .filter((item) => item.palavra.length > 0);

  return { letters, targets };
};

const pickRoundFromData = (roundData) => {
  const examples = Array.isArray(roundData?.exemplos) ? roundData.exemplos : [];
  if (examples.length > 0) {
    const randomIdx = Math.floor(Math.random() * examples.length);
    return normalizeRound(examples[randomIdx]);
  }
  return normalizeRound(roundData);
};

const buildHintLevels = (count) => Array.from({ length: count }, () => 0);

const buildMaskedWord = (word, hintLevel) => {
  const revealed = Math.min(Math.max(hintLevel, 0), MAX_HINTS_PER_WORD);
  const prefix = word.slice(0, revealed);
  const suffix = "_".repeat(Math.max(0, word.length - revealed));
  return `${prefix}${suffix}`;
};

const getLetterColors = (userWord, targetWord) => {
  const normalized = normalize(userWord);
  const colors = [];

  for (let i = 0; i < normalized.length; i++) {
    const letter = normalized[i];
    const isCorrectPosition = targetWord[i] === letter;
    const exists = targetWord.includes(letter);

    if (isCorrectPosition) {
      colors.push("correct");
    } else if (exists) {
      colors.push("exists");
    } else {
      colors.push("wrong");
    }
  }

  return colors;
};

export default function SoletraGame({
  onScore,
  timeLimitSeconds = 120,
  ranking = [],
  roundData = DEFAULT_ROUND_DATA,
}) {
  const [activeRound, setActiveRound] = useState(() =>
    pickRoundFromData(roundData),
  );

  const letterPool = activeRound.letters;
  const targets = activeRound.targets;

  const targetByWord = useMemo(
    () => new Map(targets.map((item, idx) => [item.palavra, idx])),
    [targets],
  );

  const [typed, setTyped] = useState("");
  const [foundIndexes, setFoundIndexes] = useState(new Set());
  const [hintLevels, setHintLevels] = useState(buildHintLevels(targets.length));
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [lastAttemptColors, setLastAttemptColors] = useState(null);

  const currentTargetIndex = useMemo(
    () => targets.findIndex((_, idx) => !foundIndexes.has(idx)),
    [targets, foundIndexes],
  );

  const currentTarget =
    currentTargetIndex >= 0 && currentTargetIndex < targets.length
      ? targets[currentTargetIndex]
      : null;

  const resetRoundState = (nextRound) => {
    setActiveRound(nextRound);
    setTyped("");
    setFoundIndexes(new Set());
    setHintLevels(buildHintLevels(nextRound.targets.length));
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
    setTimedOut(false);
    setReported(false);
    setFeedback("");
    setLastAttemptColors(null);
  };

  useEffect(() => {
    resetRoundState(pickRoundFromData(roundData));
  }, [timeLimitSeconds, roundData]);

  useEffect(() => {
    if (finished) return undefined;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (
      targets.length > 0 &&
      foundIndexes.size === targets.length &&
      !finished
    ) {
      setFinished(true);
      setFeedback("Palavras concluidas.");
    }
  }, [foundIndexes, targets, finished, roundData]);

  useEffect(() => {
    if (finished && !reported) {
      const partialPoints = calcularPontos(
        foundIndexes.size,
        targets.length || 1,
      );
      onScore?.({
        game: "Soletra",
        score: partialPoints,
        points: partialPoints,
        remainingSeconds: timeLeft,
        timedOut,
      });
      setReported(true);
    }
  }, [finished, reported, onScore, foundIndexes, targets, timeLeft, timedOut]);

  const pushLetter = (letter) => {
    if (finished) return;
    setTyped((prev) => `${prev}${letter}`);
    setFeedback("");
    setLastAttemptColors(null);
  };

  const backspace = () => {
    if (finished) return;
    setTyped((prev) => prev.slice(0, -1));
    setFeedback("");
    setLastAttemptColors(null);
  };

  const useHint = (index) => {
    if (finished) return;
    if (foundIndexes.has(index)) return;
    if (hintLevels[index] >= MAX_HINTS_PER_WORD) return;
    // Bloqueia se a palavra anterior não foi encontrada
    if (index > 0 && !foundIndexes.has(index - 1)) return;

    setHintLevels((prev) => {
      const next = [...prev];
      next[index] = Math.min(MAX_HINTS_PER_WORD, next[index] + 1);
      return next;
    });
  };

  const confirmWord = () => {
    if (finished) return;
    const word = normalize(typed);
    if (!word) {
      setFeedback("Digite uma palavra antes de enviar.");
      return;
    }

    const isAllowedChars = word
      .split("")
      .every((letter) => letterPool.includes(letter));

    if (!isAllowedChars) {
      setFeedback("A palavra usa letra que nao esta na colmeia.");
      setLastAttemptColors(null);
      return;
    }

    if (!currentTarget) {
      setFeedback("Nenhuma palavra ativa para validar.");
      setLastAttemptColors(null);
      return;
    }

    const matchedIndex = targetByWord.get(word);
    if (matchedIndex !== undefined) {
      if (foundIndexes.has(matchedIndex)) {
        setFeedback("Essa palavra ja foi encontrada.");
        setLastAttemptColors(null);
        return;
      }

      if (matchedIndex !== currentTargetIndex) {
        setFeedback("Resolva a palavra atual antes da proxima.");
        setLastAttemptColors(getLetterColors(word, currentTarget.palavra));
        return;
      }

      setFoundIndexes((prev) => new Set(prev).add(matchedIndex));
      setTyped("");
      setFeedback("Acertou!");
      setLastAttemptColors(null);
      return;
    }

    // Acerto parcial - mostra cores no input apenas da palavra ativa
    const colors = getLetterColors(word, currentTarget.palavra);
    setLastAttemptColors(colors);

    const wrongOrder = sortLetters(currentTarget.palavra) === sortLetters(word);
    if (wrongOrder) {
      setFeedback("Letras validas, mas a ordem da palavra esta incorreta.");
    } else {
      setFeedback("Palavra nao corresponde ao alvo atual.");
    }
  };

  const reset = () => {
    resetRoundState(pickRoundFromData(roundData));
  };

  const typedChars = typed.split("");
  const honey = buildHoneycomb(letterPool);
  const activeWordLength = currentTarget?.palavra.length ?? 7;

  return (
    <div className="soletra panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Soletra</p>
          <h2>{finished ? "Resultado" : "Descubra as 3 palavras"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">
          Pontos: {calcularPontos(foundIndexes.size, targets.length || 1)}
        </span>
      </div>

      <div className="soletra-targets" aria-label="Progresso das palavras">
        {targets.map((target, idx) => {
          const solved = foundIndexes.has(idx);
          const hintLevel = hintLevels[idx] ?? 0;
          const isLocked = idx > 0 && !foundIndexes.has(idx - 1);

          const display = solved
            ? target.palavra
            : buildMaskedWord(target.palavra, hintLevel);

          return (
            <div key={`${target.palavra}-${idx}`} className="target-row">
              <div
                className={`target-slot ${solved ? "solved" : ""} ${isLocked ? "locked" : ""}`}
              >
                {display}
              </div>
              <button
                className="hint-btn"
                onClick={() => useHint(idx)}
                disabled={
                  finished ||
                  solved ||
                  hintLevel >= MAX_HINTS_PER_WORD ||
                  isLocked
                }
                aria-label={`Dica da palavra ${idx + 1}`}
                title={isLocked ? `Resolva a palavra ${idx} primeiro` : ""}
              >
                Lampada
              </button>
              <div className="target-hint">
                {isLocked ? (
                  <span className="locked-msg">Resolva a palavra anterior</span>
                ) : solved ? (
                  "Palavra encontrada"
                ) : (
                  target.dica
                )}
              </div>
            </div>
          );
        })}
      </div>

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
            <div key={`slot-${idx}`} className={`input-slot ${colorClass}`}>
              {letter ?? ""}
            </div>
          );
        })}
      </div>

      <div className="honeycomb" role="group" aria-label="Colmeia de letras">
        <button
          className="hex-btn top"
          onClick={() => pushLetter(honey[0])}
          disabled={finished}
        >
          {honey[0]}
        </button>
        <button
          className="hex-btn top-right"
          onClick={() => pushLetter(honey[1])}
          disabled={finished}
        >
          {honey[1]}
        </button>
        <button
          className="hex-btn right"
          onClick={() => pushLetter(honey[2])}
          disabled={finished}
        >
          {honey[2]}
        </button>
        <button
          className="hex-btn bottom"
          onClick={() => pushLetter(honey[3])}
          disabled={finished}
        >
          {honey[3]}
        </button>
        <button
          className="hex-btn bottom-left"
          onClick={() => pushLetter(honey[4])}
          disabled={finished}
        >
          {honey[4]}
        </button>
        <button
          className="hex-btn left"
          onClick={() => pushLetter(honey[5])}
          disabled={finished}
        >
          {honey[5]}
        </button>
        <button
          className="hex-btn center"
          onClick={() => pushLetter(honey[6])}
          disabled={finished}
        >
          {honey[6]}
        </button>
      </div>

      <div className="soletra-actions">
        <button className="ghost" onClick={backspace} disabled={finished}>
          Apagar
        </button>
        <button className="primary" onClick={confirmWord} disabled={finished}>
          Enviar
        </button>
      </div>

      {feedback ? <p className="soletra-feedback">{feedback}</p> : null}

      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : "Rodada concluida"}</p>
          <p>
            Pontos: {calcularPontos(foundIndexes.size, targets.length || 1)}
          </p>
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
          <button className="primary" onClick={reset}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}
