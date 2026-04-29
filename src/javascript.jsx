import { useEffect, useMemo, useRef, useState } from "react";
import MemoryGame from "./components/memoryGame/MemoryGame.jsx";
import QuizGame from "./components/quizGame/QuizGame.jsx";
import HangmanGame from "./components/hangmanGame/HangmanGame.jsx";
import WordSearchGame from "./components/wordSearchGame/WordSearchGame.jsx";
import LabirintoGame from "./components/labirintoGame/LabirintoGame.jsx";
import SoletraGame from "./components/soletraGame/SoletraGame.jsx";
import CatchGame from "./components/catchGame/CatchGame.jsx";
import PlayerForm from "./components/playerForm/PlayerForm.jsx";
import MenuGrid from "./components/menuGrid/MenuGrid.jsx";
import RankingTable from "./components/rankingTable/RankingTable.jsx";
import HeaderBar from "./components/headerBar/HeaderBar.jsx";
import {
  getSeedDatabase,
  loadAppDatabase,
  saveAppDatabase,
  getGameContent,
} from "./lib/appDatabase.js";

const games = [
  { id: "memory", title: "Jogo da memória", description: "Ache os pares." },
  { id: "wordsearch", title: "Caça-palavras", description: "Encontre todos." },
  { id: "hangman", title: "Forca", description: "Descubra a palavra." },
  { id: "quiz", title: "Quiz", description: "3 perguntas rápidas." },
  { id: "labirinto", title: "Labirinto", description: "Ache a saída." },
  { id: "soletra", title: "Soletra", description: "Forme palavras." },
  { id: "catch", title: "Cesta de Ofertas", description: "Colete bons itens." },
];

const defaultGameData = {
  memorySymbols: [],
  labirintoWords: [],
  soletraRoundData: { exemplos: [] },
  quizQuestions: [],
  hangmanWords: [],
  wordSearchWords: [],
};

const defaultTimeLimits = {};

const defaultPairs = {};

const defaultGridSizes = {};

const defaultQuizCounts = {};

const normalizePhone = (value) => (value || "").replace(/\D/g, "");
const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
};

