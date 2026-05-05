import { useCallback, useEffect, useRef, useState } from "react";

const GRID_SIZE = 12; // padrão base do jogo
const ICONS_TARGET = ["⭐", "📦", "🛒", "📱", "💳"];
const ICONS_DECOY = ["🎲", "🎪", "🎨", "🎭", "🎸"];
const MIN_ITEM_TIME = 700;
const MAX_ITEM_TIME = 1400;
const MAX_ACTIVE_ITEMS = 5;
const SPAWN_INTERVAL = 320;

// ── Cotas fixas base (referência: 30 segundos) ────────────────────
// Targets escalam proporcionalmente ao tempo (base: 50 em 30s); decoys são INFINITOS.
const BASE_TIME_SECONDS = 30;
const BASE_TARGET_COUNT = 50;

/**
 * Calcula a cota de targets para a duração da partida.
 * 30s → 50, 60s → 100, 45s → 75, etc.
 */
const computeTargetQuota = (timeLimitSeconds) => {
    const scale = Math.max(0, timeLimitSeconds) / BASE_TIME_SECONDS;
    return Math.max(1, Math.round(BASE_TARGET_COUNT * scale));
};

/**
 * Hook que encapsula a lógica do Whac-A-Mole (Omni-Catch).
 *
 * Vários itens podem ficar ativos ao mesmo tempo, cada um com sua própria duração.
 * Apenas um item-alvo pode existir por vez; os demais são distratores.
 *
 * A quantidade total de targets é planejada no início da partida.
 * Decoys são infinitos.
 *
 * IMPORTANTE: Toda mutação de refs de contagem é feita FORA do setActiveSlots
 * updater para evitar dupla contagem em React StrictMode.
 */
