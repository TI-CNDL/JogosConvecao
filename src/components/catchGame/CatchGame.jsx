import { useEffect, useMemo, useRef, useState } from "react";
import "./catchGame.style.css";

const ITEM_TYPES = {
  GOOD: "good",
  BAD: "bad",
  SPECIAL: "special",
};

const STORAGE_KEY = "catch-game-high-score";

const randomBetween = (min, max) => min + Math.random() * (max - min);

const buildItem = (width, speedFactor) => {
  const roll = Math.random();
  let type = ITEM_TYPES.GOOD;
  if (roll > 0.88) type = ITEM_TYPES.SPECIAL;
  else if (roll > 0.62) type = ITEM_TYPES.BAD;

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

export default function CatchGame({
  onScore,
  timeLimitSeconds = 90,
  ranking = [],
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const rafRef = useRef(0);
  const prevTsRef = useRef(0);
  const spawnTimerRef = useRef(0);

  const basketRef = useRef({ x: 240, y: 470, w: 132, h: 34, glow: 0 });
  const itemsRef = useRef([]);

  const pointsRef = useRef(0);
  const remainingRef = useRef(timeLimitSeconds);
  const timedOutRef = useRef(false);

  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [reported, setReported] = useState(false);

  const [highScore, setHighScore] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  });

  const gameLabel = useMemo(() => "Cesta de Ofertas", []);

  const syncHud = () => {
    setPoints(pointsRef.current);
    setTimeLeft(Math.max(0, Math.ceil(remainingRef.current)));
  };

  const resizeCanvas = () => {
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
  };

  const restart = () => {
    pointsRef.current = 0;
    remainingRef.current = timeLimitSeconds;
    timedOutRef.current = false;
    itemsRef.current = [];
    spawnTimerRef.current = 0;
    prevTsRef.current = 0;
    basketRef.current.glow = 0;

    setFinished(false);
    setReported(false);
    syncHud();
  };

  const update = (deltaSec, width, height) => {
    if (finished) return;

    remainingRef.current = Math.max(0, remainingRef.current - deltaSec);
    if (remainingRef.current <= 0) {
      timedOutRef.current = true;
      setFinished(true);
    }

    const elapsed = timeLimitSeconds - remainingRef.current;
    const speedFactor = 1 + Math.min(1.4, elapsed / 55);
    const spawnEvery = Math.max(0.24, 0.85 - elapsed * 0.004);

    spawnTimerRef.current -= deltaSec;
    if (spawnTimerRef.current <= 0) {
      itemsRef.current.push(buildItem(width, speedFactor));
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
        item.x >= basket.x - basket.w / 2 && item.x <= basket.x + basket.w / 2;

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
  };

  const draw = () => {
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
      ctx.strokeStyle = isSpecial ? "#fedc50" : isBad ? "#ef4444" : "#38bdf8";
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
    ctx.roundRect(basket.x - basket.w / 2, basket.y, basket.w, basket.h, 10);
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
  };

  const loop = (ts) => {
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
  };

  const updateBasketFromPointer = (event) => {
    if (finished) return;
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
  };

  useEffect(() => {
    resizeCanvas();
    restart();

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [timeLimitSeconds]);

  useEffect(() => {
    if (!finished || reported) return;

    const elapsedMs = Math.max(
      0,
      (timeLimitSeconds - Math.max(0, remainingRef.current)) * 1000,
    );
    onScore?.({
      game: gameLabel,
      score: pointsRef.current,
      points: pointsRef.current,
      elapsedMs,
      timedOut: timedOutRef.current,
    });
    setReported(true);

    if (pointsRef.current > highScore) {
      setHighScore(pointsRef.current);
      localStorage.setItem(STORAGE_KEY, String(pointsRef.current));
    }
  }, [finished, reported, onScore, gameLabel, timeLimitSeconds, highScore]);

  return (
    <div className="panel catch-game">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Cesta de Ofertas</p>
          <h2>
            {finished ? "Fim de jogo" : "Colete os bons e desvie dos ruins"}
          </h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Pontos: {points}</span>
        <span className="pill">High Score: {highScore}</span>
      </div>

      <div
        ref={stageRef}
        className="catch-stage"
        onPointerDown={updateBasketFromPointer}
        onPointerMove={updateBasketFromPointer}
      >
        <canvas
          ref={canvasRef}
          className="catch-canvas"
          aria-label="Área do jogo Cesta de Ofertas"
        />
      </div>

      <p className="catch-instructions">
        Arraste o dedo para mover a cesta. <strong>Item ruim coletado</strong> e{" "}
        <strong>item dourado perdido</strong> afetam a pontuação.
      </p>

      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOutRef.current ? "Tempo esgotado" : "Partida concluida"}</p>
          <h3>Pontos: {points}</h3>
          <p>Tempo jogado: {timeLimitSeconds - timeLeft}s</p>

          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.totalPoints ?? 0} pts</span>
                </div>
              ))}
            </div>
          )}

          <button className="primary" onClick={restart}>
            Jogar de novo
          </button>
        </div>
      )}
    </div>
  );
}
