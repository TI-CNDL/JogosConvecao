import { useEffect, useMemo, useRef, useState } from "react";
import "./labirintoGame.style.css";

const WORDS = [
  "JARDINEIRO",
  "JOGAR",
  "VAREJO",
  "ENTREGA",
  "ESTOQUE",
  "PAINEL",
  "TOUCH",
];
const WALL_PROBABILITY = 0.28;
const MIN_GAP_STEPS = 4;
const MAX_GAP_STEPS = 6;
const DEFAULT_GRID_SIZE = 8;

const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
};

const DELTAS = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const inBounds = (r, c, gridSize) =>
  r >= 0 && c >= 0 && r < gridSize && c < gridSize;
const posKey = (r, c) => `${r}-${c}`;
const edgeKey = (a, b) => {
  const ka = posKey(a.r, a.c);
  const kb = posKey(b.r, b.c);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};

const areAdjacent = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

const copyPos = (pos) => ({ r: pos.r, c: pos.c });

const generateLetterPath = (word, gridSize) => {
  const maxAttempts = 800;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const checkpoints = [];
    const visited = new Set();

    const start = {
      r: Math.floor(Math.random() * gridSize),
      c: Math.floor(Math.random() * gridSize),
    };
    checkpoints.push(start);
    visited.add(posKey(start.r, start.c));

    let ok = true;
    let current = start;

    for (let i = 1; i < word.length; i += 1) {
      const minDistance = MIN_GAP_STEPS;
      const maxDistance = MAX_GAP_STEPS;
      const candidates = [];

      for (let r = 0; r < gridSize; r += 1) {
        for (let c = 0; c < gridSize; c += 1) {
          const candidate = { r, c };
          const key = posKey(r, c);
          if (visited.has(key)) continue;

          const manhattan =
            Math.abs(candidate.r - current.r) +
            Math.abs(candidate.c - current.c);
          if (manhattan >= minDistance && manhattan <= maxDistance) {
            candidates.push({ ...candidate, manhattan });
          }
        }
      }

      if (candidates.length === 0) {
        ok = false;
        break;
      }

      candidates.sort((a, b) => b.manhattan - a.manhattan);
      const poolSize = Math.max(1, Math.ceil(candidates.length / 3));
      const next = candidates[Math.floor(Math.random() * poolSize)];
      checkpoints.push(next);
      visited.add(posKey(next.r, next.c));
      current = next;
    }

    if (ok && checkpoints.length === word.length) return checkpoints;
  }

  return null;
};

const buildPathBetween = (
  start,
  target,
  blockedEdges,
  forbiddenCells,
  checkpointCells,
  gridSize,
) => {
  const startK = posKey(start.r, start.c);
  const targetK = posKey(target.r, target.c);
  const queue = [copyPos(start)];
  const seen = new Set([startK]);
  const prev = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    const currentK = posKey(current.r, current.c);

    if (currentK === targetK) {
      const path = [copyPos(target)];
      let walk = currentK;
      while (walk !== startK) {
        const [wr, wc] = walk.split("-").map(Number);
        path.push({ r: wr, c: wc });
        walk = prev.get(walk);
      }
      path.push(copyPos(start));
      return path.reverse();
    }

    for (const d of DELTAS) {
      const next = { r: current.r + d.dr, c: current.c + d.dc };
      if (!inBounds(next.r, next.c, gridSize)) continue;
      const nextK = posKey(next.r, next.c);
      if (seen.has(nextK)) continue;
      if (blockedEdges.has(edgeKey(current, next))) continue;
      if (forbiddenCells.has(nextK) && nextK !== targetK) continue;
      if (checkpointCells.has(nextK) && nextK !== targetK && nextK !== startK) {
        continue;
      }

      seen.add(nextK);
      prev.set(nextK, currentK);
      queue.push(next);
    }
  }

  return null;
};

