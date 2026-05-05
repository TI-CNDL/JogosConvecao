/**
 * Embaralha um array utilizando o algoritmo Fisher-Yates.
 * Modifica e retorna uma cópia rasa do array.
 * 
 * @param {Array} arr - O array original a ser embaralhado.
 * @returns {Array} - Um novo array embaralhado.
 */
export const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
