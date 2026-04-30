import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeText } from "../../utils/string";
import { calcularPontos } from "../../utils/scoring";

const MAX_HINTS_PER_WORD = 3;

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

// ─── Funções utilitárias internas ────────────────────────────────

const sortLetters = (word) => normalizeText(word).split("").sort().join("");

const buildHoneycomb = (letters) => {
    const fallback = ["A", "B", "C", "D", "E", "F", "G"];
    const safe = [...letters];
    while (safe.length < 7) safe.push(fallback[safe.length]);
    return safe.slice(0, 7);
};

/**
 * Normaliza uma rodada raw da API para o formato interno.
 * Aceita tanto { letras, alvos } (formato antigo) quanto
 * { word, hint } (formato do backend Sequelize).
 */
const normalizeRound = (rawRound) => {
    // Formato { letras, alvos } (exemplos inline)
    if (rawRound?.letras || rawRound?.alvos) {
        const letters = buildHoneycomb(
            (rawRound?.letras ?? []).map(normalizeText),
        );
        const targets = (rawRound?.alvos ?? [])
            .slice(0, 3)
            .map((item) => ({
                palavra: normalizeText(item.palavra),
                dica: item.dica || "Sem dica cadastrada.",
            }))
            .filter((item) => item.palavra.length > 0);
        return { letters, targets };
    }

    // Formato { word, hint } (vindo do SoletraRound do Sequelize)
    if (rawRound?.word) {
        const word = normalizeText(rawRound.word);
        const letters = buildHoneycomb(word.split(""));
        const targets = [
            {
                palavra: word,
                dica: rawRound.hint || "Sem dica cadastrada.",
            },
        ];
        return { letters, targets };
    }

    // Fallback
    const letters = buildHoneycomb([]);
    return { letters, targets: [] };
};

const pickRoundFromData = (roundData) => {
    const fallbackData = roundData && (roundData.exemplos || roundData.letras || roundData.word)
        ? roundData
        : DEFAULT_ROUND_DATA;

    const examples = Array.isArray(fallbackData?.exemplos) ? fallbackData.exemplos : [];
    if (examples.length > 0) {
        const randomIdx = Math.floor(Math.random() * examples.length);
        return normalizeRound(examples[randomIdx]);
    }
    return normalizeRound(fallbackData);
};

const buildHintLevels = (count) => Array.from({ length: count }, () => 0);

const buildMaskedWord = (word, hintLevel) => {
    const revealed = Math.min(Math.max(hintLevel, 0), MAX_HINTS_PER_WORD);
    const prefix = word.slice(0, revealed);
    const suffix = "_".repeat(Math.max(0, word.length - revealed));
    return `${prefix}${suffix}`;
};

