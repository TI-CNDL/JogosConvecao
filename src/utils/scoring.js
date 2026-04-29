/**
 * Calcula a porcentagem de pontos baseado em acertos parciais
 * @param {number} parcial - Quantidade de itens encontrados/acertados
 * @param {number} total - Quantidade total de itens esperados
 * @returns {number} Porcentagem (0-100)
 */
export const calcularPontos = (parcial, total) => {
    if (!total || total <= 0) return 0;
    return Math.floor((Math.max(0, parcial) / total) * 100);
};
