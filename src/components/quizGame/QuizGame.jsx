import { useEffect, useState, useMemo } from "react";
import "./quizGame.style.css";

export default function QuizGame({
  questions = [],
  onScore,
  timeLimitSeconds = 90,
  livesLimit = 3,
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
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(noQuestions);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [timedOut, setTimedOut] = useState(false);
  const [reported, setReported] = useState(false);
  const [livesLeft, setLivesLeft] = useState(livesLimit);
  const [outOfLives, setOutOfLives] = useState(false);

  useEffect(() => {
    // Reset completo ao mudar props
    setStep(0);
    setScore(0);
    setFinished(noQuestions);
    setTimeLeft(timeLimitSeconds);
    setTimedOut(false);
    setReported(false);
    setLivesLeft(livesLimit);
    setOutOfLives(false);
    setShuffleKey((k) => k + 1);
  }, [
    sanitizedQuestions,
    timeLimitSeconds,
    livesLimit,
    noQuestions,
    questionLimit,
  ]);

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
        score,
        elapsedMs,
        timedOut: timedOut || outOfLives || noQuestions,
      });
      setReported(true);
    }
  }, [
    finished,
    reported,
    onScore,
    score,
    timeLimitSeconds,
    timeLeft,
    timedOut,
    outOfLives,
    noQuestions,
  ]);

  const current = randomizedQuestions[step];

  const choose = (option) => {
    if (finished || noQuestions || !current) return;
    const correct = option === current.answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);

    if (!correct) {
      setLivesLeft((prev) => {
        const nextLives = Math.max(0, prev - 1);
        if (nextLives === 0) {
          setFinished(true);
          setOutOfLives(true);
        }
        return nextLives;
      });
    }

    const nextStep = step + 1;
    if (nextStep >= randomizedQuestions.length) {
      setFinished(true);
    } else if (!(livesLeft - (correct ? 0 : 1) <= 0)) {
      setStep(nextStep);
    }
  };

  const reset = () => {
    setStep(0);
    setScore(0);
    setFinished(noQuestions);
    setTimeLeft(timeLimitSeconds);
    setTimedOut(false);
    setReported(false);
    setLivesLeft(livesLimit);
    setOutOfLives(false);
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
        <span className="pill">Vidas: {livesLeft}</span>
        <span className="pill">{score} acertos</span>
      </div>
      {finished ? (
        <div className="result-box" aria-live="polite">
          <p>
            {timedOut
              ? "Tempo esgotado"
              : outOfLives
                ? "Sem vidas"
                : noQuestions
                  ? "Sem perguntas para jogar"
                  : "Placar final"}
          </p>
          <h3>
            {score}/{randomizedQuestions.length} corretas
          </h3>
          <p>Tempo: {timeLimitSeconds - timeLeft}s</p>
          {ranking.length > 0 && (
            <div className="mini-ranking">
              <p className="eyebrow">Ranking deste jogo</p>
              {ranking.slice(0, 5).map((row) => (
                <div key={row.id} className="mini-row">
                  <span>{row.name}</span>
                  <span>{row.score} pts</span>
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