const getLetterColors = (userWord, targetWord) => {
    const normalized = normalizeText(userWord);
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

/**
 * Hook que encapsula toda a lógica do Jogo Soletra.
 *
 * Contrato de entrada:
 *   data     — { roundData: { exemplos: [...] } }  conteúdo vindo da API
 *   settings — { timeLimitSeconds }  configurações da partida
 *
 * Contrato de saída (callbacks):
 *   onScore(payload)      — disparado quando a partida termina
 *   onRoundComplete()     — disparado ao encontrar todas as palavras
 *   onGameOver(payload)   — disparado quando o tempo esgota
 */
export default function useSoletraGameLogic({
    data = {},
    settings = {},
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const { roundData = DEFAULT_ROUND_DATA } = data;
    const { timeLimitSeconds = 30 } = settings;

    // ─── Estado da rodada ────────────────────────────────────────────
    const [activeRound, setActiveRound] = useState(() =>
        pickRoundFromData(roundData),
    );

    const letterPool = activeRound.letters;
    const targets = activeRound.targets;

    const targetByWord = useMemo(
        () => new Map(targets.map((item, idx) => [item.palavra, idx])),
        [targets],
    );

    // ─── Estado do jogo ──────────────────────────────────────────────
    const [typed, setTyped] = useState("");
    const [foundIndexes, setFoundIndexes] = useState(new Set());
    const [hintLevels, setHintLevels] = useState(
        buildHintLevels(targets.length),
    );
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [finished, setFinished] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [reported, setReported] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [lastAttemptColors, setLastAttemptColors] = useState(null);

    // ─── Métricas derivadas ──────────────────────────────────────────
    const currentTargetIndex = useMemo(
        () => targets.findIndex((_, idx) => !foundIndexes.has(idx)),
        [targets, foundIndexes],
    );

    const currentTarget =
        currentTargetIndex >= 0 && currentTargetIndex < targets.length
            ? targets[currentTargetIndex]
            : null;

    const currentPoints = calcularPontos(
        foundIndexes.size,
        targets.length || 1,
    );

    const honeycomb = buildHoneycomb(letterPool);
    const activeWordLength = currentTarget?.palavra.length ?? 7;
    const typedChars = typed.split("");

    // ─── Reset / novo jogo ───────────────────────────────────────────
    const resetRoundState = useCallback(
        (nextRound) => {
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
        },
        [timeLimitSeconds],
    );

    const resetGame = useCallback(() => {
        resetRoundState(pickRoundFromData(roundData));
    }, [roundData, resetRoundState]);

    // Reagir a mudanças nas props de configuração / dados
    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // ─── Timer ───────────────────────────────────────────────────────
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

    // ─── Detectar vitória ────────────────────────────────────────────
    useEffect(() => {
        if (
            targets.length > 0 &&
            foundIndexes.size === targets.length &&
            !finished
        ) {
            setFinished(true);
            setFeedback("Palavras concluidas.");
        }
    }, [foundIndexes, targets, finished]);

    // ─── Reportar pontuação ──────────────────────────────────────────
    useEffect(() => {
        if (!finished || reported) return;

        const payload = {
            game: "Soletra",
            score: currentPoints,
            points: currentPoints,
            remainingSeconds: timeLeft,
            timedOut,
        };

        onScore?.(payload);

        if (timedOut) {
            onGameOver?.(payload);
        } else {
            onRoundComplete?.(payload);
        }

        setReported(true);
    }, [
        finished,
        reported,
        onScore,
        onRoundComplete,
        onGameOver,
        currentPoints,
        timeLeft,
        timedOut,
    ]);

    // ─── Ações ───────────────────────────────────────────────────────
    const pushLetter = useCallback(
        (letter) => {
            if (finished) return;
            setTyped((prev) => `${prev}${letter}`);
            setFeedback("");
            setLastAttemptColors(null);
        },
        [finished],
    );

    const backspace = useCallback(() => {
        if (finished) return;
        setTyped((prev) => prev.slice(0, -1));
        setFeedback("");
        setLastAttemptColors(null);
    }, [finished]);

    const useHint = useCallback(
        (index) => {
            if (finished) return;
            if (foundIndexes.has(index)) return;
            if (hintLevels[index] >= MAX_HINTS_PER_WORD) return;
            if (index > 0 && !foundIndexes.has(index - 1)) return;

            setHintLevels((prev) => {
                const next = [...prev];
                next[index] = Math.min(MAX_HINTS_PER_WORD, next[index] + 1);
                return next;
            });
        },
        [finished, foundIndexes, hintLevels],
    );

    const confirmWord = useCallback(() => {
        if (finished) return;
        const word = normalizeText(typed);
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
                setLastAttemptColors(
                    getLetterColors(word, currentTarget.palavra),
                );
                return;
            }

            setFoundIndexes((prev) => new Set(prev).add(matchedIndex));
            setTyped("");
            setFeedback("Acertou!");
            setLastAttemptColors(null);
            return;
        }

        const colors = getLetterColors(word, currentTarget.palavra);
        setLastAttemptColors(colors);

        const wrongOrder =
            sortLetters(currentTarget.palavra) === sortLetters(word);
        if (wrongOrder) {
            setFeedback(
                "Letras validas, mas a ordem da palavra esta incorreta.",
            );
        } else {
            setFeedback("Palavra nao corresponde ao alvo atual.");
        }
    }, [
        finished,
        typed,
        letterPool,
        currentTarget,
        targetByWord,
        foundIndexes,
        currentTargetIndex,
    ]);

    // ─── API pública do hook ─────────────────────────────────────────
    return {
        // Constantes
        MAX_HINTS_PER_WORD,

        // Estado do jogo
        targets,
        honeycomb,
        typed,
        typedChars,
        foundIndexes,
        hintLevels,
        currentTargetIndex,
        currentTarget,
        activeWordLength,
        timeLeft,
        finished,
        timedOut,
        feedback,
        lastAttemptColors,

        // Métricas
        currentPoints,

        // Ações
        pushLetter,
        backspace,
        useHint,
        confirmWord,
        resetGame,

        // Utilitários para a view
        buildMaskedWord,
    };
}