export default function useWhacGameLogic({
    data = {},
    settings = {},
    onScore,
    onGameOver,
}) {
    const timeLimitSeconds = settings.timeLimitSeconds ?? 30;
    const gridSize = Number.isFinite(settings.gridSize)
        ? settings.gridSize
        : GRID_SIZE;

    // ─── Estado do Jogo ──────────────────────────────────────────────
    const [finalScore, setFinalScore] = useState(null);
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [gameActive, setGameActive] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [reported, setReported] = useState(false);

    // ─── Alvo escolhido para toda a partida ──────────────────────────
    const [targetIcon, setTargetIcon] = useState(() =>
        ICONS_TARGET[Math.floor(Math.random() * ICONS_TARGET.length)],
    );

    // ─── Itens ativos ────────────────────────────────────────────────
    const [activeSlots, setActiveSlots] = useState([]);

    // ─── IDs clicados (feedback visual verde) ────────────────────────
    const [clickedIds, setClickedIds] = useState(new Set());

    // ─── Refs para controle ─────────────────────────────────────────
    const spawnLoopRef = useRef(null);
    const countdownRef = useRef(null);
    const hideTimersRef = useRef(new Map());
    const scoreRef = useRef(0);
    const targetsHitRef = useRef(0);
    const targetsAppearedRef = useRef(0);
    const wrongClicksRef = useRef(0);
    const timeLeftRef = useRef(timeLimitSeconds);
    const isGameRunningRef = useRef(false);
    const nextItemIdRef = useRef(1);

    // ─── Ref espelho dos slots (evita mutação de refs dentro do updater) ──
    const activeSlotsRef = useRef([]);

    // ─── Ref de cota (só targets têm cota; decoys são infinitos) ────
    const targetQuotaRef = useRef(0);

    const getRandomItemTime = useCallback(() => {
        return MIN_ITEM_TIME + Math.floor(Math.random() * (MAX_ITEM_TIME - MIN_ITEM_TIME + 1));
    }, []);

    const pickFreeSlot = useCallback((currentSlots) => {
        const occupied = new Set(currentSlots.map((slot) => slot.index));
        const freeSlots = Array.from({ length: gridSize }, (_, i) => i).filter(
            (i) => !occupied.has(i),
        );
        if (freeSlots.length === 0) return null;
        return freeSlots[Math.floor(Math.random() * freeSlots.length)];
    }, [gridSize]);

    const clearHideTimer = useCallback((itemId) => {
        const timerId = hideTimersRef.current.get(itemId);
        if (timerId) {
            clearTimeout(timerId);
            hideTimersRef.current.delete(itemId);
        }
    }, []);

    const scheduleItemRemoval = useCallback(
        (item) => {
            clearHideTimer(item.id);
            const timerId = setTimeout(() => {
                activeSlotsRef.current = activeSlotsRef.current.filter((s) => s.id !== item.id);
                setActiveSlots(activeSlotsRef.current);
                hideTimersRef.current.delete(item.id);
            }, item.duration);
            hideTimersRef.current.set(item.id, timerId);
        },
        [clearHideTimer],
    );

    // ─── Spawn: a cada tick, tenta criar 1 item se houver vaga ───────
    // Toda lógica FORA do updater para não sofrer com StrictMode.
    const spawnItem = useCallback(() => {
        if (!isGameRunningRef.current) return;

        const currentSlots = activeSlotsRef.current;

        if (currentSlots.length >= MAX_ACTIVE_ITEMS) return;

        const slotIndex = pickFreeSlot(currentSlots);
        if (slotIndex === null) return;

        const tgtLeft = targetQuotaRef.current;
        const hasTargetActive = currentSlots.some((slot) => slot.isTarget);
        let isTarget = false;

        if (!hasTargetActive && tgtLeft > 0) {
            isTarget = Math.random() < 0.25;
        }

        if (isTarget) {
            targetQuotaRef.current -= 1;
            targetsAppearedRef.current += 1;
        }

        const nextItem = {
            id: nextItemIdRef.current++,
            index: slotIndex,
            icon: isTarget
                ? targetIcon
                : ICONS_DECOY[Math.floor(Math.random() * ICONS_DECOY.length)],
            duration: getRandomItemTime(),
            isTarget,
        };

        const newSlots = [...currentSlots, nextItem];
        activeSlotsRef.current = newSlots;
        setActiveSlots(newSlots);
        scheduleItemRemoval(nextItem);
    }, [getRandomItemTime, pickFreeSlot, scheduleItemRemoval, targetIcon]);

    // ─── Iniciar o jogo ─────────────────────────────────────────────
    const startGame = useCallback(() => {
        targetQuotaRef.current = computeTargetQuota(timeLimitSeconds);

        setGameStarted(true);
        setGameActive(true);
        setFinalScore(0);
        setTimeLeft(timeLimitSeconds);
        scoreRef.current = 0;
        targetsHitRef.current = 0;
        targetsAppearedRef.current = 0;
        wrongClicksRef.current = 0;
        timeLeftRef.current = timeLimitSeconds;
        setFinished(false);
        setReported(false);
        activeSlotsRef.current = [];
        setActiveSlots([]);
        nextItemIdRef.current = 1;
        isGameRunningRef.current = true;
    }, [timeLimitSeconds]);

    // ─── Timer de contagem regressiva ────────────────────────────────
    useEffect(() => {
        if (!gameActive || finished) return;

        countdownRef.current = setInterval(() => {
            timeLeftRef.current -= 1;
            setTimeLeft(timeLeftRef.current);

            if (timeLeftRef.current <= 0) {
                setFinished(true);
                setGameActive(false);
                isGameRunningRef.current = false;
                activeSlotsRef.current = [];
                setActiveSlots([]);
            }
        }, 1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [gameActive, finished]);

    // ─── Loop do jogo: spawn contínuo a cada 320ms ──────────────────
    useEffect(() => {
        if (!gameActive || finished) return;

        const clearTimers = () => {
            if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
            hideTimersRef.current.forEach((tid) => clearTimeout(tid));
            hideTimersRef.current.clear();
        };

        spawnLoopRef.current = setInterval(() => {
            spawnItem();
        }, SPAWN_INTERVAL);

        return clearTimers;
    }, [finished, gameActive, spawnItem]);

    // ─── Reportar score ao terminar ──────────────────────────────────
    useEffect(() => {
        if (!finished || reported) return;

        // Usar a pontuação acumulada em scoreRef (já atualizada em tempo real)
        const finalPts = Math.max(0, scoreRef.current);
        setFinalScore(finalPts);

        const payload = { points: finalPts, timedOut: false };
        onScore?.(payload);
        onGameOver?.(payload);
        setReported(true);
    }, [finished, reported, onScore, onGameOver]);

    // ─── Handle click ────────────────────────────────────────────────
    const handleSlotClick = useCallback(
        (slotIndex) => {
            const clickedSlot = activeSlotsRef.current.find((s) => s.index === slotIndex);
            if (!clickedSlot) return;

            clearHideTimer(clickedSlot.id);

            if (clickedSlot.isTarget) {
                targetsHitRef.current += 1;
                // Pontuação por acerto
                scoreRef.current += 10;
                setFinalScore(scoreRef.current);
            } else {
                wrongClicksRef.current += 1;
                // Penalidade por erro
                scoreRef.current = Math.max(0, scoreRef.current - 5);
                setFinalScore(scoreRef.current);
            }

            // Marcar como clicado (verde) por 250ms, depois remover
            setClickedIds((prev) => new Set(prev).add(clickedSlot.id));

            setTimeout(() => {
                activeSlotsRef.current = activeSlotsRef.current.filter((s) => s.id !== clickedSlot.id);
                setActiveSlots(activeSlotsRef.current);
                setClickedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(clickedSlot.id);
                    return next;
                });
            }, 250);
        },
        [clearHideTimer],
    );

    return {
        score: finalScore,
        timeLeft,
        gameActive,
        gameStarted,
        finished,
        targetIcon,
        timeLimitSeconds,
        activeSlots,
        clickedIds,
        gridSize,
        startGame,
        handleSlotClick,
    };
}
