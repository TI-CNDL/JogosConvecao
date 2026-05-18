/**
 * MÓDULO GERADOR DE TABULEIRO PARA CAÇA-PALAVRAS (grid.js)
 * Contém o algoritmo responsável por criar uma matriz bidimensional, posicionar
 * uma lista de palavras aleatoriamente (na horizontal ou vertical) e preencher
 * as células restantes com letras aleatórias.
 *
 * @param {string[]} words - Array de palavras em letras maiúsculas a serem posicionadas no grid.
 * @param {number} size - Tamanho inicial desejado para a grade (ex: 10 para um tabuleiro 10x10).
 * @param {number} maxAttempts - Número máximo de tentativas globais para posicionar todas as palavras no grid atual.
 * @returns {string[][] | null} Matriz 2D contendo as letras do caça-palavras ou null caso não seja possível encaixar todas.
 */
export function generateGrid(words, size = 10, maxAttempts = 50) {
    // Ordena as palavras da maior para a menor. Posicionar palavras longas primeiro aumenta drasticamente
    // a taxa de sucesso do algoritmo de encaixe.
    const ordered = [...words].sort((a, b) => b.length - a.length);

    /**
     * Tenta gerar e preencher um grid de tamanho específico (currentSize).
     * @param {number} currentSize - Dimensão do tabuleiro nesta tentativa (ex: 10, 11, 12).
     * @returns {string[][] | null} Matriz preenchida ou null se falhar.
     */
    const attemptSize = (currentSize) => {
        // Função auxiliar para criar uma matriz vazia de tamanho currentSize x currentSize
        const emptyGrid = () =>
            Array.from({ length: currentSize }, () =>
                Array.from({ length: currentSize }, () => ""),
            );

        // Verifica se é possível posicionar uma palavra em uma coordenada (row, col) na direção especificada
        const canPlace = (grid, word, row, col, horizontal) => {
            for (let i = 0; i < word.length; i += 1) {
                const r = horizontal ? row : row + i;
                const c = horizontal ? col + i : col;
                // Checa limites da grade
                if (r < 0 || c < 0 || r >= currentSize || c >= currentSize)
                    return false;
                const cell = grid[r][c];
                // Checa colisão: a célula deve estar vazia ou conter exatamente a mesma letra (interseção válida)
                if (cell && cell !== word[i]) return false;
            }
            return true;
        };

        // Aplica e grava as letras da palavra na matriz na coordenada e direção validadas
        const applyPlace = (grid, word, row, col, horizontal) => {
            for (let i = 0; i < word.length; i += 1) {
                const r = horizontal ? row : row + i;
                const c = horizontal ? col + i : col;
                grid[r][c] = word[i];
            }
        };

        // Tenta encontrar uma coordenada aleatória válida para posicionar uma palavra específica
        const tryPlaceWord = (grid, word, attempts = 400) => {
            // Calcula os limites máximos de linha e coluna onde a palavra pode iniciar sem vazar do grid
            const maxRowBase = currentSize - word.length;
            const maxColBase = currentSize - word.length;
            if (maxRowBase < 0 || maxColBase < 0) return false;

            for (let i = 0; i < attempts; i += 1) {
                const horizontal = Math.random() > 0.5; // Escolhe aleatoriamente entre horizontal e vertical
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

        // Loop principal de tentativas de geração do grid completo
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const grid = emptyGrid();
            let allPlaced = true;

            // Tenta posicionar todas as palavras da lista
            for (const word of ordered) {
                if (!tryPlaceWord(grid, word)) {
                    allPlaced = false;
                    break; // Se uma palavra falhar, aborta este grid e tenta um novo
                }
            }

            // Se todas as palavras foram posicionadas com sucesso, preenche os espaços vazios com letras aleatórias
            if (allPlaced) {
                for (let r = 0; r < currentSize; r += 1) {
                    for (let c = 0; c < currentSize; c += 1) {
                        if (!grid[r][c]) {
                            // Gera uma letra maiúscula aleatória entre A (código 65) e Z (65 + 25)
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

    // Estratégia de expansão elástica (Fallback): se o grid inicial for pequeno demais para abrigar
    // as palavras, o algoritmo tenta aumentar o tamanho da grade em até 3 unidades (ex: 10x10 -> 11x11 -> 12x12).
    for (let grow = 0; grow <= 3; grow += 1) {
        const grid = attemptSize(size + grow);
        if (grid) return grid;
    }

    return null;
}
