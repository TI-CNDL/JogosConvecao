import { useCallback, useEffect, useMemo, useState } from "react";
import { generateGrid } from "../../utils/grid";
import { calcularPontos } from "../../utils/scoring";

/**
 * Hook customizado que encapsula toda a lógica do Caça-palavras
 *
 * Contrato de entrada:
 *   data     — { words: Array<string> }
 *   settings — { timeLimitSeconds, gridSize, maxAttempts, maxWords }
 *
 * Contrato de saída (callbacks):
 *   onScore(payload)      — disparado quando a partida termina
 *   onRoundComplete()     — (pode ser usado para modo infinito futuramente)
 *   onGameOver(payload)   — disparado quando o tempo esgota
 */
export default function useWordSearchLogic({
    data = {},
    settings = {},
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const { words = [] } = data;
    const {
        timeLimitSeconds = 120,
        gridSize = null,
        maxAttempts = 50,
        maxWords = null,
    } = settings;

    // Processamento de palavras
    const upperWords = useMemo(
        () => words
            .map((word) => 
                String(word ?? "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z]/g, "")
                    .toUpperCase()
            )
            .filter((w) => w.length > 0),
        [words],
    );

    const computedSize = useMemo(() => {
        if (upperWords.length === 0) return gridSize ?? 10;
        const longest = upperWords.reduce(
            (acc, word) => Math.max(acc, word.length),
            0,
        );
        return gridSize ?? Math.max(10, longest + 2);
    }, [upperWords, gridSize]);

    const wordsFitting = useMemo(() => {
        const fitting = upperWords.filter((word) => word.length <= computedSize);
        const shuffled = [...fitting].sort(() => Math.random() - 0.5);
        const unique = [...new Set(shuffled)];
        return maxWords ? unique.slice(0, maxWords) : unique;
    }, [upperWords, computedSize, maxWords]);

    const noWords = wordsFitting.length === 0;

    // Chave para forçar remount interno se necessário
    const [generationKey, setGenerationKey] = useState(0);

    // Estado do jogo
    const [grid, setGrid] = useState(() =>
        noWords ? null : generateGrid(wordsFitting, computedSize, maxAttempts),
    );
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState([]);
    const [direction, setDirection] = useState(null);
    const [found, setFound] = useState(new Set());
    const [foundCells, setFoundCells] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [finished, setFinished] = useState(noWords);
    const [timedOut, setTimedOut] = useState(false);
    const [reported, setReported] = useState(false);
    const [generationFailed, setGenerationFailed] = useState(
        !noWords && grid === null,
    );

    // Reset do jogo
    const resetGame = useCallback(() => {
        const newGrid = noWords
            ? null
            : generateGrid(wordsFitting, computedSize, maxAttempts);
        setGenerationFailed(!noWords && newGrid === null);
        setGrid(newGrid);
        setSelecting(false);
        setSelected([]);
        setDirection(null);
        setFound(new Set());
        setFoundCells(new Set());
        setTimeLeft(timeLimitSeconds);
        setFinished(noWords || newGrid === null);
        setTimedOut(false);
        setReported(false);
        setGenerationKey((k) => k + 1);
    }, [noWords, wordsFitting, computedSize, maxAttempts, timeLimitSeconds]);

    // Inicializa e reseta quando palavras mudam
    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // Timer de countdown
    useEffect(() => {
        if (finished || noWords || generationFailed) return undefined;

        const id = setInterval(() => {
            setTimeLeft((current) => {
                if (current <= 1) {
                    setTimedOut(true);
                    setFinished(true);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [finished, noWords, generationFailed]);

    // Verifica vitória (todas palavras encontradas)
    useEffect(() => {
        if (finished || noWords || generationFailed) return;
        if (found.size === wordsFitting.length && wordsFitting.length > 0) {
            setFinished(true);
        }
    }, [finished, found, wordsFitting.length, noWords, generationFailed]);

    const totalWords = wordsFitting.length || 1;
    const currentPoints = calcularPontos(found.size, totalWords);

    // Reporta score quando jogo termina
    useEffect(() => {
        if (!finished || reported) return;

        const isTimeoutOrFailed = timedOut || noWords || generationFailed;

        const payload = {
            game: "Caça-palavras",
            score: currentPoints,
            points: currentPoints,
            remainingSeconds: timedOut ? 0 : timeLeft,
            timedOut: isTimeoutOrFailed,
        };

        onScore?.(payload);

        if (isTimeoutOrFailed) {
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
        noWords,
        generationFailed,
    ]);

    // Handlers de seleção (lógica de toque/mouse)
    const beginSelect = useCallback(
        (row, col) => {
            if (finished || noWords || generationFailed) return;
            setSelecting(true);
            setSelected([{ row, col }]);
            setDirection(null);
        },
        [finished, noWords, generationFailed],
    );

    const extendSelect = useCallback(
        (row, col) => {
            if (!selecting || finished || noWords || generationFailed) return;

            const cellIndex = selected.findIndex(
                (cell) => cell.row === row && cell.col === col,
            );
            if (cellIndex !== -1) {
                if (cellIndex === 0) return;
                setSelected((current) => current.slice(0, cellIndex));
                if (cellIndex === 1) {
                    setDirection(null);
                }
                return;
            }

            const last = selected[selected.length - 1];

            if (!direction) {
                const dr = row - last.row;
                const dc = col - last.col;
                const straight =
                    (dr === 0 && Math.abs(dc) === 1) || (dc === 0 && Math.abs(dr) === 1) || Math.abs(dr) === Math.abs(dc);
                if (!straight) return;
                setDirection({ dr: Math.sign(dr), dc: Math.sign(dc) });
                setSelected((current) => [...current, { row, col }]);
                return;
            }

            const nextRow = last.row + direction.dr;
            const nextCol = last.col + direction.dc;
            if (row !== nextRow || col !== nextCol) return;

            setSelected((current) => [...current, { row, col }]);
        },
        [selecting, finished, noWords, generationFailed, selected, direction],
    );

    const finishSelect = useCallback(() => {
        if (!selecting || finished || noWords || generationFailed) return;

        const letters = selected.map((cell) => grid[cell.row][cell.col]).join("");
        const reverse = letters.split("").reverse().join("");
        const matchWord = wordsFitting.find(
            (word) => word === letters || word === reverse,
        );

        if (matchWord && !found.has(matchWord)) {
            const nextFound = new Set(found);
            nextFound.add(matchWord);
            setFound(nextFound);

            const nextCells = new Set(foundCells);
            selected.forEach((cell) => nextCells.add(`${cell.row}-${cell.col}`));
            setFoundCells(nextCells);
        }

        setSelecting(false);
        setSelected([]);
        setDirection(null);
    }, [
        selecting,
        finished,
        noWords,
        generationFailed,
        selected,
        grid,
        wordsFitting,
        found,
        foundCells,
    ]);

    const isSelected = useCallback(
        (row, col) =>
            selected.some((cell) => cell.row === row && cell.col === col),
        [selected],
    );

    const isFound = useCallback(
        (row, col) => foundCells.has(`${row}-${col}`),
        [foundCells],
    );

    // Retorna estado e handlers para o componente consumidor
    return {
        // Estado do grid
        grid,
        gridCols: grid?.[0]?.length ?? computedSize,

        // Estado de seleção
        selecting,
        selected,
        isSelected,
        isFound,

        // Estado de palavras
        wordsFitting,
        found,

        // Estado de tempo e jogo
        timeLeft,
        finished,
        timedOut,
        noWords,
        generationFailed,

        // Pontuação
        currentPoints,
        totalWords,

        // Handlers
        beginSelect,
        extendSelect,
        finishSelect,
        resetGame,
    };
}
