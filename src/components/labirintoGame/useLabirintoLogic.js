import { useEffect, useMemo, useRef, useState } from "react";
import { shuffle } from "../../utils/array";

const DEFAULT_GRID_SIZE = 8;
const MIN_GAP_STEPS = 2;
const MAX_GAP_STEPS = 6;

// Probabilidade de parede varia com tamanho do grid
const getWallProbability = (gridSize) => {
    if (gridSize <= 5) return 0.05; // Muito poucas paredes em grids pequenos
    if (gridSize <= 8) return 0.20; // Poucas paredes
    return 0.28; // Normal para grids grandes
};

const DELTAS = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
];

const posKey = (r, c) => `${r}-${c}`;
const edgeKey = (a, b) => {
    const ka = posKey(a.r, a.c);
    const kb = posKey(b.r, b.c);
    return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};

const inBounds = (r, c, gridSize) => r >= 0 && c >= 0 && r < gridSize && c < gridSize;
const areAdjacent = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
const copyPos = (pos) => ({ r: pos.r, c: pos.c });

const isCornerCell = (r, c, gridSize) => {
    const last = gridSize - 1;
    return (r === 0 || r === last) && (c === 0 || c === last);
};

const getGapRange = (gridSize) => {
    if (gridSize <= 5) return { min: 1, max: 2 };
    if (gridSize <= 8) return { min: 2, max: 4 };
    return { min: 3, max: 6 };
};

const isValidSegment = (path, blockedEdges, gridSize) => {
    if (!Array.isArray(path) || path.length < 2) return false;

    for (let i = 0; i < path.length; i += 1) {
        const p = path[i];
        if (!inBounds(p.r, p.c, gridSize)) return false;

        if (i > 0) {
            const prev = path[i - 1];
            if (!areAdjacent(prev, p)) return false;
            if (blockedEdges.has(edgeKey(prev, p))) return false;
        }
    }

    return true;
};

const isRoundCompletable = ({ word, checkpoints, blockedEdges, solutionPaths, gridSize }) => {
    if (!word || !Array.isArray(checkpoints) || checkpoints.length !== word.length) {
        return false;
    }
    if (!Array.isArray(solutionPaths) || solutionPaths.length !== Math.max(0, checkpoints.length - 1)) {
        return false;
    }

    const trail = [];
    for (let idx = 0; idx < solutionPaths.length; idx += 1) {
        const segment = solutionPaths[idx];
        if (!isValidSegment(segment, blockedEdges, gridSize)) {
            return false;
        }

        if (idx === 0) {
            trail.push(...segment);
        } else {
            // Evita duplicar o checkpoint de junção.
            trail.push(...segment.slice(1));
        }
    }

    if (trail.length === 0) return false;

    const visited = new Set();
    for (let i = 0; i < trail.length; i += 1) {
        const key = posKey(trail[i].r, trail[i].c);
        if (visited.has(key)) {
            return false;
        }
        visited.add(key);
    }

    // Confirma que checkpoints aparecem na trilha e na ordem correta.
    let checkpointCursor = 0;
    for (let i = 0; i < trail.length && checkpointCursor < checkpoints.length; i += 1) {
        const t = trail[i];
        const cp = checkpoints[checkpointCursor];
        if (t.r === cp.r && t.c === cp.c) {
            checkpointCursor += 1;
        }
    }

    return checkpointCursor === checkpoints.length;
};

