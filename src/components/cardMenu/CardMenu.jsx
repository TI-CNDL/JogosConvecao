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
  settings = [],
  onStartGame,
  interactive = true,
  defaultConfig = {},
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
    onStartGame?.({ code, title, config: defaultConfig });
  };

  return (
    <section className="CardMenu">
      <Titulo texto={title} background={false} classe="TituloCard" />

      {hasSettings ? (
        <form className="formCardMenu" onSubmit={handleSubmit}>
          {editableSettings.map((setting) => {
            const fieldId = `${code}-${setting.key}`;
            const defaultValue = formatFieldValue(
              defaultConfig[setting.key] ?? setting.value,
            );

            // If the setting defines preset select options, render a select
            if (
              Array.isArray(setting.selectOptions) &&
              setting.selectOptions.length > 0
            ) {
              return (
                <section className="formCardMenuSection" key={setting.key}>
                  <label htmlFor={fieldId} className="labelCardMenu">
                    {setting.label}
                  </label>
                  <select
                    id={fieldId}
                    name={setting.key}
                    defaultValue={
                      setting.type === "checkbox" ? undefined : defaultValue
                    }
                    className="inputCardMenu"
                  >
                    {setting.selectOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </section>
              );
            }

            return (
              <section className="formCardMenuSection" key={setting.key}>
                <label htmlFor={fieldId} className="labelCardMenu">
                  {setting.label}
                </label>
                <input
                  type={setting.type}
                  className="inputCardMenu"
                  id={fieldId}
                  name={setting.key}
                  defaultValue={
                    setting.type === "checkbox" ? undefined : defaultValue
                  }
                  defaultChecked={
                    setting.type === "checkbox"
                      ? Boolean(defaultConfig[setting.key] ?? setting.value)
                      : undefined
                  }
                  {...(setting.type === "number"
                    ? setting.numberAttributes
                    : {})}
                />
              </section>
            );
          })}
          <Button
            classe="buttonComeceAJogar"
            type="submit"
            classeTexto="textoComeceAJogar"
            texto="Começar a jogar"
          />
        </form>
      ) : (
        <Button
          classe="buttonComeceAJogar"
          type="button"
          classeTexto="textoComeceAJogar"
          texto={interactive ? "Começar a jogar" : "Em breve"}
          disabled={!interactive}
          onClick={handleStart}
        />
      )}
    </section>
  );
}