const buildBlockedEdges = (checkpoints, gridSize) => {
  const blocked = new Set();
  const solutionEdges = new Set();

  const solutionPaths = [];
  const forbiddenCells = new Set();
  const checkpointCells = new Set(
    checkpoints.map((pos) => posKey(pos.r, pos.c)),
  );

  for (let i = 0; i < checkpoints.length - 1; i += 1) {
    const between = buildPathBetween(
      checkpoints[i],
      checkpoints[i + 1],
      blocked,
      forbiddenCells,
      checkpointCells,
      gridSize,
    );
    if (!between || between.length < 2) {
      return null;
    }
    solutionPaths.push(between);
    between.forEach((pos) => forbiddenCells.add(posKey(pos.r, pos.c)));
    for (let j = 0; j < between.length - 1; j += 1) {
      solutionEdges.add(edgeKey(between[j], between[j + 1]));
    }
  }

  for (let r = 0; r < gridSize; r += 1) {
    for (let c = 0; c < gridSize; c += 1) {
      if (c + 1 < gridSize) {
        const a = { r, c };
        const b = { r, c: c + 1 };
        const key = edgeKey(a, b);
        if (!solutionEdges.has(key) && Math.random() < WALL_PROBABILITY) {
          blocked.add(key);
        }
      }

      if (r + 1 < gridSize) {
        const a = { r, c };
        const b = { r: r + 1, c };
        const key = edgeKey(a, b);
        if (!solutionEdges.has(key) && Math.random() < WALL_PROBABILITY) {
          blocked.add(key);
        }
      }
    }
  }

  return { blocked, solutionPaths };
};

const findPath = ({ start, target, blockedEdges, visited, gridSize }) => {
  const startK = posKey(start.r, start.c);
  const targetK = posKey(target.r, target.c);

  if (startK === targetK) return [start];

  const queue = [start];
  const seen = new Set([startK]);
  const prev = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    const currentK = posKey(current.r, current.c);

    for (const d of DELTAS) {
      const next = { r: current.r + d.dr, c: current.c + d.dc };
      if (!inBounds(next.r, next.c, gridSize)) continue;
      if (blockedEdges.has(edgeKey(current, next))) continue;

      const nextK = posKey(next.r, next.c);
      if (seen.has(nextK)) continue;
      if (visited.has(nextK) && nextK !== targetK) continue;

      seen.add(nextK);
      prev.set(nextK, currentK);

      if (nextK === targetK) {
        const result = [next];
        let walk = currentK;
        while (walk !== startK) {
          const [wr, wc] = walk.split("-").map(Number);
          result.push({ r: wr, c: wc });
          walk = prev.get(walk);
        }
        result.push(start);
        return result.reverse();
      }

      queue.push(next);
    }
  }

  return null;
};

const getDirectionName = (from, to) => {
  if (to.r < from.r) return "cima";
  if (to.r > from.r) return "baixo";
  if (to.c < from.c) return "esquerda";
  return "direita";
};

const generateRound = (words, gridSize) => {
  if (!words || words.length === 0) return null;

  const eligibleWords = words.filter((word) => word.length <= gridSize);
  const pool = eligibleWords.length > 0 ? eligibleWords : words;
  const word = pool[Math.floor(Math.random() * pool.length)];
  const checkpoints = generateLetterPath(word, gridSize);
  if (!checkpoints) return null;

  const checkpointMap = new Map();
  checkpoints.forEach((p, idx) => checkpointMap.set(posKey(p.r, p.c), idx));

  const grid = Array.from({ length: gridSize }, (_, r) =>
    Array.from({ length: gridSize }, (_, c) => ({
      key: posKey(r, c),
      letter: "",
    })),
  );

  checkpoints.forEach((p, idx) => {
    grid[p.r][p.c].letter = word[idx];
  });

  const blockedResult = buildBlockedEdges(checkpoints, gridSize);
  if (!blockedResult) return generateRound(words, gridSize);
  const { blocked: blockedEdges, solutionPaths } = blockedResult;

  checkpoints.forEach((p, idx) => {
    grid[p.r][p.c].letter = word[idx];
  });

  return {
    word,
    checkpoints,
    checkpointMap,
    blockedEdges,
    solutionPaths,
    grid,
  };
};

const getSequenceStateFromTrail = ({ trail, checkpointMap, grid, word }) => {
  let nextExpectedIndex = 0;
  const matchedKeys = [];
  const usedCheckpointKeys = new Set();

  trail.forEach((pos) => {
    if (nextExpectedIndex >= word.length) return;

    const key = posKey(pos.r, pos.c);
    if (!checkpointMap.has(key) || usedCheckpointKeys.has(key)) return;

    const letter = grid[pos.r]?.[pos.c]?.letter ?? "";
    if (letter === word[nextExpectedIndex]) {
      usedCheckpointKeys.add(key);
      matchedKeys.push(key);
      nextExpectedIndex += 1;
    }
  });

  return {
    progress: nextExpectedIndex - 1,
    matchedKeys,
  };
};