export function App() {
  const [initialDatabase] = useState(() => getSeedDatabase());
  const [screen, setScreen] = useState(
    initialDatabase.session.screen ?? "menu",
  );
  const [selectedGame, setSelectedGame] = useState(
    initialDatabase.session.selectedGame ?? null,
  );
  const [name, setName] = useState(initialDatabase.player.name ?? "");
  const [phone, setPhone] = useState(initialDatabase.player.phone ?? "");
  const [gameData, setGameData] = useState({
    ...defaultGameData,
    ...(initialDatabase.gameData ?? {}),
  });
  const [ranking, setRanking] = useState(initialDatabase.ranking ?? []);
  const [leadsByPhone, setLeadsByPhone] = useState(initialDatabase.leads ?? {});
  const [timeLimits, setTimeLimits] = useState({
    ...defaultTimeLimits,
    ...(initialDatabase.settings.timeLimits ?? {}),
  });
  const [pairsLimits, setPairsLimits] = useState({
    ...defaultPairs,
    ...(initialDatabase.settings.pairsLimits ?? {}),
  });
  const [gridSizes, setGridSizes] = useState({
    ...defaultGridSizes,
    ...(initialDatabase.settings.gridSizes ?? {}),
  });
  const [quizQuestionLimits, setQuizQuestionLimits] = useState({
    ...defaultQuizCounts,
    ...(initialDatabase.settings.quizQuestionLimits ?? {}),
  });
  const didInitialHydrate = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = 0;

    const hydrateFromServer = async () => {
      const { database: db, isRemote } = await loadAppDatabase();
      if (cancelled) return;

      if (!isRemote) {
        retryTimer = window.setTimeout(hydrateFromServer, 1200);
        return;
      }

      setScreen(db.session.screen ?? "menu");
      setSelectedGame(db.session.selectedGame ?? null);
      setName(db.player.name ?? "");
      setPhone(db.player.phone ?? "");
      setGameData({ ...defaultGameData, ...(db.gameData ?? {}) });
      setRanking(Array.isArray(db.ranking) ? db.ranking : []);
      setLeadsByPhone(db.leads ?? {});
      setTimeLimits({
        ...defaultTimeLimits,
        ...(db.settings.timeLimits ?? {}),
      });
      setPairsLimits({ ...defaultPairs, ...(db.settings.pairsLimits ?? {}) });
      setGridSizes({ ...defaultGridSizes, ...(db.settings.gridSizes ?? {}) });
      setQuizQuestionLimits({
        ...defaultQuizCounts,
        ...(db.settings.quizQuestionLimits ?? {}),
      });
      didInitialHydrate.current = true;
    };

    hydrateFromServer();

    return () => {
      cancelled = true;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  const effectiveTimeLimit = (gameId) => Math.min(timeLimits[gameId] ?? 30, 30);
  useEffect(() => {
    if (!selectedGame || !didInitialHydrate.current) return;

    const loadGameData = async () => {
      try {
        const content = await getGameContent(selectedGame);
        if (!content) return;

        const { words = [], quiz = [], rounds = [] } = content;

        // Map game code to our state keys
        const dataMap = {
          memory: { key: "memorySymbols", data: words },
          wordsearch: {
            key: "wordSearchWords",
            data: words.map((w) => w.word),
          },
          hangman: { key: "hangmanWords", data: words.map((w) => w.word) },
          quiz: { key: "quizQuestions", data: quiz },
          labirinto: { key: "labirintoWords", data: words.map((w) => w.word) },
          soletra: { key: "soletraRoundData", data: { exemplos: rounds } },
        };

        const mapping = dataMap[selectedGame];
        if (mapping) {
          setGameData((prev) => ({
            ...prev,
            [mapping.key]: mapping.data,
          }));
        }
      } catch (err) {
        console.error(`Failed to load game content for ${selectedGame}:`, err);
      }
    };

    loadGameData();
  }, [selectedGame]);

  const normalizedPhone = normalizePhone(phone);
  const knownLead = normalizedPhone ? leadsByPhone[normalizedPhone] : null;
  const isKnownPhone = Boolean(knownLead);
  const canPlay =
    normalizedPhone.length >= 10 && (isKnownPhone || name.trim().length > 1);
  const gameComponents = useMemo(
    () => ({
      memory: (props) => (
        <MemoryGame
          symbols={gameData.memorySymbols}
          pairCount={props.pairCount}
          {...props}
        />
      ),
      wordsearch: (props) => (
        <WordSearchGame
          words={gameData.wordSearchWords}
          gridSize={props.gridSize}
          {...props}
        />
      ),
      hangman: (props) => (
        <HangmanGame words={gameData.hangmanWords} {...props} />
      ),
      quiz: (props) => (
        <QuizGame
          questions={gameData.quizQuestions}
          questionLimit={props.questionLimit}
          {...props}
        />
      ),
      labirinto: (props) => (
        <LabirintoGame words={gameData.labirintoWords} {...props} />
      ),
      soletra: (props) => (
        <SoletraGame roundData={gameData.soletraRoundData} {...props} />
      ),
      catch: (props) => <CatchGame {...props} />,
    }),
    [gameData],
  );
  const ActiveGame = gameComponents[selectedGame];
  const selectedMeta = games.find((g) => g.id === selectedGame);
  const sortByMetrics = (rows, getPoints) =>
    [...rows].sort((a, b) => {
      const aPoints = Number(getPoints(a) || 0);
      const bPoints = Number(getPoints(b) || 0);
      if (bPoints !== aPoints) {
        return bPoints - aPoints;
      }

      return (a.name ?? "").localeCompare(b.name ?? "");
    });

  const sortRanking = (rows) =>
    sortByMetrics(rows, (row) => row.totalPoints ?? 0);

  const currentGameRanking = selectedGame
    ? sortByMetrics(ranking, (row) => row.perGame?.[selectedGame]?.points ?? 0)
        .map((row) => ({
          ...row,
          totalPoints: row.perGame?.[selectedGame]?.points ?? 0,
        }))
        .slice(0, 10)
    : [];

  const mainMenuRanking = sortRanking(ranking).slice(0, 10);

  useEffect(() => {
    if (!didInitialHydrate.current) return;

    const timeoutId = setTimeout(() => {
      saveAppDatabase({
        player: { name, phone },
        gameData,
        leads: leadsByPhone,
        settings: {
          timeLimits,
          pairsLimits,
          gridSizes,
          quizQuestionLimits,
        },
        session: { selectedGame, screen },
        ranking,
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [
    name,
    phone,
    gameData,
    leadsByPhone,
    timeLimits,
    pairsLimits,
    gridSizes,
    quizQuestionLimits,
    selectedGame,
    screen,
    ranking,
  ]);

  const goCadastro = () => {
    setScreen("identify");
  };

  const goMainMenu = () => {
    const confirmed = window.confirm(
      "Deseja realmente voltar ao menu principal? O jogo atual será encerrado.",
    );
    if (!confirmed) return;
    setScreen("menu");
    setSelectedGame(null);
  };

  const handleSelectGame = (gameId) => {
    setSelectedGame(gameId);
    setScreen("identify");
  };

  const handleTimeLimitChange = (gameId, valueSeconds) => {
    setTimeLimits((prev) => ({ ...prev, [gameId]: valueSeconds }));
  };

  const handlePairsChange = (gameId, valuePairs) => {
    setPairsLimits((prev) => ({ ...prev, [gameId]: valuePairs }));
  };

  const handleGridSizeChange = (gameId, valueSize) => {
    setGridSizes((prev) => ({ ...prev, [gameId]: valueSize }));
  };

  const handleQuizLimitChange = (gameId, valueLimit) => {
    setQuizQuestionLimits((prev) => ({ ...prev, [gameId]: valueLimit }));
  };

  const handleScore = ({
    points = 0,
    remainingSeconds = 0,
    timedOut = false,
  }) => {
    const gameId = selectedGame;
    const phoneKey = normalizedPhone;
    const playerName = isKnownPhone ? knownLead.name : name;
    if (!phoneKey || !playerName || !gameId) return;

    const timeBonus = timedOut
      ? 0
      : Math.max(0, Number(remainingSeconds || 0)) * 5;
    const totalPoints = Number(points || 0) + timeBonus;

    setRanking((prev) => {
      const current = prev.find((row) => row.phone === phoneKey);
      const nextPerGame = {
        ...(current?.perGame ?? {}),
        [gameId]: {
          points: (current?.perGame?.[gameId]?.points ?? 0) + totalPoints,
        },
      };

      const nextEntry = {
        id:
          current?.id ??
          (crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`),
        name: playerName,
        phone: phoneKey,
        totalPoints: (current?.totalPoints ?? 0) + totalPoints,
        perGame: nextPerGame,
      };

      const withoutCurrent = prev.filter((row) => row.phone !== phoneKey);
      return sortRanking([...withoutCurrent, nextEntry]);
    });
  };

  const startGame = () => {
    if (!canPlay || !selectedGame) return;

    if (!isKnownPhone) {
      const phoneKey = normalizePhone(phone);
      setLeadsByPhone((prev) => ({
        ...prev,
        [phoneKey]: {
          name: name.trim(),
          phone: phoneKey,
        },
      }));
    } else if (knownLead?.name && name !== knownLead.name) {
      setName(knownLead.name);
    }

    setScreen("play");
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    const normalized = normalizePhone(value);
    const existing = normalized ? leadsByPhone[normalized] : null;
    if (existing?.name) {
      setName(existing.name);
    } else {
      setName("");
    }
  };

  return (
    <div className="app-shell">
      <HeaderBar
        screen={screen}
        onBackToCadastro={goCadastro}
        onBackToMenu={goMainMenu}
      />

      {screen === "menu" && (
        <>
          <MenuGrid
            games={games}
            timeLimits={timeLimits}
            pairsLimits={pairsLimits}
            gridSizes={gridSizes}
            quizQuestionLimits={quizQuestionLimits}
            onTimeLimitChange={handleTimeLimitChange}
            onPairsChange={handlePairsChange}
            onGridSizeChange={handleGridSizeChange}
            onQuizLimitChange={handleQuizLimitChange}
            onSelect={handleSelectGame}
          />
          <RankingTable ranking={mainMenuRanking} />
        </>
      )}

      {screen === "identify" && (
        <section className="game-area">
          {selectedMeta ? (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Jogador</p>
                  <h2>Digite seus dados para jogar</h2>
                  <p className="muted">Jogo escolhido: {selectedMeta.title}</p>
                </div>
              </div>
              <PlayerForm
                name={name}
                phone={phone}
                onNameChange={setName}
                onPhoneChange={handlePhoneChange}
                canPlay={canPlay}
                isKnownPhone={isKnownPhone}
              />
              <button
                className="primary"
                onClick={startGame}
                disabled={!canPlay}
              >
                Começar {selectedMeta.title}
              </button>
            </div>
          ) : (
            <p>Selecione um jogo para continuar.</p>
          )}
        </section>
      )}

      {screen === "play" && (
        <section className="game-area">
          {ActiveGame ? (
            <ActiveGame
              onScore={handleScore}
              timeLimitSeconds={effectiveTimeLimit(selectedGame)}
              ranking={currentGameRanking}
              pairCount={pairsLimits[selectedGame]}
              gridSize={gridSizes[selectedGame]}
              questionLimit={quizQuestionLimits[selectedGame]}
            />
          ) : (
            <p>Jogo não encontrado.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
