import useHangmanGameLogic from "./useHangmanGameLogic";
import "./hangmanGame.style.css";

/**
 * HangmanGame — Componente de View puro.
 *
 * Props (contrato padronizado):
 *   data             — { words: string[] }
 *   settings         — { timeLimitSeconds, maxLives }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar partida
 *   onRoundComplete  — Callback disparado ao acertar a palavra
 *   onGameOver       — Callback disparado quando perde (tempo/vidas)
 */
export default function HangmanGame({
    data = {},
    settings = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const {
        alphabet,
        secret,
        masked,
        guessed,
        lives,
        timeLeft,
        finished,
        timedOut,
        won,
        noWords,
        currentPoints,
        pickLetter,
        resetGame,
    } = useHangmanGameLogic({ data, settings, onScore, onRoundComplete, onGameOver });

    return (
        <div className="hangman-game panel">
            {/* ── Cabeçalho ── */}
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Forca</p>
                    <h2>{finished ? "Resultado" : "Adivinhe a palavra"}</h2>
                </div>
                <span className="pill">Vidas: {lives}</span>
                <span className="pill">Pontos: {currentPoints}</span>
                <span className="pill">Tempo: {timeLeft}s</span>
            </div>

            {/* ── Palavra mascarada ── */}
            <div className="hangman-word" aria-live="polite">
                {noWords ? "Sem palavras" : masked}
            </div>

            {/* ── Teclado ── */}
            <div className="hangman-keyboard">
                {alphabet.map((letter) => (
                    <button
                        key={letter}
                        className="hangman-key"
                        disabled={won || guessed.has(letter) || finished || noWords}
                        onClick={() => pickLetter(letter)}
                    >
                        {letter}
                    </button>
                ))}
            </div>

            {/* ── Resultado ── */}
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
                    <h3>Pontos: {currentPoints + (timedOut ? 0 : timeLeft)}</h3>
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
                    <button className="primary" onClick={resetGame}>
                        Novo jogo
                    </button>
                </div>
            )}
        </div>
    );
}
