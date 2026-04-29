/**
 * Gera um grid de caça-palavras com palavras posicionadas aleatoriamente
 * @param {string[]} words - Array de palavras (maiúsculas)
 * @param {number} size - Tamanho inicial da grade (10 = 10x10)
 * @param {number} maxAttempts - Máximo de tentativas de posicionamento
 * @returns {string[][] | null} Grid 2D preenchido ou null se falhar
 */
export function generateGrid(words, size = 10, maxAttempts = 50) {
    const ordered = [...words].sort((a, b) => b.length - a.length);

    const attemptSize = (currentSize) => {
        const emptyGrid = () =>
            Array.from({ length: currentSize }, () =>
                Array.from({ length: currentSize }, () => ""),
            );

        const canPlace = (grid, word, row, col, horizontal) => {
            for (let i = 0; i < word.length; i += 1) {
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
            for (let i = 0; i < word.length; i += 1) {
                const r = horizontal ? row : row + i;
                const c = horizontal ? col + i : col;
                grid[r][c] = word[i];
            }
        };

        const tryPlaceWord = (grid, word, attempts = 400) => {
            const maxRowBase = currentSize - word.length;
            const maxColBase = currentSize - word.length;
            if (maxRowBase < 0 || maxColBase < 0) return false;

            for (let i = 0; i < attempts; i += 1) {
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

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const grid = emptyGrid();
            let allPlaced = true;

            for (const word of ordered) {
                if (!tryPlaceWord(grid, word)) {
                    allPlaced = false;
                    break;
                }
            }

            if (allPlaced) {
                for (let r = 0; r < currentSize; r += 1) {
                    for (let c = 0; c < currentSize; c += 1) {
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

    for (let grow = 0; grow <= 3; grow += 1) {
        const grid = attemptSize(size + grow);
        if (grid) return grid;
    }

    return null;
}
