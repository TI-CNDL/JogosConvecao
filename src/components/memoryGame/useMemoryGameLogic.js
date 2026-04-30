import { useCallback, useEffect, useRef, useState } from "react";
import { shuffle } from "../../utils/array";
import { mulberry32 } from "../../utils/random";
import { calcularPontos } from "../../utils/scoring";

/**
 * Hook que encapsula toda a lógica do Jogo da Memória.
 *
 * Contrato de entrada:
 *   data     — { symbols: string[] }  conteúdo vindo da API
 *   settings — { timeLimitSeconds, pairCount, seed }  configurações da partida
 *
 * Contrato de saída (callbacks):
 *   onScore(payload)      — disparado quando a partida termina
 *   onRoundComplete()     — disparado quando o jogador completa todos os pares
 *   onGameOver(payload)   — disparado quando o tempo esgota
 */
export default function useMemoryGameLogic({
    data = {},
    settings = {},
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const { symbols = [] } = data;
    const {
        timeLimitSeconds = 30,
        pairCount = null,
        seed = null,
    } = settings;

    const noSymbols = symbols.length === 0;
    const previewTimer = useRef(null);
    const runRef = useRef(0);

    // ─── Construção do baralho ───────────────────────────────────────
    const buildDeck = useCallback(
        (runKey = 0) => {
            const rng =
                seed === null
                    ? Math.random
                    : mulberry32(Number(seed) + Number(runKey));

            const maxPairs = pairCount ?? symbols.length;
            const shuffledSymbols = shuffle(symbols, rng);
            const selected = shuffledSymbols.slice(
                0,
                Math.max(0, Math.min(maxPairs, symbols.length)),
            );
            const doubled = selected.flatMap((label) => [label, label]);
            return shuffle(doubled, rng).map((label, index) => ({
                id: `${label}-${index}`,
                label,
                matched: false,
            }));
        },
        [symbols, pairCount, seed],
    );

    // ─── Estado ──────────────────────────────────────────────────────
    const [cards, setCards] = useState(() => buildDeck(runRef.current));
    const [flipped, setFlipped] = useState([]);
    const [locked, setLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [finished, setFinished] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [reported, setReported] = useState(false);
    const [previewing, setPreviewing] = useState(false);

    // ─── Métricas derivadas ──────────────────────────────────────────
    const matchedPairs = Math.floor(
        cards.filter((c) => c.matched).length / 2,
    );
    const totalPairs = Math.max(1, Math.floor(cards.length / 2));
    const currentPoints = calcularPontos(matchedPairs, totalPairs);
    const solved = cards.length > 0 && cards.every((c) => c.matched);

    // ─── Reset / novo jogo ───────────────────────────────────────────
    const resetGame = useCallback(() => {
        runRef.current += 1;
        setCards(buildDeck(runRef.current));
        setFlipped([]);
        setLocked(false);
        setTimeLeft(timeLimitSeconds);
        setFinished(noSymbols);
        setTimedOut(false);
        setReported(false);
        setPreviewing(true);
        if (previewTimer.current) clearTimeout(previewTimer.current);
        previewTimer.current = setTimeout(() => setPreviewing(false), 1200);
    }, [buildDeck, timeLimitSeconds, noSymbols]);

    // Reagir a mudanças nas props de configuração / dados
    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // Cleanup do preview timer
    useEffect(
        () => () => {
            if (previewTimer.current) clearTimeout(previewTimer.current);
        },
        [],
    );

    // ─── Timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (finished || noSymbols) return undefined;
        const id = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    setFinished(true);
                    setTimedOut(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [finished, noSymbols]);

    // ─── Detectar vitória ────────────────────────────────────────────
    useEffect(() => {
        if (!solved || finished) return;
        setFinished(true);
    }, [solved, finished]);

    // ─── Reportar pontuação ──────────────────────────────────────────
    useEffect(() => {
        if (!finished || reported) return;

        const payload = {
            game: "Memoria",
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

    // ─── Ação: virar carta ───────────────────────────────────────────
    const handleFlip = useCallback(
        (cardId) => {
            if (locked || finished || noSymbols || previewing) return;
            const card = cards.find((c) => c.id === cardId);
            if (!card || card.matched || flipped.includes(cardId)) return;

            const next = [...flipped, cardId];
            setFlipped(next);

            if (next.length === 2) {
                setLocked(true);
                const [first, second] = next.map((id) =>
                    cards.find((c) => c.id === id),
                );
                const isMatch = first.label === second.label;
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((c) =>
                            next.includes(c.id) && isMatch
                                ? { ...c, matched: true }
                                : c,
                        ),
                    );
                    setFlipped([]);
                    setLocked(false);
                }, 450);
            }
        },
        [locked, finished, noSymbols, previewing, cards, flipped],
    );

    // ─── API pública do hook ─────────────────────────────────────────
    return {
        // Estado do jogo
        cards,
        flipped,
        previewing,
        finished,
        timedOut,
        noSymbols,
        timeLeft,

        // Métricas
        matchedPairs,
        totalPairs,
        currentPoints,

        // Ações
        handleFlip,
        resetGame,
    };
}
