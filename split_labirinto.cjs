const fs = require('fs');

const content = fs.readFileSync('src/components/labirintoGame/LabirintoGame.jsx', 'utf8');
const logicParts = content.split('export default function LabirintoGame');

const headerLogic = logicParts[0].replace('import { useEffect, useMemo, useRef, useState } from "react";\nimport "./labirintoGame.style.css";\n', '').trim();
const componentBody = logicParts[1];

const hookCode = `import { useEffect, useMemo, useRef, useState } from "react";

${headerLogic}

export default function useLabirintoLogic({
  data = {},
  settings = {},
  onScore,
  onRoundComplete,
  onGameOver,
}) {
  const { words = [] } = data;
  const { timeLimitSeconds = 120, gridSize = DEFAULT_GRID_SIZE } = settings;
${componentBody.substring(componentBody.indexOf('const [round, setRound]'), componentBody.indexOf('return (')).trim()}

  const posKey = (r, c) => \`\${r}-\${c}\`;

  return {
    word, checkpoints, checkpointMap, blockedEdges, grid,
    currentPos, shouldMarkFirstCheckpoint, boardGridSize,
    round, progress, trail, trailSet, matchedCheckpointKeys,
    dragging, errors, timeLeft, finished, timedOut, hintText,
    boardRef, boardSize, cellSize, hasRound, wallSegments,
    trailSegments, collectedLetters, startDrag, dragOver, endDrag,
    handleClick, resetAttempt, newGame, showHint,
    posKey
  };
}
`;

fs.writeFileSync('src/components/labirintoGame/useLabirintoLogic.js', hookCode);

const newComponentCode = `import useLabirintoLogic from "./useLabirintoLogic";
import "./labirintoGame.style.css";

export default function LabirintoGame({
  data = {},
  settings = {},
  ranking = [],
  onScore,
  onRoundComplete,
  onGameOver,
}) {
  const logic = useLabirintoLogic({ data, settings, onScore, onRoundComplete, onGameOver });
  const {
    word, grid, checkpointMap, blockedEdges,
    currentPos, shouldMarkFirstCheckpoint, boardGridSize,
    round, progress, trail, trailSet, matchedCheckpointKeys,
    dragging, errors, timeLeft, finished, timedOut, hintText,
    boardRef, boardSize, cellSize, hasRound, wallSegments,
    trailSegments, collectedLetters, startDrag, dragOver, endDrag,
    handleClick, resetAttempt, newGame, showHint,
    posKey
  } = logic;

  ${componentBody.substring(componentBody.indexOf('return ('))}
`;

fs.writeFileSync('src/components/labirintoGame/LabirintoGame.jsx', newComponentCode);

console.log("Done refactoring.");