const generateLetterPath = (word, gridSize) => {
    const maxAttempts = gridSize <= 5 ? 5000 : (gridSize <= 8 ? 2000 : 1000);

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
            const gaps = getGapRange(gridSize);
            const minDistance = gaps.min;
            const maxDistance = gaps.max;
            const isMiddleLetter = i > 0 && i < word.length - 1;
            const candidates = [];

            for (let r = 0; r < gridSize; r += 1) {
                for (let c = 0; c < gridSize; c += 1) {
                    const candidate = { r, c };
                    const key = posKey(r, c);
                    if (visited.has(key)) continue;

                    // Regra solicitada: letras do meio nao podem ficar nos cantos (apenas para grids maiores).
                    if (gridSize >= 8 && isMiddleLetter && isCornerCell(r, c, gridSize)) continue;

                    const manhattan = Math.abs(candidate.r - current.r) + Math.abs(candidate.c - current.c);
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

        if (ok && checkpoints.length === word.length) {
            console.log(`[generateLetterPath] ✓ Sucesso no attempt ${attempt + 1}`);
            return checkpoints;
        }
    }

    console.warn(`[generateLetterPath] ✗ Falha após ${maxAttempts} tentativas`);
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

    if (startK === targetK) return [start, target];

    const queue = [copyPos(start)];
    const seen = new Set([startK]);
    const prev = new Map();

    // Timeout protection: max iterations
    const MAX_ITERATIONS = gridSize * gridSize * 2;
    let iterations = 0;

    while (queue.length > 0 && iterations < MAX_ITERATIONS) {
        iterations += 1;
        const current = queue.shift();
        const currentK = posKey(current.r, current.c);

        if (currentK === targetK) {
            const path = [];
            let walk = targetK;
            let pathWalkIterations = 0;

            while (walk && pathWalkIterations < MAX_ITERATIONS) {
                pathWalkIterations += 1;
                const [wr, wc] = walk.split("-").map(Number);
                path.push({ r: wr, c: wc });
                if (walk === startK) break;
                walk = prev.get(walk);
            }

            // Only return if we actually reached start
            if (path.length > 0 && path[path.length - 1].r === start.r && path[path.length - 1].c === start.c) {
                return path.reverse();
            }
            return null;
        }

        for (const d of DELTAS) {
            const next = { r: current.r + d.dr, c: current.c + d.dc };
            if (!inBounds(next.r, next.c, gridSize)) continue;
            const nextK = posKey(next.r, next.c);
            if (seen.has(nextK)) continue;
            if (blockedEdges.has(edgeKey(current, next))) continue;
            if (forbiddenCells.has(nextK) && nextK !== targetK) continue;
            if (checkpointCells.has(nextK) && nextK !== targetK && nextK !== startK) continue;

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
    const checkpointCells = new Set(checkpoints.map((pos) => posKey(pos.r, pos.c)));

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
            console.warn(`[buildBlockedEdges] ✗ Falha ao conectar checkpoint ${i} → ${i + 1}`);
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
            const wallProb = getWallProbability(gridSize);
            if (c + 1 < gridSize) {
                const a = { r, c };
                const b = { r, c: c + 1 };
                const key = edgeKey(a, b);
                if (!solutionEdges.has(key) && Math.random() < wallProb) {
                    blocked.add(key);
                }
            }

            if (r + 1 < gridSize) {
                const a = { r, c };
                const b = { r: r + 1, c };
                const key = edgeKey(a, b);
                if (!solutionEdges.has(key) && Math.random() < wallProb) {
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

const generateRound = (words, gridSize, depth = 0) => {
    const MAX_DEPTH = gridSize <= 5 ? 200 : (gridSize <= 8 ? 100 : 50);

    if (!words || words.length === 0) return null;
    if (depth > MAX_DEPTH) return null;

    const eligibleWords = words.filter((word) => word.length <= gridSize);
    const pool = eligibleWords.length > 0 ? eligibleWords : words;
    const word = pool[Math.floor(Math.random() * pool.length)];
    const checkpoints = generateLetterPath(word, gridSize);
    if (!checkpoints) {
        return generateRound(words, gridSize, depth + 1);
    }

    const checkpointMap = new Map();
    checkpoints.forEach((p, idx) => checkpointMap.set(posKey(p.r, p.c), idx));

    const grid = Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => ({ key: posKey(r, c), letter: "" })),
    );

    checkpoints.forEach((p, idx) => {
        grid[p.r][p.c].letter = word[idx];
    });

    const blockedResult = buildBlockedEdges(checkpoints, gridSize);
    if (!blockedResult) {
        return generateRound(words, gridSize, depth + 1);
    }
    const { blocked: blockedEdges, solutionPaths } = blockedResult;

    checkpoints.forEach((p, idx) => {
        grid[p.r][p.c].letter = word[idx];
    });

    const candidateRound = {
        word,
        checkpoints,
        checkpointMap,
        blockedEdges,
        solutionPaths,
        grid,
    };

    if (!isRoundCompletable({
        word,
        checkpoints,
        blockedEdges,
        solutionPaths,
        gridSize,
    })) {
        return generateRound(words, gridSize, depth + 1);
    }

    return candidateRound;
};

const debugRoundFailure = ({ source, words, gridSize }) => {
    const safeWords = Array.isArray(words) ? words : [];
    const lengths = safeWords
        .map((w) => String(w ?? "").trim().length)
        .filter((n) => n > 0);
    const uniqueLengths = Array.from(new Set(lengths)).sort((a, b) => a - b);

    console.warn("[Labirinto][DEBUG] Falha ao montar round", {
        source,
        gridSize,
        wordsCount: safeWords.length,
        availableWordLengths: uniqueLengths,
        sampleWords: safeWords.slice(0, 8),
    });
};

const createRoundWithDebug = ({ words, gridSize, source }) => {
    if (!words || words.length === 0) {
        return null;
    }
    const round = generateRound(words, gridSize);
    if (!round) {
        debugRoundFailure({ source, words, gridSize });
    }
    return round;
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

export default function useLabirintoLogic({
    data = {},
    config = {},
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const { words = [] } = data;
    const { timeLimitSeconds = 120, gridSize = DEFAULT_GRID_SIZE } = config;

    const [round, setRound] = useState(() => {
        if (words && words.length > 0) {
            return createRoundWithDebug({
                words,
                gridSize,
                source: "initial-state",
            });
        }
        return null;
    });
    const [progress, setProgress] = useState(-1);
    const [trail, setTrail] = useState([]);
    const [trailSet, setTrailSet] = useState(new Set());
    const [matchedCheckpointKeys, setMatchedCheckpointKeys] = useState([]);
    const [dragging, setDragging] = useState(false);
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
            if (width) {
                console.debug(`[Labirinto V3] ResizeObserver: width=${width}`);
                setBoardSize(width);
            }
        });
        observer.observe(boardRef.current);
        return () => observer.disconnect();
    }, [round]);

    const resetAttempt = () => {
        setProgress(-1);
        setTrail([]);
        setTrailSet(new Set());
        setMatchedCheckpointKeys([]);
        setDragging(false);
        setHintText("");
    };

    const newGame = () => {
        if (words && words.length > 0) {
            setRound(createRoundWithDebug({
                words,
                gridSize: boardGridSize,
                source: "newGame",
            }));
        }
        setProgress(-1);
        setTrail([]);
        setTrailSet(new Set());
        setMatchedCheckpointKeys([]);
        setDragging(false);
        setTimeLeft(timeLimitSeconds);
        setFinished(false);
        setTimedOut(false);
        setReported(false);
        setHintText("");
    };

    useEffect(() => {
        newGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLimitSeconds]);

    useEffect(() => {
        if (words && words.length > 0) {
            setRound(createRoundWithDebug({
                words,
                gridSize: boardGridSize,
                source: "words-or-grid-change",
            }));
        } else {
            setRound(null);
        }
        setProgress(-1);
        setTrail([]);
        setTrailSet(new Set());
        setMatchedCheckpointKeys([]);
        setDragging(false);
        setTimeLeft(timeLimitSeconds);
        setFinished(false);
        setTimedOut(false);
        setReported(false);
        setHintText("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setFinished(true);
        }
    }, [progress, word, finished, words, boardGridSize]);

    useEffect(() => {
        if (finished && !reported) {
            const partialPoints = Math.floor((Math.max(0, progress + 1) / (word.length || 1)) * 100);
            const payload = {
                game: "Labirinto",
                score: partialPoints,
                points: partialPoints,
                remainingSeconds: timedOut ? 0 : timeLeft,
                timedOut,
            };
            onScore?.(payload);

            if (timedOut) {
                onGameOver?.(payload);
            } else {
                onRoundComplete?.(payload);
            }

            setReported(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished, reported, onScore, onRoundComplete, onGameOver, progress, word, timeLeft, timedOut]);

    const attemptMove = (r, c) => {
        if (finished || !round) return;

        if (trail.length === 0) {
            const key = posKey(r, c);
            const isCheckpoint = checkpointMap.has(key);
            const isValidFirstLetter = grid[r]?.[c]?.letter === word[0];
            if (!isCheckpoint || !isValidFirstLetter) {
                return;
            }
            const nextTrail = [{ r, c }];
            const nextSet = new Set([key]);
            const nextState = getSequenceStateFromTrail({ trail: nextTrail, checkpointMap, grid, word });
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
            const nextState = getSequenceStateFromTrail({ trail: nextTrail, checkpointMap, grid, word });
            setTrail(nextTrail);
            setTrailSet(nextSet);
            setProgress(nextState.progress);
            setMatchedCheckpointKeys(nextState.matchedKeys);
            setHintText("");
            return;
        }

        if (!areAdjacent(from, to)) return;
        if (blockedEdges.has(edgeKey(from, to))) {
            return;
        }
        if (trailSet.has(toKey)) {
            return;
        }

        const nextTrail = [...trail, to];
        const nextSet = new Set(trailSet);
        nextSet.add(toKey);
        const nextState = getSequenceStateFromTrail({ trail: nextTrail, checkpointMap, grid, word });

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
            setHintText(start ? `Comece na letra ${word[0]} em (${start.r + 1}, ${start.c + 1}).` : "Sem dica disponivel.");
            return;
        }

        const nextLetter = word[progress + 1];
        if (!nextLetter || !currentPos) return;

        const matchedSet = new Set(matchedCheckpointKeys);
        const candidates = checkpoints.filter((pos) => {
            const key = posKey(pos.r, pos.c);
            return grid[pos.r]?.[pos.c]?.letter === nextLetter && !matchedSet.has(key);
        });

        let bestRoute = null;
        candidates.forEach((target) => {
            const route = findPath({ start: currentPos, target, blockedEdges, visited: trailSet, gridSize: boardGridSize });

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
    if (hasRound) {
        console.debug(`[Labirinto V3] alignment debug: boardSize=${boardSize}, cellSize=${cellSize}, grid=${boardGridSize}`);
    }

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
                        segments.push({ key: `v-${r}-${c}`, x: (c + 1) * cellSize - t / 2, y: r * cellSize, width: t, height: cellSize });
                    }
                }

                if (r + 1 < boardGridSize) {
                    const a = { r, c };
                    const b = { r: r + 1, c };
                    if (blockedEdges.has(edgeKey(a, b))) {
                        segments.push({ key: `h-${r}-${c}`, x: c * cellSize, y: (r + 1) * cellSize - t / 2, width: cellSize, height: t });
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
                segs.push({ key: `th-${i}`, x: Math.min(x1, x2), y: y1 - thickness / 2, width: Math.abs(x2 - x1), height: thickness });
            } else {
                segs.push({ key: `tv-${i}`, x: x1 - thickness / 2, y: Math.min(y1, y2), width: thickness, height: Math.abs(y2 - y1) });
            }
        }

        return segs;
    }, [trail, cellSize]);

    const collectedLetters = useMemo(() => trail.map((pos) => grid[pos.r]?.[pos.c]?.letter ?? "").filter(Boolean), [trail, grid]);

    return {
        // state
        round,
        word,
        grid,
        checkpoints,
        checkpointMap,
        blockedEdges,
        progress,
        trail,
        trailSet,
        matchedCheckpointKeys,
        dragging,
        timeLeft,
        finished,
        timedOut,
        hintText,
        boardRef,
        boardSize,
        cellSize,
        hasRound,
        shouldMarkFirstCheckpoint,
        boardGridSize,
        collectedLetters,
        wallSegments,
        trailSegments,
        // actions
        startDrag,
        dragOver,
        endDrag,
        handleClick,
        resetAttempt,
        newGame,
        showHint,
        posKey,
    };
}
