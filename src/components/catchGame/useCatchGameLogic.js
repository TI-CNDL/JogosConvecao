import { useEffect, useRef, useState, useCallback } from "react";

const ITEM_TYPES = {
    GOOD: "good",
    BAD: "bad",
    SPECIAL: "special",
};

const randomBetween = (min, max) => min + Math.random() * (max - min);

const buildItem = (width, speedFactor, dangerLevel) => {
    const badChance = Math.min(0.72, 0.26 + dangerLevel * 0.4);
    const specialChance = Math.max(0.04, 0.12 - dangerLevel * 0.05);

    const roll = Math.random();
    let type = ITEM_TYPES.GOOD;
    if (roll <= badChance) type = ITEM_TYPES.BAD;
    else if (roll <= badChance + specialChance) type = ITEM_TYPES.SPECIAL;

    const size = type === ITEM_TYPES.SPECIAL ? 36 : 32;
    const margin = size + 12;

    return {
        id: `${Date.now()}-${Math.random()}`,
        type,
        x: randomBetween(margin, Math.max(margin + 1, width - margin)),
        y: -size,
        size,
        vy: randomBetween(95, 170) * speedFactor,
        icon:
            type === ITEM_TYPES.GOOD
                ? ["📦", "📱", "🪙", "✅"][Math.floor(Math.random() * 4)]
                : type === ITEM_TYPES.BAD
                ? ["💥", "⚠️", "↩️", "🗑️"][Math.floor(Math.random() * 4)]
                : "⭐",
    };
};

/**
 * Hook que encapsula a lógica e o loop de renderização do jogo Cesta de Ofertas.
 *
 * Contrato de entrada:
 *   data     — não utilizado neste jogo (independente de API)
 *   settings — { timeLimitSeconds }
 *
 * Contrato de saída (callbacks):
 *   onScore(payload)      — disparado quando a partida termina
 *   onRoundComplete()     — (não se aplica a este jogo contínuo)
 *   onGameOver(payload)   — disparado quando o tempo esgota
 */
