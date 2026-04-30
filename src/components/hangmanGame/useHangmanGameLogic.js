import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeText } from "../../utils/string";
import { calcularPontos } from "../../utils/scoring";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ".split("");
const DEFAULT_MAX_LIVES = 5;

/**
 * Hook que encapsula toda a lógica do Jogo da Forca.
 *
 * Contrato de entrada:
 *   data     — { words: string[] }  lista de palavras vinda da API
 *   settings — { timeLimitSeconds, maxLives }  configurações da partida
 *
 * Contrato de saída (callbacks):
 *   onScore(payload)      — disparado quando a partida termina
 *   onRoundComplete()     — disparado quando o jogador acerta a palavra
 *   onGameOver(payload)   — disparado quando perde (tempo/vidas)
 */
export default function useHangmanGameLogic({
    data = {},
    settings = {},
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const { words = [] } = data;
    const {
        timeLimitSeconds = 30,
        maxLives = DEFAULT_MAX_LIVES,
    } = settings;

    // ─── Dados derivados ─────────────────────────────────────────────
    const normalizedWords = useMemo(
        () =>
            words
                .map((word) => (word ?? "").toUpperCase())
                .filter((word) => word.length > 0),
        [words],
    );

    const noWords = normalizedWords.length === 0;

    const pickRandomWord = useCallback(() => {
        if (normalizedWords.length === 0) return "";
        const idx = Math.floor(Math.random() * normalizedWords.length);
        return normalizedWords[idx];
    }, [normalizedWords]);

    // ─── Estado ──────────────────────────────────────────────────────
    const [secret, setSecret] = useState(() => pickRandomWord());
    const [guessed, setGuessed] = useState(new Set());
    const [lives, setLives] = useState(maxLives);
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [finished, setFinished] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [reported, setReported] = useState(false);

    // ─── Métricas derivadas ──────────────────────────────────────────
    const secretNormalized = useMemo(() => normalizeText(secret), [secret]);

    const masked = secret
        .split("")
        .map((letter, idx) => (guessed.has(secretNormalized[idx]) ? letter : "_"))
        .join(" ");

    const won =
        secret.length > 0 &&
        secretNormalized.split("").every((letter) => guessed.has(letter));

    const revealedCount = secretNormalized
        .split("")
        .filter((letter) => guessed.has(letter)).length;

    const currentPoints = calcularPontos(revealedCount, secret.length || 1);

    // ─── Reset / novo jogo ───────────────────────────────────────────
    const resetGame = useCallback(() => {
        setSecret(pickRandomWord());
        setGuessed(new Set());
        setLives(maxLives);
        setTimeLeft(timeLimitSeconds);
        setFinished(noWords);
        setTimedOut(false);
        setReported(false);
    }, [pickRandomWord, maxLives, timeLimitSeconds, noWords]);

    // Reagir a mudanças nas props de configuração / dados
    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // ─── Timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (finished || noWords || lives <= 0) return undefined;
        const id = setInterval(() => {
            setTimeLeft((current) => {
                if (current <= 1) {
                    setFinished(true);
                    setTimedOut(true);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [finished, noWords, lives]);

    // ─── Detectar vitória ────────────────────────────────────────────
    useEffect(() => {
        if (noWords || finished || lives <= 0) return;
        if (won) {
            setFinished(true);
        }
    }, [won, finished, noWords, lives]);

    // ─── Reportar pontuação ──────────────────────────────────────────
    useEffect(() => {
        if (!finished || reported) return;

        const payload = {
            game: "Forca",
            score: currentPoints,
            points: currentPoints,
            remainingSeconds: timeLeft,
            timedOut: timedOut || noWords,
        };

        onScore?.(payload);

        if (won) {
            onRoundComplete?.(payload);
        } else {
            onGameOver?.(payload);
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
        won,
    ]);

    // ─── Ação: chutar letra ──────────────────────────────────────────
    const pickLetter = useCallback(
        (letter) => {
            const normalizedLetter = normalizeText(letter);
            if (won || guessed.has(normalizedLetter) || finished || noWords) return;
            setGuessed((prev) => new Set(prev).add(normalizedLetter));

            if (!secretNormalized.includes(normalizedLetter)) {
                setLives((currentLives) => {
                    const nextLives = Math.max(0, currentLives - 1);
                    if (nextLives === 0) {
                        setFinished(true);
                        setTimedOut(false);
                    }
                    return nextLives;
                });
            }
        },
        [won, guessed, finished, noWords, secretNormalized],
    );

    // ─── API pública do hook ─────────────────────────────────────────
    return {
        // Constantes
        alphabet: ALPHABET,

        // Estado do jogo
        secret,
        masked,
        guessed,
        lives,
        maxLives,
        timeLeft,
        finished,
        timedOut,
        won,
        noWords,

        // Métricas
        revealedCount,
        currentPoints,

        // Ações
        pickLetter,
        resetGame,
    };
}
