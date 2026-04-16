import { useEffect, useMemo, useState, useCallback } from "react";
import "./wordSearchGame.style.css";

function generateGrid(words, size = 10, maxAttempts = 50) {
  const ordered = [...words].sort((a, b) => b.length - a.length);

  const attemptSize = (currentSize) => {
    const emptyGrid = () =>
      Array.from({ length: currentSize }, () =>
        Array.from({ length: currentSize }, () => ""),
      );

    const canPlace = (grid, word, row, col, horizontal) => {
      for (let i = 0; i < word.length; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        if (r < 0 || c < 0 || r >= currentSize || c >= currentSize)
          return false;
        const cell = grid[r][c];
        if (cell && cell !== word[i]) return false;
      }
      return true;
    };

    const applyPlace = (grid, word, row, col, horizontal) => {
      for (let i = 0; i < word.length; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        grid[r][c] = word[i];
      }
    };

    const tryPlaceWord = (grid, word, attempts = 400) => {
      const maxRowBase = currentSize - word.length;
      const maxColBase = currentSize - word.length;
      if (maxRowBase < 0 || maxColBase < 0) return false;
      for (let i = 0; i < attempts; i++) {
        const horizontal = Math.random() > 0.5;
        const maxRow = horizontal ? currentSize - 1 : maxRowBase;
        const maxCol = horizontal ? maxColBase : currentSize - 1;
        const row = Math.floor(Math.random() * (maxRow + 1));
        const col = Math.floor(Math.random() * (maxCol + 1));
        if (canPlace(grid, word, row, col, horizontal)) {
          applyPlace(grid, word, row, col, horizontal);
          return true;
        }
      }
      return false;
    };

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const grid = emptyGrid();
      let allPlaced = true;
      for (const w of ordered) {
        if (!tryPlaceWord(grid, w)) {
          allPlaced = false;
          break;
        }
      }
      if (allPlaced) {
        for (let r = 0; r < currentSize; r++) {
          for (let c = 0; c < currentSize; c++) {
            if (!grid[r][c]) {
              grid[r][c] = String.fromCharCode(
                65 + Math.floor(Math.random() * 26),
              );
            }
          }
        }
        return grid;
      }
    }
    return null;
  };

  // Tenta com o tamanho solicitado e cresce até +3 se falhar
  for (let grow = 0; grow <= 3; grow++) {
    const grid = attemptSize(size + grow);
    if (grid) return grid;
  }

  return null; // sinaliza falha após esgotar tentativas
}

