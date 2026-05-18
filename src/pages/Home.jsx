import { useEffect, useState } from "react";
import { CardMenu } from "../components/cardMenu/CardMenu";
import { Titulo } from "../components/titulo/Titulo";
import { getAdminRecords } from "../lib/appDatabase";

export function Home({ onStartGame }) {
  const [games, setGames] = useState([]);
  const [gameSettings, setGameSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado dos inputs
  const [timeLimits, setTimeLimits] = useState({});
  const [catchInitialFallTimes, setCatchInitialFallTimes] = useState({});
  const [wordSearchWordLimits, setWordSearchWordLimits] = useState({});
  const [wordSearchWordBounds, setWordSearchWordBounds] = useState({
    min: 1,
    max: 50,
  });
  const [hangmanWordLengths, setHangmanWordLengths] = useState({});
  const [labirintoWordLengths, setLabirintoWordLengths] = useState({});
  const [pairsLimits, setPairsLimits] = useState({});
  const [gridSizes, setGridSizes] = useState({});
  const [quizQuestionBounds, setQuizQuestionBounds] = useState({
    min: 0,
    max: 0,
  });
  const [quizQuestionLimits, setQuizQuestionLimits] = useState({});
  const [soletraWordBounds, setSoletraWordBounds] = useState({
    min: 0,
    max: 0,
  });
  const [soletraWordLimits, setSoletraWordLimits] = useState({});

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const records = await getAdminRecords();
        if (!active) return;
        const gamesList = Array.isArray(records?.games) ? records.games : [];
        setGames(gamesList);
        setGameSettings(
          Array.isArray(records?.gameSettings) ? records.gameSettings : [],
        );

        // Contar registros para bounds
        const wordsCount = Array.isArray(records?.words)
          ? records.words.length
          : 0;
        const quizCount = Array.isArray(records?.quizQuestions)
          ? records.quizQuestions.length
          : 0;

        setWordSearchWordBounds({ min: 1, max: Math.max(1, wordsCount) });
        setQuizQuestionBounds({ min: 0, max: Math.max(0, quizCount) });
        setSoletraWordBounds({ min: 0, max: Math.max(0, wordsCount) });
      } catch {
        if (!active) return;
        setGames([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const sortedGames = [...games].sort((a, b) => {
    if (a.code === "memory") return -1;
    if (b.code === "memory") return 1;
    return String(a.name ?? a.code ?? "").localeCompare(
      String(b.name ?? b.code ?? ""),
    );
  });

  const handleStartGame = (payload = {}) => {
    const gameKey = payload.code ?? payload.id ?? payload.gameId ?? payload;
    const game = sortedGames.find(
      (g) =>
        String(g.id) === String(gameKey) || String(g.code) === String(gameKey),
    );
    if (!game) return;

    const selectedConfig = payload.config ?? {};

    const config = {
      timeLimitSeconds:
        selectedConfig.timeLimitSeconds ?? timeLimits[game.id] ?? 30,
      initialFallTimeSeconds:
        selectedConfig.initialFallTimeSeconds ??
        catchInitialFallTimes[game.id] ??
        10,
      pairCount: selectedConfig.pairCount ?? pairsLimits[game.id] ?? 6,
      gridSize: selectedConfig.gridSize ?? gridSizes[game.id] ?? 12,
      maxWords: selectedConfig.maxWords ?? wordSearchWordLimits[game.id] ?? 5,
      wordLimit: selectedConfig.wordLimit ?? wordSearchWordLimits[game.id] ?? 5,
      maxAttempts: selectedConfig.maxAttempts ?? selectedConfig.maxLives ?? 5,
      maxLives: selectedConfig.maxLives ?? selectedConfig.maxAttempts ?? 5,
      hangmanWordLength:
        selectedConfig.hangmanWordLength ?? hangmanWordLengths[game.id] ?? 5,
      labirintoWordLength:
        selectedConfig.labirintoWordLength ??
        labirintoWordLengths[game.id] ??
        5,
      questionLimit:
        selectedConfig.questionLimit ?? quizQuestionLimits[game.id] ?? 5,
      quizLimit: selectedConfig.quizLimit ?? quizQuestionLimits[game.id] ?? 5,
      soletraWordLimit:
        selectedConfig.wordLimit ??
        selectedConfig.soletraWordLimit ??
        soletraWordLimits[game.id] ??
        3,
    };

    onStartGame?.({
      code: game.code,
      title: game.name ?? game.code,
      config,
    });
  };

  return (
    <>
      <Titulo
        texto="Escolha o seu desafio"
        classe="textoTitulo"
        botao={false}
        background={true}
      />
      <section className="CardMenu-section">
        {loading ? (
          <p>Carregando jogos do banco...</p>
        ) : (
          <div className="CardMenu-section">
            {sortedGames.map((game) => {
              const settingsForGame = gameSettings.filter((s) => {
                const codeFromSetting = String(
                  s.Game?.code ?? s.gameId ?? s.Game?.id ?? "",
                );
                return (
                  String(game.code) === String(codeFromSetting) ||
                  String(game.id) === String(s.gameId ?? s.Game?.id)
                );
              });

              return (
                <CardMenu
                  key={game.id}
                  title={game.name ?? game.code}
                  code={game.code}
                  settings={settingsForGame}
                  defaultConfig={{
                    timeLimitSeconds: 30,
                  }}
                  onStartGame={handleStartGame}
                />
              );
            })}

            <article className="tile">
              <p className="eyebrow">Administração</p>
              <h3>Hub CRUD do Banco</h3>
              <p className="muted">
                Veja usuários, palavras, frases, perguntas, respostas e demais
                registros.
              </p>
              <button
                className="primary"
                onClick={() => onStartGame?.({ code: "admin", title: "Admin" })}
              >
                Abrir hub de dados
              </button>
            </article>
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
