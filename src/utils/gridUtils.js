/**
 * Constantes direcionais para iteração ortogonal no grid (Cima, Baixo, Esquerda, Direita)
 */
export const DELTAS = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

/**
 * Verifica se a coordenada está dentro dos limites do grid
 */
export const inBounds = (r, c, gridSize) =>
  r >= 0 && c >= 0 && r < gridSize && c < gridSize;

/**
 * Retorna uma chave única para a posição no formato "r-c"
 */
export const posKey = (r, c) => `${r}-${c}`;

/**
 * Retorna uma chave única representativa de uma aresta (borda) entre duas posições adjacentes,
 * independentemente da ordem dos nós.
 */
export const edgeKey = (a, b) => {
  const ka = posKey(a.r, a.c);
  const kb = posKey(b.r, b.c);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};

/**
 * Verifica se duas posições no grid são adjacentes horizontalmente ou verticalmente.
 */
export const areAdjacent = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

/**
 * Copia uma posição gerando um novo objeto para evitar mutações.
 */
export const copyPos = (pos) => ({ r: pos.r, c: pos.c });

/**
 * Obtém a direção relativa em texto (cima, baixo, esquerda, direita) de uma posição origem para destino.
 */
export const getDirectionName = (from, to) => {
  if (to.r < from.r) return "cima";
  if (to.r > from.r) return "baixo";
  if (to.c < from.c) return "esquerda";
  return "direita";
};
