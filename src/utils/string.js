/**
 * Remove acentos e converte para maiúsculas.
 * Útil para comparações de letras em jogos de palavras.
 * @param {string} text
 * @returns {string}
 */
export const normalizeText = (text) =>
    (text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
