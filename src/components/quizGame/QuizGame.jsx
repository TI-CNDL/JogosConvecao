import { useEffect, useState, useMemo } from "react";
import "./quizGame.style.css";

export default function QuizGame({
  questions = [],
  onScore,
  timeLimitSeconds = 90,
  ranking = [],
  questionLimit = null,
}) {
  const sanitizedQuestions = useMemo(
    () =>
      questions
        .filter(
          (q) =>
            q &&
            q.prompt &&
            Array.isArray(q.options) &&
            q.options.length > 0 &&
            q.answer,
        )
        .map((q) => ({ ...q })),
    [questions],
  );

  const [shuffleKey, setShuffleKey] = useState(0);

  const shuffleList = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const randomizedQuestions = useMemo(() => {
    if (sanitizedQuestions.length === 0 || questionLimit === 0) return [];
    let pool = shuffleList(sanitizedQuestions);
    if (questionLimit) {
      pool = pool.slice(0, questionLimit);
    }
    return pool.map((q) => ({
      ...q,
      options: shuffleList(q.options),
    }));
  }, [sanitizedQuestions, questionLimit, shuffleKey]);

  const noQuestions = randomizedQuestions.length === 0;
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(noQuestions);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);
  const [answersByStep, setAnswersByStep] = useState({});

  useEffect(() => {
    // Reset completo ao mudar props
    setStep(0);
    setErrors(0);
    setFinished(noQuestions);
    setTimeLeft(timeLimitSeconds);
    setTimedOut(false);
    setReported(false);
    setAnswersByStep({});
    setShuffleKey((k) => k + 1);
  }, [sanitizedQuestions, timeLimitSeconds, noQuestions, questionLimit]);

  useEffect(() => {
    if (finished) return undefined;
    if (noQuestions) return undefined;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true);
          setTimedOut(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (finished && !reported) {
      const elapsedMs = Math.max(0, (timeLimitSeconds - timeLeft) * 1000);
      onScore?.({
        game: "Quiz",
        score: errors,
        elapsedMs,
        timedOut: timedOut || noQuestions,
      });
      setReported(true);
    }
  }, [
    finished,
    reported,
    onScore,
    errors,
    timeLimitSeconds,
    timeLeft,
    timedOut,
    noQuestions,
  ]);

  const current = randomizedQuestions[step];

  const choose = (option) => {
    if (finished || noQuestions || !current) return;
    setAnswersByStep((prev) => ({ ...prev, [step]: option }));
    const correct = option === current.answer;
    if (!correct) setErrors((prev) => prev + 1);

    const nextStep = step + 1;
    if (nextStep >= randomizedQuestions.length) {
      setFinished(true);
    } else {
      setStep(nextStep);
    }
  };

  const reset = () => {
    setStep(0);
    setErrors(0);
    setFinished(noQuestions);
    setTimeLeft(timeLimitSeconds);
    setTimedOut(false);
    setReported(false);
    setAnswersByStep({});
    setShuffleKey((k) => k + 1);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Quiz</p>
          <h2>{finished ? "Resultado" : `Pergunta ${step + 1}`}</h2>
        </div>
        <span className="pill">Tempo: {timeLeft}s</span>
        <span className="pill">Erros: {errors}</span>
      </div>
      {finished ? (
        <div className="result-box" aria-live="polite">
          <p>
            {timedOut
              ? "Tempo esgotado"
              : noQuestions
                ? "Sem perguntas para jogar"
                : "Placar final"}
          </p>
          <h3>Erros: {errors}</h3>
          <p>Tempo: {timeLimitSeconds - timeLeft}s</p>

          {randomizedQuestions.length > 0 && (
            <div className="answer-key">
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
                    className={`answer-key-item ${statusClass}`}
                  >
                    <p className="answer-key-question">{question.prompt}</p>
                    <p>
                      Sua resposta:{" "}
                      <strong>{chosen ?? "Nao respondida"}</strong>
                    </p>
                    <p>
                      Correta: <strong>{question.answer}</strong>
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.score} erros</span>
                  <span>{Math.round((row.elapsedMs ?? 0) / 1000)}s</span>
                </div>
              ))}
            </div>
          )}
          <button className="primary" onClick={reset}>
            Jogar de novo
          </button>
        </div>
      ) : (
        <div className="quiz-box">
          <p className="quiz-question">
            {noQuestions || !current
              ? "Sem perguntas disponíveis."
              : current.prompt}
          </p>
          <div className="quiz-options">
            {!noQuestions && current ? (
              current.options.map((option) => (
                <button
                  key={option}
                  className="option"
                  onClick={() => choose(option)}
                  disabled={finished}
                >
                  {option}
                </button>
              ))
            ) : (
              <button className="option" disabled>
                Aguarde novas perguntas
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
