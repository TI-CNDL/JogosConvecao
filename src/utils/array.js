/**
 * Shuffle array (Fisher–Yates).
 * @param {Array} arr — Array a ser embaralhada (não é mutada).
 * @param {() => number} [rng=Math.random] — Gerador de números aleatórios (float em [0,1)).
 * @returns {Array} Cópia embaralhada.
 */
export function shuffle(arr, rng = Math.random) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
