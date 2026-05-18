import { Button } from "../componentsTag/button";
import { Titulo } from "../titulo/Titulo";
import "./card.styles.css";

const LABEL_BY_KEY = {
  timeLimitSeconds: "Tempo máximo",
  timeLimit: "Tempo máximo",
  pairCount: "Quantidade de pares",
  pairs: "Quantidade de pares",
  wordLimit: "Quantidade de palavras",
  wordCount: "Quantidade de palavras",
  questionLimit: "Quantidade de perguntas",
  questionCount: "Quantidade de perguntas",
  gridSize: "Tamanho do grid",
  maxAttempts: "Tentativas máximas",
  maxLives: "Vidas máximas",
  initialFallTimeSeconds: "Tempo inicial de queda",
  seed: "Semente",
};

const NUMBER_KEYS = new Set([
  "timeLimitSeconds",
  "timeLimit",
  "pairCount",
  "pairs",
  "wordLimit",
  "wordCount",
  "questionLimit",
  "questionCount",
  "gridSize",
  "maxAttempts",
  "maxLives",
  "initialFallTimeSeconds",
  "hangmanWordLength",
  "labirintoWordLength",
]);

const normalizeKey = (key) => {
  const raw = String(key ?? "").trim();
  if (raw === "timeLimit" || raw === "timeLimitSeconds")
    return "timeLimitSeconds";
  if (raw === "pairs" || raw === "pairCount") return "pairCount";
  if (raw === "wordCount" || raw === "wordLimit") return "wordLimit";
  if (raw === "questionCount" || raw === "questionLimit")
    return "questionLimit";
  if (raw === "grid" || raw === "gridSize") return "gridSize";
  if (raw === "attempts" || raw === "maxAttempts") return "maxAttempts";
  if (raw === "lives" || raw === "maxLives") return "maxLives";
  if (raw === "initialFallTime" || raw === "initialFallTimeSeconds")
    return "initialFallTimeSeconds";
  return raw;
};

const humanizeKey = (key) => {
  const normalized = normalizeKey(key);
  return (
    LABEL_BY_KEY[normalized] ?? normalized.replace(/([a-z])([A-Z])/g, "$1 $2")
  );
};

const parseValue = (key, value) => {
  if (value === null || value === undefined || value === "") return value;

  if (typeof value === "number" || NUMBER_KEYS.has(normalizeKey(key))) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed !== "" && /^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) return parsed;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
};

const formatFieldValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
};

const getInputType = (key, value) => {
  if (typeof value === "boolean") return "checkbox";
  if (NUMBER_KEYS.has(normalizeKey(key))) return "number";
  return "text";
};

const getNumberAttributes = (key) => {
  const normalized = normalizeKey(key);

  if (normalized === "timeLimitSeconds") {
    return { min: 10, max: 600, step: 10 };
  }

  if (normalized === "pairCount") {
    return { min: 2, max: 20, step: 1 };
  }

  if (normalized === "wordLimit" || normalized === "questionLimit") {
    return { min: 1, max: 50, step: 1 };
  }

  if (normalized === "gridSize") {
    return { min: 4, max: 20, step: 1 };
  }

  if (normalized === "maxAttempts") {
    return { min: 1, max: 999, step: 1 };
  }

  if (normalized === "maxLives") {
    return { min: 1, max: 20, step: 1 };
  }

  if (normalized === "initialFallTimeSeconds") {
    return { min: 1, max: 60, step: 1 };
  }

  return { step: 1 };
};

