import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeText } from "../../utils/string";
import { calcularPontos } from "../../utils/scoring";

// Alfabeto padrão disponível no teclado da forca (inclui o 'Ç' para palavras em português)
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ".split("");

// Quantidade padrão de vidas caso não seja informada na configuração
const DEFAULT_MAX_LIVES = 5;

/**
 * HOOK DE LÓGICA DO JOGO DA FORCA (useHangmanGameLogic.js)
 * Encapsula o gerenciamento de estado da partida, escolha aleatória de palavras,
 * verificação de acertos/erros, contagem regressiva do tempo e disparo de callbacks globais.
 *
 * @param {Object} props - Propriedades passadas pelo componente visual.
 * @param {Object} props.data - Objeto contendo a lista de palavras (`words`).
 * @param {Object} props.config - Configurações da partida (`timeLimitSeconds`, `maxLives`).
 * @param {Function} props.onScore - Callback acionada ao término do jogo para envio do placar.
 * @param {Function} props.onRoundComplete - Callback acionada em caso de vitória.
 * @param {Function} props.onGameOver - Callback acionada em caso de derrota.
 */
export default function useHangmanGameLogic({
    data = {},
    config = {},
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const { words = [] } = data;
    const {
        timeLimitSeconds = 30,
        maxLives = DEFAULT_MAX_LIVES,
    } = config;

    // ─── DADOS DERIVADOS E FILTRAGEM ─────────────────────────────────────────────
    
    // Normaliza a lista de palavras garantindo que estejam em letras maiúsculas e sem strings vazias
    const normalizedWords = useMemo(
        () =>
            words
                .map((word) => (word ?? "").toUpperCase())
                .filter((word) => word.length > 0),
        [words],
    );

    // Flag indicando se a lista de palavras está completamente vazia
    const noWords = normalizedWords.length === 0;

    // Seleciona aleatoriamente uma palavra da lista normalizada
    const pickRandomWord = useCallback(() => {
        if (normalizedWords.length === 0) return "";
        const idx = Math.floor(Math.random() * normalizedWords.length);
        return normalizedWords[idx];
    }, [normalizedWords]);

    // ─── ESTADOS DA PARTIDA ──────────────────────────────────────────────────────
    const [secret, setSecret] = useState(() => pickRandomWord());     // A palavra secreta atual
    const [guessed, setGuessed] = useState(new Set());                // Set de letras já adivinhadas/clicadas
    const [lives, setLives] = useState(maxLives);                     // Contador de vidas restantes
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);       // Cronômetro regressivo em segundos
    const [finished, setFinished] = useState(false);                  // Flag de encerramento da partida
    const [timedOut, setTimedOut] = useState(false);                  // Flag de encerramento por tempo esgotado
    const [reported, setReported] = useState(false);                  // Flag para garantir envio único do placar

    // ─── MÉTRICAS DERIVADAS ──────────────────────────────────────────────────────
    
    // Versão da palavra secreta sem acentos para comparação direta com as letras do teclado
    const secretNormalized = useMemo(() => normalizeText(secret), [secret]);

    // String formatada exibida na tela (ex: "C _ S A" para "CASA" com 'C', 'S', 'A' adivinhados)
    const masked = secret
        .split("")
        .map((letter, idx) => (guessed.has(secretNormalized[idx]) ? letter : "_"))
        .join(" ");

    // Condição de vitória: verifica se todas as letras da palavra secreta já estão no Set de palpites
    const won =
        secret.length > 0 &&
        secretNormalized.split("").every((letter) => guessed.has(letter));

    // Quantidade de letras únicas reveladas até o momento
    const revealedCount = secretNormalized
        .split("")
        .filter((letter) => guessed.has(letter)).length;

    // Cálculo da pontuação proporcional ao número de letras reveladas
    const currentPoints = calcularPontos(revealedCount, secret.length || 1);

    // ─── CONTROLE DE FLUXO (RESET E NOVO JOGO) ───────────────────────────────────
    const resetGame = useCallback(() => {
        setSecret(pickRandomWord());
        setGuessed(new Set());
        setLives(maxLives);
        setTimeLeft(timeLimitSeconds);
        setFinished(noWords); // Já inicia finalizado caso não haja palavras
        setTimedOut(false);
        setReported(false);
    }, [pickRandomWord, maxLives, timeLimitSeconds, noWords]);

    // Efeito para reiniciar a partida automaticamente se as configurações ou lista de palavras mudarem
    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // ─── CRONÔMETRO REGRESSIVO (TIMER) ───────────────────────────────────────────
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

    // ─── MONITORAMENTO DE VITÓRIA ────────────────────────────────────────────────
    useEffect(() => {
        if (noWords || finished || lives <= 0) return;
        if (won) {
            setFinished(true);
        }
    }, [won, finished, noWords, lives]);

    // ─── DISPARO DE CALLBACKS GLOBAIS (PONTUAÇÃO E FIM DE JOGO) ──────────────────
    useEffect(() => {
        if (!finished || reported) return;

        const payload = {
            game: "Forca",
            score: currentPoints,
            points: currentPoints,
            remainingSeconds: timeLeft,
            timedOut: timedOut || noWords,
        };

        // Dispara a callback de pontuação geral
        onScore?.(payload);

        // Dispara a callback específica de vitória ou derrota
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

    // ─── MANIPULADOR DE PALPITE (CLIQUE NA LETRA) ────────────────────────────────
    const pickLetter = useCallback(
        (letter) => {
            const normalizedLetter = normalizeText(letter);
            if (won || guessed.has(normalizedLetter) || finished || noWords) return;
            
            // Adiciona a letra ao Set de palpites
            setGuessed((prev) => new Set(prev).add(normalizedLetter));

            // Se a letra não existir na palavra secreta, desconta uma vida
            if (!secretNormalized.includes(normalizedLetter)) {
                setLives((currentLives) => {
                    const nextLives = Math.max(0, currentLives - 1);
                    if (nextLives === 0) {
                        setFinished(true);
                        setTimedOut(false); // Derrota por perda de vidas, não por tempo
                    }
                    return nextLives;
                });
            }
        },
        [won, guessed, finished, noWords, secretNormalized],
    );

    // ─── RETORNO DA API PÚBLICA DO HOOK ──────────────────────────────────────────
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