export default function useCatchGameLogic({
    data = {},
    settings = {},
    onScore,
    onGameOver,
}) {
    const { timeLimitSeconds = 90 } = settings;

    // Refs para a View conectar o DOM
    const canvasRef = useRef(null);
    const stageRef = useRef(null);

    // Refs mutáveis para o Game Loop (Performance)
    const rafRef = useRef(0);
    const prevTsRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const basketRef = useRef({ x: 240, y: 470, w: 132, h: 34, glow: 0 });
    const itemsRef = useRef([]);

    const pointsRef = useRef(0);
    const remainingRef = useRef(timeLimitSeconds);
    const timedOutRef = useRef(false);
    const finishedRef = useRef(false);

    // Estados Reativos (HUD)
    const [points, setPoints] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
    const [finished, setFinished] = useState(false);
    const [reported, setReported] = useState(false);

    // Sincroniza refs mutáveis com estado React apenas quando necessário
    const syncHud = useCallback(() => {
        setPoints(pointsRef.current);
        setTimeLeft(Math.max(0, Math.ceil(remainingRef.current)));
    }, []);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const stage = stageRef.current;
        if (!canvas || !stage) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = stage.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));

        const basket = basketRef.current;
        basket.y = rect.height - 54;
        basket.x = Math.min(
            Math.max(basket.x, basket.w / 2),
            rect.width - basket.w / 2,
        );
    }, []);

    const restartGame = useCallback(() => {
        pointsRef.current = 0;
        remainingRef.current = timeLimitSeconds;
        timedOutRef.current = false;
        finishedRef.current = false;
        itemsRef.current = [];
        spawnTimerRef.current = 0;
        prevTsRef.current = 0;
        basketRef.current.glow = 0;

        setFinished(false);
        setReported(false);
        syncHud();
    }, [timeLimitSeconds, syncHud]);

    const update = useCallback(
        (deltaSec, width, height) => {
            if (finishedRef.current) return;

            remainingRef.current = Math.max(0, remainingRef.current - deltaSec);
            if (remainingRef.current <= 0) {
                timedOutRef.current = true;
                finishedRef.current = true;
                setFinished(true);
                syncHud();
                return;
            }

            const elapsed = timeLimitSeconds - remainingRef.current;
            const progress = Math.min(
                1,
                elapsed / Math.max(1, timeLimitSeconds),
            );
            const speedFactor = 1 + progress * 2.1;
            const spawnEvery = Math.max(0.11, 0.62 - progress * 0.47);

            spawnTimerRef.current -= deltaSec;
            if (spawnTimerRef.current <= 0) {
                itemsRef.current.push(buildItem(width, speedFactor, progress));

                if (progress > 0.5 && Math.random() < progress * 0.35) {
                    itemsRef.current.push(
                        buildItem(width, speedFactor, progress),
                    );
                }

                spawnTimerRef.current = spawnEvery;
            }

            const basket = basketRef.current;
            basket.glow = Math.max(0, basket.glow - deltaSec * 2.8);

            const nextItems = [];
            for (const item of itemsRef.current) {
                item.y += item.vy * deltaSec;

                const withinY =
                    item.y + item.size / 2 >= basket.y &&
                    item.y - item.size / 2 <= basket.y + basket.h;
                const withinX =
                    item.x >= basket.x - basket.w / 2 &&
                    item.x <= basket.x + basket.w / 2;

                if (withinY && withinX) {
                    basket.glow = 1;

                    if (item.type === ITEM_TYPES.BAD) {
                        pointsRef.current -= 10;
                    } else if (item.type === ITEM_TYPES.SPECIAL) {
                        pointsRef.current += 50;
                    } else {
                        pointsRef.current += 10;
                    }
                } else if (item.y - item.size / 2 > height) {
                    if (item.type === ITEM_TYPES.SPECIAL) {
                        pointsRef.current -= 50;
                    }
                } else {
                    nextItems.push(item);
                }
            }

            itemsRef.current = nextItems;

            syncHud();
        },
        [timeLimitSeconds, syncHud],
    );

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        for (const item of itemsRef.current) {
            const isBad = item.type === ITEM_TYPES.BAD;
            const isSpecial = item.type === ITEM_TYPES.SPECIAL;

            ctx.beginPath();
            ctx.fillStyle = isSpecial
                ? "rgba(254, 220, 80, 0.18)"
                : isBad
                ? "rgba(239, 68, 68, 0.18)"
                : "rgba(14, 165, 233, 0.16)";
            ctx.strokeStyle = isSpecial
                ? "#fedc50"
                : isBad
                ? "#ef4444"
                : "#38bdf8";
            ctx.lineWidth = 2;
            ctx.roundRect(
                item.x - item.size / 2,
                item.y - item.size / 2,
                item.size,
                item.size,
                8,
            );
            ctx.fill();
            ctx.stroke();

            ctx.font = `${Math.floor(item.size * 0.62)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#f8fafc";
            ctx.fillText(item.icon, item.x, item.y + 1);
        }

        const basket = basketRef.current;
        ctx.save();
        ctx.shadowBlur = basket.glow > 0 ? 24 : 0;
        ctx.shadowColor = "#fedc50";
        ctx.fillStyle = "rgba(246, 0, 133, 0.16)";
        ctx.strokeStyle = "#f60085";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(
            basket.x - basket.w / 2,
            basket.y,
            basket.w,
            basket.h,
            10,
        );
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "#f60085";
        ctx.lineWidth = 2;
        ctx.arc(
            basket.x - basket.w * 0.26,
            basket.y + basket.h + 8,
            5,
            0,
            Math.PI * 2,
        );
        ctx.arc(
            basket.x + basket.w * 0.26,
            basket.y + basket.h + 8,
            5,
            0,
            Math.PI * 2,
        );
        ctx.stroke();
        ctx.restore();
    }, []);

    const loop = useCallback(
        (ts) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const dpr = window.devicePixelRatio || 1;
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;

            if (!prevTsRef.current) prevTsRef.current = ts;
            const deltaSec = Math.min(0.033, (ts - prevTsRef.current) / 1000);
            prevTsRef.current = ts;

            update(deltaSec, width, height);
            draw();

            rafRef.current = requestAnimationFrame(loop);
        },
        [update, draw],
    );

    // Event handlers da View
    const handlePointerMove = useCallback((event) => {
        if (finishedRef.current) return;
        const stage = stageRef.current;
        if (!stage) return;

        const rect = stage.getBoundingClientRect();
        const nextX = event.clientX - rect.left;
        const basket = basketRef.current;
        const clamped = Math.max(
            basket.w / 2,
            Math.min(rect.width - basket.w / 2, nextX),
        );
        basket.x = clamped;
    }, []);

    // Ciclo de vida do jogo
    useEffect(() => {
        resizeCanvas();
        restartGame();

        const onResize = () => resizeCanvas();
        window.addEventListener("resize", onResize);

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(rafRef.current);
        };
    }, [timeLimitSeconds, resizeCanvas, restartGame, loop]);

    // Reportar final de jogo
    useEffect(() => {
        if (!finished || reported) return;

        const payload = {
            game: "Cesta de Ofertas",
            score: pointsRef.current,
            points: pointsRef.current,
            remainingSeconds: Math.max(0, remainingRef.current),
            timedOut: timedOutRef.current,
        };

        onScore?.(payload);
        onGameOver?.(payload);

        setReported(true);
    }, [finished, reported, onScore, onGameOver]);

    return {
        // Conexões de DOM
        canvasRef,
        stageRef,

        // Estado React (HUD)
        points,
        timeLeft,
        finished,
        timedOut: timedOutRef.current,

        // Ações
        handlePointerMove,
        restartGame,
    };
}
