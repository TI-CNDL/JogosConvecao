import { useCallback, useEffect, useMemo, useState } from "react";
import { shuffle } from "../../utils/array";
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
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    // Remove duplicatas
    const unique = Array.from(new Set(letters));

    // Se tiver menos de 7, preenche com letras aleatórias do alfabeto
    while (unique.length < 7) {
        // Pega uma letra aleatória que não esteja na lista
        let randomLetter;
        do {
            randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (unique.includes(randomLetter));

        unique.push(randomLetter);
    }

    return shuffle(unique.slice(0, 7));
};

/**
 * Normaliza uma rodada raw da API para o formato interno.
 * Aceita tanto { letras, alvos } (formato antigo) quanto
 * { word, hint } (formato do backend Sequelize).
 */
const normalizeRound = (rawRound) => {
    if (!rawRound) return [];

    const normalizedTargets = [];

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

        for (const target of targets) {
            normalizedTargets.push({ letters, target });
        }

        return normalizedTargets;
    }

    // Formato { word, hint } (vindo do SoletraRound do Sequelize)
    if (rawRound?.word) {
        const word = normalizeText(rawRound.word);
        normalizedTargets.push({
            letters: buildHoneycomb(word.split("")),
            target: {
                palavra: word,
                dica: rawRound.hint || "Sem dica cadastrada.",
            },
        });
    }

    return normalizedTargets;
};

const buildUnitQueue = (roundData, wordLimit) => {
    const fallbackData = roundData && (roundData.exemplos || roundData.letras || roundData.word)
        ? roundData
        : DEFAULT_ROUND_DATA;

    const examples = Array.isArray(fallbackData?.exemplos) ? fallbackData.exemplos : [];
    const allUnits = examples.flatMap((example) => normalizeRound(example));

    if (allUnits.length === 0) return [];

    const safeLimit = Number.isFinite(wordLimit) && wordLimit > 0
        ? Math.min(Math.floor(wordLimit), allUnits.length)
        : Math.min(3, allUnits.length);

    return shuffle(allUnits).slice(0, safeLimit);
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
    const { timeLimitSeconds = 30, wordLimit = 3 } = settings;

    // ─── Estado da sequência ─────────────────────────────────────────
    const [sessionUnits, setSessionUnits] = useState(() =>
        buildUnitQueue(roundData, wordLimit),
    );
    const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
    const [completedUnits, setCompletedUnits] = useState(0);

    const activeUnit = sessionUnits[currentUnitIndex] ?? null;
    const letterPool = activeUnit?.letters ?? buildHoneycomb([]);
    const targets = activeUnit ? [activeUnit.target] : [];

    const targetByWord = useMemo(
        () => new Map(sessionUnits.map((unit, idx) => [unit.target.palavra, idx])),
        [sessionUnits],
    );

    // ─── Estado do jogo ──────────────────────────────────────────────
    const [typed, setTyped] = useState("");
    const [foundIndexes, setFoundIndexes] = useState(new Set());
    const [hintLevels, setHintLevels] = useState([]);
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [finished, setFinished] = useState(sessionUnits.length === 0);
    const [timedOut, setTimedOut] = useState(false);
    const [reported, setReported] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [lastAttemptColors, setLastAttemptColors] = useState(null);

    // ─── Métricas derivadas ──────────────────────────────────────────
    const currentTargetIndex = currentUnitIndex;

    const currentTarget = activeUnit?.target ?? null;

    const currentPoints = calcularPontos(
        foundIndexes.size,
        sessionUnits.length || 1,
    );

    const honeycomb = letterPool;
    const activeWordLength = currentTarget?.palavra.length ?? 7;
    const typedChars = typed.split("");

    // ─── Reset / novo jogo ───────────────────────────────────────────
    const resetUnitState = useCallback(() => {
        setTyped("");
        setLastAttemptColors(null);
    }, []);

    const resetGame = useCallback(() => {
        const nextUnits = buildUnitQueue(roundData, wordLimit);
        setSessionUnits(nextUnits);
        setCurrentUnitIndex(0);
        setCompletedUnits(0);
        setTyped("");
        setFoundIndexes(new Set());
        setHintLevels(buildHintLevels(nextUnits.length));
        setTimeLeft(timeLimitSeconds);
        setFinished(nextUnits.length === 0);
        setTimedOut(false);
        setReported(false);
        setFeedback("");
        setLastAttemptColors(null);
    }, [roundData, timeLimitSeconds, wordLimit]);

    // Reagir a mudanças nas props de configuração / dados
    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // Sincronizar o tamanho de hintLevels com sessionUnits
    useEffect(() => {
        if (sessionUnits.length > 0) {
            setHintLevels(buildHintLevels(sessionUnits.length));
        }
    }, [sessionUnits.length]);

    const advanceToNextUnit = useCallback(() => {
        setCurrentUnitIndex((prev) => prev + 1);
        resetUnitState();
    }, [resetUnitState]);

    // ─── Timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (finished || sessionUnits.length === 0) return undefined;
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
    }, [finished, sessionUnits.length]);

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

            setFeedback("Acertou!");
            setFoundIndexes((prev) => new Set([...prev, matchedIndex]));

            const nextUnitIndex = currentUnitIndex + 1;
            const hasNextUnit = nextUnitIndex < sessionUnits.length;

            if (hasNextUnit) {
                advanceToNextUnit();
            } else {
                setFinished(true);
            }
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
        currentUnitIndex,
        sessionUnits.length,
        advanceToNextUnit,
    ]);

    // ─── API pública do hook ─────────────────────────────────────────
    return {
        // Constantes
        MAX_HINTS_PER_WORD,

        // Estado da sequência (para renderizar todas as palavras)
        sessionUnits,
        currentUnitIndex,

        // Estado do jogo
        targets,
        honeycomb,
        typed,
        typedChars,
        foundIndexes,
        hintLevels,
        totalWords: sessionUnits.length,
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
