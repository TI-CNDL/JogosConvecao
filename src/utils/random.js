/**
 * Mulberry32 — PRNG determinístico baseado em seed.
 * Retorna uma função rng() que produz floats em [0, 1).
 * @param {number} seed
 * @returns {() => number}
 */
export const mulberry32 = (seed) => {
    let s = seed | 0;
    return function rng() {
        let t = (s += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
