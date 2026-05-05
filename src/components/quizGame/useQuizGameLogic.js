import { useCallback, useEffect, useMemo, useState } from "react";
import { shuffle } from "../../utils/array";

/**
 * Calcula pontos do quiz com base apenas nos acertos.
 * @param {number} corretas
 * @param {number} totalPerguntas
 * @returns {number}
 */
const calcularPontosQuiz = (corretas, totalPerguntas) => {
    if (!totalPerguntas || totalPerguntas <= 0) return 0;
    const valorAcerto = 100 / totalPerguntas;
    const bruto = corretas * valorAcerto;
    return Math.max(0, Math.floor(bruto));
};

/**
 * Normaliza uma questão da API para o formato interno.
 * Aceita tanto { question, options, answer } quanto { prompt, options, answer }.
 */
const normalizeQuestion = (q) => {
    if (!q) return null;
    const prompt = q.prompt || q.question || "";
    const answer = q.answer || "";
    // Removida exigência de options, pois vamos auto-gerar as erradas
    if (!prompt || !answer) return null;
    return { prompt, answer };
};

/**
 * Hook que encapsula toda a lógica do Jogo de Quiz.
 *
 * Contrato de entrada:
 *   data     — { questions: Array<{ question|prompt, options, answer }> }
 *   settings — { timeLimitSeconds, questionLimit }
 *
 * Contrato de saída (callbacks):
 *   onScore(payload)      — disparado quando a partida termina
 *   onRoundComplete()     — disparado ao responder todas as perguntas
 *   onGameOver(payload)   — disparado quando o tempo esgota
 */
export default function useQuizGameLogic({
    data = {},
    settings = {},
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const { questions = [] } = data;
    const {
        timeLimitSeconds = 30,
        questionLimit = null,
    } = settings;

    // ─── Dados sanitizados ───────────────────────────────────────────
    const sanitizedQuestions = useMemo(
        () => questions.map(normalizeQuestion).filter(Boolean),
        [questions],
    );

    const noQuestions = sanitizedQuestions.length === 0;

    // Chave para forçar re-shuffle ao resetar
    const [shuffleKey, setShuffleKey] = useState(0);

    const randomizedQuestions = useMemo(() => {
        if (sanitizedQuestions.length === 0 || questionLimit === 0) return [];
        let pool = shuffle(sanitizedQuestions);
        const maxQuestions = sanitizedQuestions.length;
        const safeQuestionLimit =
            Number.isFinite(questionLimit) && questionLimit > 0
                ? Math.min(questionLimit, maxQuestions)
                : maxQuestions;
        pool = pool.slice(0, safeQuestionLimit);

        // Auto-gerar opções (1 certa + até 3 erradas pegas de outras perguntas)
        const allAnswers = [...new Set(sanitizedQuestions.map((q) => q.answer))];

        return pool.map((q) => {
            const wrongAnswers = allAnswers.filter((ans) => ans !== q.answer);
            const shuffledWrongs = shuffle(wrongAnswers).slice(0, 3);
            const generatedOptions = shuffle([q.answer, ...shuffledWrongs]);

            return {
                ...q,
                options: generatedOptions,
            };
        });
    }, [sanitizedQuestions, questionLimit, shuffleKey]);

    // ─── Estado ──────────────────────────────────────────────────────
    const [step, setStep] = useState(0);
    const [roundCorrect, setRoundCorrect] = useState(0);
    const [finished, setFinished] = useState(noQuestions);
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [timedOut, setTimedOut] = useState(false);
    const [reported, setReported] = useState(false);
    const [answersByStep, setAnswersByStep] = useState({});

    // ─── Métricas derivadas ──────────────────────────────────────────
    const totalQuestions = randomizedQuestions.length || 1;
    const currentPoints = calcularPontosQuiz(roundCorrect, totalQuestions);
    const currentQuestion = randomizedQuestions[step] ?? null;

    // ─── Reset / novo jogo ───────────────────────────────────────────
    const resetGame = useCallback(() => {
        setStep(0);
        setRoundCorrect(0);
        setFinished(noQuestions);
        setTimeLeft(timeLimitSeconds);
        setTimedOut(false);
        setReported(false);
        setAnswersByStep({});
        setShuffleKey((k) => k + 1);
    }, [noQuestions, timeLimitSeconds]);

    // Reagir a mudanças nas props de configuração / dados
    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // ─── Timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (finished || noQuestions) return undefined;
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
    }, [finished, noQuestions]);

    // ─── Reportar pontuação ──────────────────────────────────────────
    useEffect(() => {
        if (!finished || reported) return;

        const payload = {
            game: "Quiz",
            score: currentPoints,
            points: currentPoints,
            remainingSeconds: timeLeft,
            timedOut: timedOut || noQuestions,
        };

        onScore?.(payload);

        if (timedOut || noQuestions) {
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
        noQuestions,
    ]);

    // ─── Ação: escolher resposta ─────────────────────────────────────
    const chooseAnswer = useCallback(
        (option) => {
            if (finished || noQuestions || !currentQuestion) return;
            setAnswersByStep((prev) => ({ ...prev, [step]: option }));
            const correct = option === currentQuestion.answer;

            if (correct) setRoundCorrect((prev) => prev + 1);

            const nextStep = step + 1;
            if (nextStep >= randomizedQuestions.length) {
                setFinished(true);
            } else {
                setStep(nextStep);
            }
        },
        [finished, noQuestions, currentQuestion, step, randomizedQuestions.length],
    );

    // ─── API pública do hook ─────────────────────────────────────────
    return {
        // Estado do jogo
        step,
        currentQuestion,
        randomizedQuestions,
        answersByStep,
        finished,
        timedOut,
        noQuestions,
        timeLeft,

        // Métricas
        roundCorrect,
        currentPoints,
        totalQuestions,

        // Ações
        chooseAnswer,
        resetGame,
    };
}
