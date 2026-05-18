import useHangmanGameLogic from "./useHangmanGameLogic";
import "./hangmanGame.style.css";

/**
 * COMPONENTE VISUAL DO JOGO DA FORCA (HangmanGame.jsx)
 * Responsável exclusivamente pela renderização da interface gráfica (View), exibição
 * do teclado interativo, contagem de vidas, cronômetro e tela de resultados.
 * Toda a lógica de estado, checagem de letras e controle de tempo é delegada ao hook `useHangmanGameLogic`.
 *
 * @param {Object} props - Propriedades recebidas do componente pai (App principal).
 * @param {Object} props.data - Objeto contendo a lista de palavras (`words`) carregadas da API.
 * @param {Object} props.config - Configurações da partida (ex: `timeLimitSeconds`, `maxLives`).
 * @param {Array} props.ranking - Lista com os top jogadores para exibição no mini-ranking final.
 * @param {Function} props.onScore - Callback acionada ao finalizar a partida para registrar os pontos globais.
 * @param {Function} props.onRoundComplete - Callback acionada quando o jogador descobre a palavra com sucesso.
 * @param {Function} props.onGameOver - Callback acionada quando o jogador perde (por esgotamento de vidas ou tempo).
 */
export default function HangmanGame({
    data = {},
    config = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    // Inicializa o Custom Hook desestruturando todas as variáveis de estado, métricas e ações da Forca
    const {
        alphabet,      // Lista de letras disponíveis no teclado virtual (A-Z + Ç)
        secret,        // Palavra secreta atual (usada na tela final de game over)
        masked,        // String formatada com underlines (_) para letras ocultas e letras reveladas
        guessed,       // Set contendo todas as letras já clicadas pelo jogador
        lives,         // Quantidade atual de vidas restantes
        timeLeft,      // Tempo restante no cronômetro regressivo
        finished,      // Flag indicando se a partida foi encerrada
        timedOut,      // Flag indicando se o fim de jogo foi causado pelo término do tempo
        won,           // Flag indicando se o jogador adivinhou a palavra completa
        noWords,       // Flag indicando se a lista de palavras fornecida estava vazia
        currentPoints, // Pontuação atual calculada com base nas letras reveladas
        pickLetter,    // Função disparada ao clicar em uma letra do teclado virtual
        resetGame,     // Função disparada ao clicar no botão de novo jogo
    } = useHangmanGameLogic({ data, config, onScore, onRoundComplete, onGameOver });

    return (
        // Contêiner principal do painel do jogo da forca
        <div className="hangman-game panel">
            
            {/* CABEÇALHO DO PAINEL: Exibe título, vidas restantes, pontos atuais e tempo */}
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Forca</p>
                    <h2>{finished ? "Resultado" : "Adivinhe a palavra"}</h2>
                </div>
                <span className="pill">Vidas: {lives}</span>
                <span className="pill">Pontos: {currentPoints}</span>
                <span className="pill">Tempo: {timeLeft}s</span>
            </div>

            {/* ÁREA DA PALAVRA MASCARADA: Exibe os underlines ou as letras adivinhadas */}
            <div className="hangman-word" aria-live="polite">
                {noWords ? "Sem palavras" : masked}
            </div>

            {/* TECLADO VIRTUAL INTERATIVO */}
            <div className="hangman-keyboard">
                {alphabet.map((letter) => (
                    <button
                        key={letter}
                        className="hangman-key"
                        // Desativa a tecla se o jogo terminou, se não houver palavras ou se a letra já foi clicada
                        disabled={won || guessed.has(letter) || finished || noWords}
                        onClick={() => pickLetter(letter)}
                    >
                        {letter}
                    </button>
                ))}
            </div>

            {/* TELA DE RESULTADO FINAL (MODAL DE FIM DE JOGO) */}
            {finished && (
                <div className="result-box" aria-live="polite">
                    <p>
                        {noWords
                            ? "Sem palavras para jogar."
                            : lives <= 0
                                ? `Você ficou sem vidas. A palavra era ${secret}.`
                                : timedOut
                                    ? `Tempo esgotado. A palavra era ${secret}.`
                                    : `A palavra era ${secret}.`}
                    </p>
                    
                    {/* Cálculo da pontuação final somando o bônus de tempo restante */}
                    <h3>Pontos: {currentPoints + (timedOut ? 0 : timeLeft)}</h3>
                    
                    {/* MINI-RANKING: Exibe os 5 melhores jogadores do minijogo atual */}
                    {ranking.length > 0 && (
                        <div className="mini-ranking">
                            <p className="eyebrow">Ranking deste jogo</p>
                            {ranking.slice(0, 5).map((row) => (
                                <div key={row.id} className="mini-row">
                                    <span>{row.name}</span>
                                    <span>{row.totalPoints ?? 0} pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* BOTÃO DE REINÍCIO */}
                    <button className="primary" onClick={resetGame}>
                        Novo jogo
                    </button>
                </div>
            )}
        </div>
    );
}
