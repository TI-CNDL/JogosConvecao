import useQuizGameLogic from "./useQuizGameLogic";
import "./quizGame.style.css";

/**
 * QuizGame — Componente de View puro.
 *
 * Props (contrato padronizado):
 *   data             — { questions: Array<{ question|prompt, options, answer }> }
 *   settings         — { timeLimitSeconds, questionLimit }
 *   ranking          — Array de objetos para o mini-ranking
 *   onScore          — Callback disparado ao finalizar partida
 *   onRoundComplete  — Callback disparado ao responder todas
 *   onGameOver       — Callback disparado quando o tempo esgota
 */
export default function QuizGame({
    data = {},
    settings = {},
    ranking = [],
    onScore,
    onRoundComplete,
    onGameOver,
}) {
    const {
        step,
        currentQuestion,
        randomizedQuestions,
        answersByStep,
        finished,
        timedOut,
        noQuestions,
        timeLeft,
        currentPoints,
        chooseAnswer,
        resetGame,
    } = useQuizGameLogic({ data, settings, onScore, onRoundComplete, onGameOver });

    return (
        <div className="quiz-game panel">
            {/* ── Cabeçalho ── */}
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Quiz</p>
                    <h2>{finished ? "Resultado" : `Pergunta ${step + 1}`}</h2>
                </div>
                <span className="pill">Tempo: {timeLeft}s</span>
                <span className="pill">Pontos: {currentPoints}</span>
            </div>

            {finished ? (
                /* ── Tela de resultado ── */
                <div className="quiz-result-box" aria-live="polite">
                    <p>
                        {timedOut
                            ? "Tempo esgotado"
                            : noQuestions
                                ? "Sem perguntas para jogar"
                                : "Placar final"}
                    </p>
                    <h3>Pontos: {currentPoints + (timedOut ? 0 : timeLeft)}</h3>

                    {/* Gabarito */}
                    {randomizedQuestions.length > 0 && (
                        <div className="quiz-answer-key">
                            <p className="eyebrow">Gabarito</p>
                            {randomizedQuestions.map((question, index) => {
                                const chosen = answersByStep[index];
                                const statusClass = !chosen
                                    ? "unanswered"
                                    : chosen === question.answer
                                        ? "correct"
                                        : "wrong";

                                return (
                                    <div
                                        key={`${question.prompt}-${index}`}
                                        className={`quiz-answer-item ${statusClass}`}
                                    >
                                        <p className="quiz-answer-question">
                                            {question.prompt}
                                        </p>
                                        <p>
                                            Sua resposta:{" "}
                                            <strong>
                                                {chosen ?? "Nao respondida"}
                                            </strong>
                                        </p>
                                        <p>
                                            Correta:{" "}
                                            <strong>{question.answer}</strong>
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Mini-ranking */}
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
                        Jogar de novo
                    </button>
                </div>
            ) : (
                /* ── Pergunta ativa ── */
                <div className="quiz-box">
                    <p className="quiz-question">
                        {noQuestions || !currentQuestion
                            ? "Sem perguntas disponíveis."
                            : currentQuestion.prompt}
                    </p>
                    <div className="quiz-options">
                        {!noQuestions && currentQuestion ? (
                            currentQuestion.options.map((option) => (
                                <button
                                    key={option}
                                    className="quiz-option"
                                    onClick={() => chooseAnswer(option)}
                                    disabled={finished}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <button className="quiz-option" disabled>
                                Aguarde novas perguntas
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