export function CardMenu({
  title,
  code,
  gameId,
  settings = [],
  onStartGame,
  interactive = true,
  defaultConfig = {},
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
}) {
  const hasSettings = settings.length > 0;

  // Preset select options per game and key
  const PRESET_OPTIONS = {
    wordsearch: {
      gridSize: [5, 8, 10],
    },
    labirinto: {
      gridSize: [8, 10],
      labirintoWordLength: [3, 4, 5, 6, 7],
    },
    whac: {
      gridSize: [8, 10, 12, 14],
    },
    hangman: {
      hangmanWordLength: [3, 4, 5, 6, 7, 8, 9, 10],
    },
  };

  const editableSettings = settings.map((setting) => {
    const key = normalizeKey(setting.key);
    const value = defaultConfig[key] ?? setting.value ?? "";

    const presetForGame = PRESET_OPTIONS[code] ?? {};
    const selectOptions = presetForGame[key] ?? null;

    return {
      key,
      label: setting.label ?? humanizeKey(setting.key),
      value,
      type: getInputType(setting.key, value),
      numberAttributes: getNumberAttributes(setting.key),
      selectOptions,
    };
  });

  const buildPayloadConfig = (formData) => {
    if (!hasSettings) {
      return defaultConfig;
    }

    return editableSettings.reduce((acc, setting) => {
      const rawValue = formData?.get(setting.key);
      const fallbackValue = defaultConfig[setting.key] ?? setting.value;
      const resolvedValue =
        rawValue === null || rawValue === undefined || rawValue === ""
          ? fallbackValue
          : rawValue;

      acc[setting.key] = parseValue(setting.key, resolvedValue);
      return acc;
    }, {});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      code,
      title,
      config: buildPayloadConfig(formData),
    };
    onStartGame?.(payload);
  };

  const handleStart = () => {
    const currentConfig = { ...defaultConfig };

    if (timeLimits?.[gameId] !== undefined) currentConfig.timeLimitSeconds = timeLimits[gameId];
    if (catchInitialFallTimes?.[gameId] !== undefined) currentConfig.initialFallTimeSeconds = catchInitialFallTimes[gameId];
    if (pairsLimits?.[gameId] !== undefined) currentConfig.pairCount = pairsLimits[gameId];
    
    if (gridSizes?.[gameId] !== undefined) {
      currentConfig.gridSize = gridSizes[gameId];
    } else {
      if (code === "labirinto") currentConfig.gridSize = 8;
      else if (code === "wordsearch") currentConfig.gridSize = 10;
      else if (code === "whac") currentConfig.gridSize = 12;
      else currentConfig.gridSize = 12;
    }

    if (wordSearchWordLimits?.[gameId] !== undefined) currentConfig.wordLimit = wordSearchWordLimits[gameId];
    if (hangmanWordLengths?.[gameId] !== undefined) currentConfig.hangmanWordLength = hangmanWordLengths[gameId];
    if (labirintoWordLengths?.[gameId] !== undefined) currentConfig.labirintoWordLength = labirintoWordLengths[gameId];
    if (quizQuestionLimits?.[gameId] !== undefined) currentConfig.questionLimit = quizQuestionLimits[gameId];
    if (soletraWordLimits?.[gameId] !== undefined) currentConfig.soletraWordLimit = soletraWordLimits[gameId];

    onStartGame?.({ code, title, config: currentConfig });
  };

  return (
    <section className="CardMenu">
      <Titulo texto={title} background={false} classe="TituloCard" />

      <form className="formCardMenu" onSubmit={handleSubmit}>
        {/* CONFIGURAÇÃO GLOBAL DE TEMPO MÁXIMO */}
        <section className="formCardMenuSection">
          <label htmlFor={`${code}-timeLimit`} className="labelCardMenu">
            Tempo máximo (s)
          </label>
          <input
            type="number"
            className="inputCardMenu"
            id={`${code}-timeLimit`}
            min={30}
            max={600}
            step={10}
            value={timeLimits?.[gameId] ?? 30}
            onChange={(e) =>
              onTimeLimitChange?.(gameId, Number(e.target.value))
            }
          />
        </section>

        {/* CONFIGURAÇÕES ESPECÍFICAS: CESTA DE OFERTAS (catch) */}
        {code === "catch" && (
          <section className="formCardMenuSection">
            <label htmlFor={`${code}-fallTime`} className="labelCardMenu">
              Tempo inicial da queda (s)
            </label>
            <input
              type="number"
              className="inputCardMenu"
              id={`${code}-fallTime`}
              min={3}
              max={30}
              step={1}
              value={catchInitialFallTimes?.[gameId] ?? 10}
              onChange={(e) =>
                onCatchInitialFallTimeChange?.(gameId, Number(e.target.value))
              }
            />
          </section>
        )}

        {/* CONFIGURAÇÕES ESPECÍFICAS: JOGO DA MEMÓRIA (memory) */}
        {code === "memory" && (
          <section className="formCardMenuSection">
            <label htmlFor={`${code}-pairs`} className="labelCardMenu">
              Pares de cartas
            </label>
            <select
              id={`${code}-pairs`}
              className="inputCardMenu"
              value={pairsLimits?.[gameId] ?? 6}
              onChange={(e) => onPairsChange?.(gameId, Number(e.target.value))}
            >
              {[4, 6, 8, 10, 12].map((val) => (
                <option key={val} value={val}>
                  {val} pares
                </option>
              ))}
            </select>
          </section>
        )}

        {/* CONFIGURAÇÕES ESPECÍFICAS: ACERTE O ALVO (whac) */}
        {code === "whac" && (
          <section className="formCardMenuSection">
            <label htmlFor={`${code}-gridSize`} className="labelCardMenu">
              Tamanho da grade
            </label>
            <select
              id={`${code}-gridSize`}
              className="inputCardMenu"
              value={gridSizes?.[gameId] ?? 12}
              onChange={(e) =>
                onGridSizeChange?.(gameId, Number(e.target.value))
              }
            >
              {[12, 16, 20, 25].map((val) => (
                <option key={val} value={val}>
                  {val} slots
                </option>
              ))}
            </select>
          </section>
        )}

        {/* CONFIGURAÇÕES ESPECÍFICAS: CAÇA-PALAVRAS (wordsearch) */}
        {code === "wordsearch" && (
          <>
            <section className="formCardMenuSection">
              <label htmlFor={`${code}-gridSize`} className="labelCardMenu">
                Tamanho da grade
              </label>
              <select
                id={`${code}-gridSize`}
                className="inputCardMenu"
                value={gridSizes?.[gameId] ?? 10}
                onChange={(e) =>
                  onGridSizeChange?.(gameId, Number(e.target.value))
                }
              >
                {[5, 8, 10, 12].map((val) => (
                  <option key={val} value={val}>
                    {val} x {val}
                  </option>
                ))}
              </select>
            </section>
            <section className="formCardMenuSection">
              <label htmlFor={`${code}-wordLimit`} className="labelCardMenu">
                Qtd. de palavras
              </label>
              <input
                type="number"
                className="inputCardMenu"
                id={`${code}-wordLimit`}
                min={wordSearchWordBounds?.min ?? 1}
                max={wordSearchWordBounds?.max ?? 1}
                step={1}
                value={
                  wordSearchWordLimits?.[gameId] ??
                  Math.min(5, wordSearchWordBounds?.max ?? 5)
                }
                onChange={(e) =>
                  onWordSearchWordLimitChange?.(gameId, Number(e.target.value))
                }
                disabled={(wordSearchWordBounds?.max ?? 0) < 1}
              />
            </section>
          </>
        )}

        {/* CONFIGURAÇÕES ESPECÍFICAS: LABIRINTO (labirinto) */}
        {code === "labirinto" && (
          <>
            <section className="formCardMenuSection">
              <label
                htmlFor={`${code}-labirintoSize`}
                className="labelCardMenu"
              >
                Tamanho do labirinto
              </label>
              <select
                id={`${code}-labirintoSize`}
                className="inputCardMenu"
                value={gridSizes?.[gameId] ?? 8}
                onChange={(e) =>
                  onGridSizeChange?.(gameId, Number(e.target.value))
                }
              >
                {[8, 10].map((val) => (
                  <option key={val} value={val}>
                    {val} x {val}
                  </option>
                ))}
              </select>
            </section>
            <section className="formCardMenuSection">
              <label htmlFor={`${code}-wordLength`} className="labelCardMenu">
                Qtd. de letras
              </label>
              <input
                type="number"
                className="inputCardMenu"
                id={`${code}-wordLength`}
                min={3}
                max={12}
                step={1}
                value={labirintoWordLengths?.[gameId] ?? 5}
                onChange={(e) =>
                  onLabirintoWordLengthChange?.(gameId, Number(e.target.value))
                }
              />
            </section>
          </>
        )}

        {/* CONFIGURAÇÕES ESPECÍFICAS: QUIZ (quiz) */}
        {code === "quiz" && (
          <section className="formCardMenuSection">
            <label htmlFor={`${code}-questionLimit`} className="labelCardMenu">
              Qtd. de perguntas
            </label>
            <input
              type="number"
              className="inputCardMenu"
              id={`${code}-questionLimit`}
              min={quizQuestionBounds?.min ?? 0}
              max={quizQuestionBounds?.max ?? 0}
              step={1}
              value={
                quizQuestionLimits?.[gameId] ??
                Math.min(5, quizQuestionBounds?.max ?? 5)
              }
              onChange={(e) =>
                onQuizLimitChange?.(gameId, Number(e.target.value))
              }
              disabled={(quizQuestionBounds?.max ?? 0) < 1}
            />
          </section>
        )}

        {/* CONFIGURAÇÕES ESPECÍFICAS: SOLETRA (soletra) */}
        {code === "soletra" && (
          <section className="formCardMenuSection">
            <label
              htmlFor={`${code}-soletraWordLimit`}
              className="labelCardMenu"
            >
              Qtd. de palavras
            </label>
            <input
              type="number"
              className="inputCardMenu"
              id={`${code}-soletraWordLimit`}
              min={soletraWordBounds?.min ?? 0}
              max={soletraWordBounds?.max ?? 0}
              step={1}
              value={
                soletraWordLimits?.[gameId] ??
                Math.min(3, soletraWordBounds?.max ?? 3)
              }
              onChange={(e) =>
                onSoletraWordLimitChange?.(gameId, Number(e.target.value))
              }
              disabled={(soletraWordBounds?.max ?? 0) < 1}
            />
          </section>
        )}

        {/* CONFIGURAÇÕES ESPECÍFICAS: FORCA (hangman) */}
        {code === "hangman" && (
          <section className="formCardMenuSection">
            <label htmlFor={`${code}-hangmanLength`} className="labelCardMenu">
              Qtd. de letras
            </label>
            <input
              type="number"
              className="inputCardMenu"
              id={`${code}-hangmanLength`}
              min={3}
              max={12}
              step={1}
              value={hangmanWordLengths?.[gameId] ?? 5}
              onChange={(e) =>
                onHangmanWordLengthChange?.(gameId, Number(e.target.value))
              }
            />
          </section>
        )}

        {/* CAMPOS GENÉRICOS REMOVIDOS: Mantém apenas as configurações nativas do código */}

        <Button
          classe="buttonComeceAJogar"
          type="button"
          classeTexto="textoComeceAJogar"
          texto={interactive ? "Começar a jogar" : "Em breve"}
          disabled={!interactive}
          onClick={handleStart}
        />
      </form>
    </section>
  );
}