export default function WordSearchGame({
  words = [],
  onScore,
  timeLimitSeconds = 120,
  livesLimit = 5,
  ranking = [],
  gridSize = null,
  maxAttempts = 50,
  maxWords = null,
}) {
  const upperWords = useMemo(() => words.map((w) => w.toUpperCase()), [words]);
  const computedSize = useMemo(() => {
    const longest = upperWords.reduce((acc, w) => Math.max(acc, w.length), 0);
    return gridSize ?? Math.max(10, longest + 2);
  }, [upperWords, gridSize]);

  const wordsFitting = useMemo(() => {
    const fitting = upperWords.filter((w) => w.length <= computedSize);
    return maxWords ? fitting.slice(0, maxWords) : fitting;
  }, [upperWords, computedSize, maxWords]);

  const [grid, setGrid] = useState(() =>
    generateGrid(wordsFitting, computedSize, maxAttempts),
  );
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [found, setFound] = useState(new Set());
  const [foundCells, setFoundCells] = useState(new Set());
  const [direction, setDirection] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);
  const [livesLeft, setLivesLeft] = useState(livesLimit);
  const [outOfLives, setOutOfLives] = useState(false);
  const [generationFailed, setGenerationFailed] = useState(false);
  const noWords = wordsFitting.length === 0;
  const gridCols = grid?.[0]?.length ?? computedSize;
  const gridStyle = useMemo(() => ({ "--ws-cols": gridCols }), [gridCols]);

  const reset = useCallback(() => {
    const newGrid = noWords
      ? null
      : generateGrid(wordsFitting, computedSize, maxAttempts);
    setGenerationFailed(!noWords && newGrid === null);
    setGrid(newGrid);
    setSelecting(false);
    setSelected([]);
    setFound(new Set());
    setFoundCells(new Set());
    setDirection(null);
    setTimeLeft(timeLimitSeconds);
    setFinished(noWords || newGrid === null);
    setTimedOut(false);
    setReported(false);
    setLivesLeft(livesLimit);
    setOutOfLives(false);
  }, [
    wordsFitting,
    timeLimitSeconds,
    livesLimit,
    noWords,
    computedSize,
    maxAttempts,
  ]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (finished) return undefined;
    if (noWords || generationFailed) return undefined;
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
  }, [finished, noWords, generationFailed]);

  useEffect(() => {
    if (noWords || generationFailed) return;
    if (found.size === wordsFitting.length && !finished) {
      setFinished(true);
    }
  }, [found, wordsFitting.length, finished, noWords, generationFailed]);

  useEffect(() => {
    if ((noWords || generationFailed) && !reported) {
      onScore?.({
        game: "Caça-palavras",
        score: 0,
        elapsedMs: 0,
        timedOut: true,
      });
      setReported(true);
      return;
    }
    if (finished && !reported) {
      const elapsedMs = Math.max(0, (timeLimitSeconds - timeLeft) * 1000);
      onScore?.({
        game: "Caça-palavras",
        score: found.size,
        elapsedMs,
        timedOut: timedOut || outOfLives,
      });
      setReported(true);
    }
  }, [
    finished,
    reported,
    onScore,
    found.size,
    timeLimitSeconds,
    timeLeft,
    timedOut,
    outOfLives,
    noWords,
    generationFailed,
  ]);

  const beginSelect = (row, col) => {
    if (finished || noWords || generationFailed) return;
    setSelecting(true);
    setSelected([{ row, col }]);
    setDirection(null);
  };

  const extendSelect = (row, col) => {
    if (!selecting || finished || noWords || generationFailed) return;
    const exists = selected.some((c) => c.row === row && c.col === col);
    if (exists) return;

    const last = selected[selected.length - 1];

    if (!direction) {
      const dr = row - last.row;
      const dc = col - last.col;
      const straight =
        (dr === 0 && Math.abs(dc) === 1) || (dc === 0 && Math.abs(dr) === 1);
      if (!straight) return;
      setDirection({ dr: Math.sign(dr), dc: Math.sign(dc) });
      setSelected((prev) => [...prev, { row, col }]);
      return;
    }

    const nextRow = last.row + direction.dr;
    const nextCol = last.col + direction.dc;
    if (row !== nextRow || col !== nextCol) return;

    setSelected((prev) => [...prev, { row, col }]);
  };

  const finishSelect = () => {
    if (!selecting || finished || noWords || generationFailed) return;
    const letters = selected.map((c) => grid[c.row][c.col]).join("");
    const reverse = letters.split("").reverse().join("");
    const matchWord = wordsFitting.find((w) => w === letters || w === reverse);
    if (matchWord && !found.has(matchWord)) {
      const nextFound = new Set(found);
      nextFound.add(matchWord);
      setFound(nextFound);
      const nextCells = new Set(foundCells);
      selected.forEach((c) => nextCells.add(`${c.row}-${c.col}`));
      setFoundCells(nextCells);
    } else if (!matchWord) {
      setLivesLeft((prev) => {
        const nextLives = Math.max(0, prev - 1);
        if (nextLives === 0) {
          setFinished(true);
          setOutOfLives(true);
        }
        return nextLives;
      });
    }
    setSelecting(false);
    setSelected([]);
    setDirection(null);
  };

  const isSelected = (row, col) =>
    selected.some((c) => c.row === row && c.col === col);
  const isFound = (row, col) => foundCells.has(`${row}-${col}`);

  return (
    <div className="word-search panel" onPointerUp={finishSelect}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">Caça-palavras</p>
          <h2>Encontre todas as palavras</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Vidas: {livesLeft}</span>
        <span className="pill">
          {found.size}/{wordsFitting.length} achadas
        </span>
      </div>

      {!noWords && !generationFailed && grid ? (
        <div className="ws-grid" role="grid" style={gridStyle}>
          {grid.map((row, rIdx) => (
            <div className="ws-row" role="row" key={rIdx}>
              {row.map((cell, cIdx) => {
                const selectedClass = isSelected(rIdx, cIdx) ? "selected" : "";
                const foundClass = isFound(rIdx, cIdx) ? "found" : "";
                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    className={`ws-cell ${selectedClass} ${foundClass}`}
                    onPointerDown={() => beginSelect(rIdx, cIdx)}
                    onPointerEnter={() => extendSelect(rIdx, cIdx)}
                    onPointerUp={finishSelect}
                  >
                    {cell}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="result-box" aria-live="polite">
          <p>
            {noWords
              ? "Sem palavras para jogar."
              : "Não foi possível gerar a grade."}
          </p>
          <button className="primary" onClick={reset}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="ws-words">
        {wordsFitting.map((word) => (
          <span
            key={word}
            className={`word-chip ${found.has(word) ? "done" : ""}`}
          >
            {word}
          </span>
        ))}
      </div>

      {(finished || timedOut) && (
        <div className="result-box" aria-live="polite">
          <p>
            {timedOut
              ? "Tempo esgotado"
              : outOfLives
                ? "Sem vidas"
                : "Concluído"}
          </p>
          <p>
            {found.size}/{wordsFitting.length} palavras | Tempo:{" "}
            {timeLimitSeconds - timeLeft}s
          </p>
          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.score} pts</span>
                  <span>{Math.round((row.elapsedMs ?? 0) / 1000)}s</span>
                </div>
              ))}
            </div>
          )}
          <button className="primary" onClick={reset}>
            Novo jogo
          </button>
        </div>
      )}
    </div>
  );
}