export default function LabirintoGame({
  onScore,
  timeLimitSeconds = 120,
  ranking = [],
  words = [],
  gridSize = DEFAULT_GRID_SIZE,
}) {
  const [round, setRound] = useState(() => generateRound(words, gridSize));
  const [progress, setProgress] = useState(-1);
  const [trail, setTrail] = useState([]);
  const [trailSet, setTrailSet] = useState(new Set());
  const [matchedCheckpointKeys, setMatchedCheckpointKeys] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [roundErrors, setRoundErrors] = useState(0);
  const [sessionErrors, setSessionErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);
  const [hintText, setHintText] = useState("");
  const boardRef = useRef(null);
  const [boardSize, setBoardSize] = useState(480);

  const word = round?.word ?? "";
  const checkpoints = round?.checkpoints ?? [];
  const checkpointMap = round?.checkpointMap ?? new Map();
  const blockedEdges = round?.blockedEdges ?? new Set();
  const grid = round?.grid ?? [];
  const currentPos = trail.length > 0 ? trail[trail.length - 1] : null;
  const shouldMarkFirstCheckpoint = progress < 0;
  const boardGridSize = Math.max(4, gridSize || DEFAULT_GRID_SIZE);

  useEffect(() => {
    if (!boardRef.current) return undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setBoardSize(width);
    });
    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  const resetAttempt = () => {
    setProgress(-1);
    setTrail([]);
    setTrailSet(new Set());
    setMatchedCheckpointKeys([]);
    setDragging(false);
    setHintText("");
  };

  const newGame = () => {
    setRound(generateRound(words, boardGridSize));
    setProgress(-1);
    setTrail([]);
    setTrailSet(new Set());
    setMatchedCheckpointKeys([]);
    setDragging(false);
    setRoundErrors(0);
    setSessionErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
    setTimedOut(false);
    setReported(false);
    setHintText("");
  };

  useEffect(() => {
    newGame();
  }, [timeLimitSeconds]);

  useEffect(() => {
    setRound(generateRound(words, boardGridSize));
    setProgress(-1);
    setTrail([]);
    setTrailSet(new Set());
    setMatchedCheckpointKeys([]);
    setDragging(false);
    setRoundErrors(0);
    setSessionErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
    setTimedOut(false);
    setReported(false);
    setHintText("");
  }, [words, boardGridSize]);

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

  useEffect(() => {
    if (word && progress === word.length - 1 && !finished) {
      setSessionErrors((prev) => prev + roundErrors);
      setFinished(true);
    }
  }, [progress, word, finished, roundErrors, words, boardGridSize]);

  useEffect(() => {
    if (finished && !reported) {
      const partialPoints = calcularPontos(progress + 1, word.length || 1);
      onScore?.({
        game: "Labirinto",
        score: partialPoints,
        points: partialPoints,
        errors: sessionErrors + roundErrors,
        remainingSeconds: timeLeft,
        timedOut,
      });
      setReported(true);
    }
  }, [
    finished,
    reported,
    onScore,
    progress,
    word,
    sessionErrors,
    roundErrors,
    timeLeft,
    timedOut,
  ]);

  const attemptMove = (r, c) => {
    if (finished || !round) return;

    if (trail.length === 0) {
      const key = posKey(r, c);
      const isCheckpoint = checkpointMap.has(key);
      const isValidFirstLetter = grid[r]?.[c]?.letter === word[0];
      if (!isCheckpoint || !isValidFirstLetter) {
        setRoundErrors((prev) => prev + 1);
        return;
      }
      const nextTrail = [{ r, c }];
      const nextSet = new Set([key]);
      const nextState = getSequenceStateFromTrail({
        trail: nextTrail,
        checkpointMap,
        grid,
        word,
      });
      setTrail(nextTrail);
      setTrailSet(nextSet);
      setProgress(nextState.progress);
      setMatchedCheckpointKeys(nextState.matchedKeys);
      setHintText("");
      return;
    }

    const from = trail[trail.length - 1];
    const to = { r, c };
    const toKey = posKey(r, c);
    const previous = trail.length > 1 ? trail[trail.length - 2] : null;

    if (previous && toKey === posKey(previous.r, previous.c)) {
      const nextTrail = trail.slice(0, -1);
      const nextSet = new Set(nextTrail.map((pos) => posKey(pos.r, pos.c)));
      const nextState = getSequenceStateFromTrail({
        trail: nextTrail,
        checkpointMap,
        grid,
        word,
      });
      setTrail(nextTrail);
      setTrailSet(nextSet);
      setProgress(nextState.progress);
      setMatchedCheckpointKeys(nextState.matchedKeys);
      setHintText("");
      return;
    }

    if (!areAdjacent(from, to)) return;
    if (blockedEdges.has(edgeKey(from, to))) {
      setRoundErrors((prev) => prev + 1);
      return;
    }
    if (trailSet.has(toKey)) {
      setRoundErrors((prev) => prev + 1);
      return;
    }

    const nextTrail = [...trail, to];
    const nextSet = new Set(trailSet);
    nextSet.add(toKey);
    const nextState = getSequenceStateFromTrail({
      trail: nextTrail,
      checkpointMap,
      grid,
      word,
    });

    setTrail(nextTrail);
    setTrailSet(nextSet);
    setProgress(nextState.progress);
    setMatchedCheckpointKeys(nextState.matchedKeys);
    setHintText("");
  };

  const startDrag = (r, c) => {
    setDragging(true);
    attemptMove(r, c);
  };

  const dragOver = (r, c) => {
    if (!dragging) return;
    attemptMove(r, c);
  };

  const endDrag = () => setDragging(false);
  const handleClick = (r, c) => {
    if (dragging) return;
    attemptMove(r, c);
  };

  const showHint = () => {
    if (finished) return;

    if (trail.length === 0) {
      const start = checkpoints[0];
      setHintText(
        start
          ? `Comece na letra ${word[0]} em (${start.r + 1}, ${start.c + 1}).`
          : "Sem dica disponivel.",
      );
      return;
    }

    const nextLetter = word[progress + 1];
    if (!nextLetter || !currentPos) return;

    const matchedSet = new Set(matchedCheckpointKeys);
    const candidates = checkpoints.filter((pos) => {
      const key = posKey(pos.r, pos.c);
      return (
        grid[pos.r]?.[pos.c]?.letter === nextLetter && !matchedSet.has(key)
      );
    });

    let bestRoute = null;
    candidates.forEach((target) => {
      const route = findPath({
        start: currentPos,
        target,
        blockedEdges,
        visited: trailSet,
        gridSize: boardGridSize,
      });

      if (!route || route.length < 2) return;
      if (!bestRoute || route.length < bestRoute.length) {
        bestRoute = route;
      }
    });

    if (!bestRoute || bestRoute.length < 2) {
      setHintText("Sem rota valida a partir da posicao atual.");
      return;
    }

    const next = bestRoute[1];
    const dir = getDirectionName(currentPos, next);
    setHintText(`Proximo passo: ${dir}.`);
  };

  const hasRound = Boolean(round && grid.length > 0);
  const cellSize = boardSize / boardGridSize;

  const wallSegments = useMemo(() => {
    if (!round) return [];
    const segments = [];
    const t = Math.max(6, cellSize * 0.12);

    for (let r = 0; r < boardGridSize; r += 1) {
      for (let c = 0; c < boardGridSize; c += 1) {
        if (c + 1 < boardGridSize) {
          const a = { r, c };
          const b = { r, c: c + 1 };
          if (blockedEdges.has(edgeKey(a, b))) {
            segments.push({
              key: `v-${r}-${c}`,
              x: (c + 1) * cellSize - t / 2,
              y: r * cellSize + cellSize * 0.14,
              width: t,
              height: cellSize * 0.72,
            });
          }
        }

        if (r + 1 < boardGridSize) {
          const a = { r, c };
          const b = { r: r + 1, c };
          if (blockedEdges.has(edgeKey(a, b))) {
            segments.push({
              key: `h-${r}-${c}`,
              x: c * cellSize + cellSize * 0.14,
              y: (r + 1) * cellSize - t / 2,
              width: cellSize * 0.72,
              height: t,
            });
          }
        }
      }
    }

    return segments;
  }, [round, blockedEdges, cellSize, boardGridSize]);

  const trailSegments = useMemo(() => {
    const segs = [];
    if (trail.length === 0) return segs;

    const thickness = Math.max(10, cellSize * 0.24);

    for (let i = 0; i < trail.length - 1; i += 1) {
      const a = trail[i];
      const b = trail[i + 1];

      const x1 = a.c * cellSize + cellSize / 2;
      const y1 = a.r * cellSize + cellSize / 2;
      const x2 = b.c * cellSize + cellSize / 2;
      const y2 = b.r * cellSize + cellSize / 2;

      if (a.r === b.r) {
        segs.push({
          key: `th-${i}`,
          x: Math.min(x1, x2),
          y: y1 - thickness / 2,
          width: Math.abs(x2 - x1),
          height: thickness,
        });
      } else {
        segs.push({
          key: `tv-${i}`,
          x: x1 - thickness / 2,
          y: Math.min(y1, y2),
          width: thickness,
          height: Math.abs(y2 - y1),
        });
      }
    }

    return segs;
  }, [trail, cellSize]);

  const collectedLetters = useMemo(
    () =>
      trail.map((pos) => grid[pos.r]?.[pos.c]?.letter ?? "").filter(Boolean),
    [trail, grid],
  );

  return (
    <div className="labirinto panel" onPointerUp={endDrag}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">Labirinto</p>
          <h2>{finished ? "Resultado" : "Forme a palavra no caminho"}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">
          Pontos: {calcularPontos(progress + 1, word.length || 1)}
        </span>
        <span className="pill">Erros: {sessionErrors + roundErrors}</span>
      </div>

      <div className="word-progress" aria-label="Letras ja passadas">
        {collectedLetters.length === 0 ? (
          <span className="word-progress-empty">
            A palavra vai surgir conforme a linha avança.
          </span>
        ) : (
          collectedLetters.map((ch, idx) => (
            <span key={`wp-${idx}`} className="word-progress-char done">
              {ch}
            </span>
          ))
        )}
      </div>

      {!hasRound ? (
        <div className="result-box">
          <p>Nao foi possivel montar o labirinto agora.</p>
          <button className="primary" onClick={newGame}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="maze-hint">
            Arraste com o dedo/mouse a partir da primeira letra e siga os
            corredores.
            {hintText ? <span className="hint-msg"> {hintText}</span> : null}
          </div>

          <div className="maze-actions">
            <button
              className="primary"
              onClick={resetAttempt}
              disabled={finished}
            >
              Limpar
            </button>
            <button className="primary" onClick={showHint} disabled={finished}>
              Dica
            </button>
          </div>

          <div
            ref={boardRef}
            className="maze-board"
            style={{ width: "100%", maxWidth: 560 }}
          >
            <div
              className="maze-grid"
              role="grid"
              aria-label="Labirinto de letras"
              style={{
                gridTemplateColumns: `repeat(${boardGridSize}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const key = posKey(r, c);
                  const isTrail = trailSet.has(key);
                  const cpIndex = checkpointMap.get(key);
                  const isStartCheckpoint =
                    shouldMarkFirstCheckpoint &&
                    cpIndex !== undefined &&
                    cell.letter === word[0];

                  return (
                    <button
                      key={cell.key}
                      role="gridcell"
                      className={`maze-cell ${isTrail ? "trail" : ""} ${isStartCheckpoint ? "checkpoint" : ""}`}
                      onPointerDown={() => startDrag(r, c)}
                      onPointerEnter={() => dragOver(r, c)}
                      onPointerUp={endDrag}
                      onClick={() => handleClick(r, c)}
                      disabled={finished}
                    >
                      <span
                        className={`cell-letter ${cell.letter ? "filled" : "empty"}`}
                      >
                        {cell.letter}
                      </span>
                    </button>
                  );
                }),
              )}
            </div>

            <div className="maze-overlay" aria-hidden="true">
              {trailSegments.map((seg) => (
                <div
                  key={seg.key}
                  className="trail-segment"
                  style={{
                    left: seg.x,
                    top: seg.y,
                    width: seg.width,
                    height: seg.height,
                  }}
                />
              ))}
              {trail.map((p, idx) => (
                <div
                  key={`node-${idx}`}
                  className="trail-node"
                  style={{
                    left: p.c * cellSize + cellSize / 2,
                    top: p.r * cellSize + cellSize / 2,
                    width: Math.max(14, cellSize * 0.28),
                    height: Math.max(14, cellSize * 0.28),
                  }}
                />
              ))}
              {wallSegments.map((seg) => (
                <div
                  key={seg.key}
                  className="wall-segment"
                  style={{
                    left: seg.x,
                    top: seg.y,
                    width: seg.width,
                    height: seg.height,
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {finished && (
        <div className="result-box" aria-live="polite">
          <p>{timedOut ? "Tempo esgotado" : `Palavra ${word} concluida`}</p>
          <p>
            Pontos: {calcularPontos(progress + 1, word.length || 1)} | Erros:{" "}
            {sessionErrors + roundErrors}
          </p>
          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.totalPoints ?? 0} pts</span>
                  <span>{row.totalErrors ?? 0} erros</span>
                </div>
              ))}
            </div>
          )}
          <button className="primary" onClick={newGame}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}
