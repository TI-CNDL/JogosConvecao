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
  getRanking,
  registerPlayer,
  saveGameScore,
  getPlayer,
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
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isDatabaseHydrated, setIsDatabaseHydrated] = useState(false);
  const didInitialHydrate = useRef(false);
  useEffect(() => {
    let cancelled = false;
    let retryTimer = 0;

    const hydrateFromServer = async () => {
      const { database: db, isRemote } = await loadAppDatabase();
      if (cancelled) return;

      setIsRemoteMode(isRemote);

      if (!isRemote) {
        retryTimer = window.setTimeout(hydrateFromServer, 1200);
        return;
      }

      setScreen(db.session.screen ?? "menu");
      setSelectedGame(db.session.selectedGame ?? null);
      setName(db.player.name ?? "");
      setPhone(db.player.phone ?? "");
      setGameData({ ...defaultGameData, ...(db.gameData ?? {}) });
      
      try {
        const remoteRanking = await getRanking();
        setRanking(Array.isArray(remoteRanking) ? remoteRanking : []);
      } catch (e) {
        console.error("Falha ao buscar ranking remoto", e);
        setRanking(Array.isArray(db.ranking) ? db.ranking : []);
      }

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
      setIsDatabaseHydrated(true);
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

  const effectiveTimeLimit = (gameId) => timeLimits[gameId] ?? 30;
  useEffect(() => {
    if (!selectedGame || !isDatabaseHydrated) return;

    const loadGameData = async () => {
      try {
        const content = await getGameContent(selectedGame);
        if (!content) return;

        const { words = [], quiz = [], rounds = [] } = content;

        // Map game code to our state keys
        const dataMap = {
          memory: { key: "memorySymbols", data: words.map((w) => w.word) },
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
  }, [selectedGame, isDatabaseHydrated]);

  const normalizedPhone = normalizePhone(phone);

  // Busca o nome do jogador no backend automaticamente ao digitar o telefone
  useEffect(() => {
    if (!isRemoteMode || normalizedPhone.length < 10) return;
    
    let active = true;
    getPlayer(normalizedPhone)
      .then((player) => {
        if (!active) return;
        if (player && player.name) {
          setLeadsByPhone((prev) => ({
            ...prev,
            [normalizedPhone]: { name: player.name, phone: normalizedPhone },
          }));
          setName((currentName) => {
            // Se o usuário já começou a digitar algo diferente, não sobrescreve, 
            // a menos que o campo estivesse vazio
            if (!currentName || currentName === "") return player.name;
            return currentName;
          });
        }
      })
      .catch(() => {
        // Falha silenciosa
      });
      
    return () => { active = false; };
  }, [normalizedPhone, isRemoteMode]);

  const knownLead = normalizedPhone ? leadsByPhone[normalizedPhone] : null;
  const isKnownPhone = Boolean(knownLead);
  const canPlay =
    normalizedPhone.length >= 10 && (isKnownPhone || name.trim().length > 1);
  const gameComponents = useMemo(
    () => ({
      memory: (props) => (
        <MemoryGame
          data={{ symbols: gameData.memorySymbols }}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds,
            pairCount: props.pairCount,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      wordsearch: (props) => (
        <WordSearchGame
          data={{ words: gameData.wordSearchWords }}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds,
            gridSize: props.gridSize,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      hangman: (props) => (
        <HangmanGame
          data={{ words: gameData.hangmanWords }}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      quiz: (props) => (
        <QuizGame
          data={{ questions: gameData.quizQuestions }}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds,
            questionLimit: props.questionLimit,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      labirinto: (props) => (
        <LabirintoGame
          data={{ words: gameData.labirintoWords }}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds,
            gridSize: props.gridSize,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      soletra: (props) => (
        <SoletraGame
          data={{ roundData: gameData.soletraRoundData }}
          settings={{ timeLimitSeconds: props.timeLimitSeconds }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      catch: (props) => (
        <CatchGame
          data={{}}
          settings={{ timeLimitSeconds: props.timeLimitSeconds }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
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

  // bulk save desativado pois o backend é a fonte da verdade

  const goCadastro = () => {
    setPhone("");
    setName("");
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
    setPhone("");
    setName("");
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

  const handleScore = async ({
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

    const updateLocalRanking = () => {
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
        const newRanking = sortRanking([...withoutCurrent, nextEntry]);
        
        // Plano B: Salvar fallback local
        try {
          localStorage.setItem("jogos_fallback_ranking", JSON.stringify(newRanking));
        } catch(e) {}
        
        return newRanking;
      });
    };

    if (isRemoteMode) {
      setIsSavingScore(true);
      try {
        const response = await saveGameScore({
          phone: phoneKey,
          gameCode: gameId,
          points: Number(points || 0),
          remainingSeconds,
          timedOut,
        });
        if (response && response.top10) {
          setRanking(response.top10);
        } else {
          updateLocalRanking();
        }
      } catch (err) {
        console.error("Falha ao salvar no backend, usando Plano B:", err);
        updateLocalRanking();
      } finally {
        setIsSavingScore(false);
      }
    } else {
      updateLocalRanking();
    }
  };

  const startGame = async () => {
    if (!canPlay || !selectedGame) return;

    const phoneKey = normalizePhone(phone);
    const finalName = isKnownPhone && knownLead?.name && name !== knownLead.name ? knownLead.name : name.trim();

    if (isRemoteMode) {
      setIsStartingGame(true);
      try {
        await registerPlayer(finalName, phoneKey);
      } catch (err) {
        console.error("Falha ao registrar jogador no backend", err);
      } finally {
        setIsStartingGame(false);
      }
    }

    if (!isKnownPhone) {
      setLeadsByPhone((prev) => ({
        ...prev,
        [phoneKey]: {
          name: finalName,
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
                disabled={!canPlay || isStartingGame}
              >
                {isStartingGame ? "Registrando..." : `Começar ${selectedMeta.title}`}
              </button>
            </div>
          ) : (
            <p>Selecione um jogo para continuar.</p>
          )}
        </section>
      )}

      {screen === "play" && (
        <section className="game-area" style={{ position: "relative" }}>
          {isSavingScore && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 50,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "rgba(11, 18, 32, 0.8)", borderRadius: 12, color: "var(--text-color)"
            }}>
              <p style={{ fontWeight: 600, fontSize: "1.2rem" }}>Salvando placar...</p>
            </div>
          )}
          {ActiveGame ? (
            <div style={{ opacity: isSavingScore ? 0.6 : 1, pointerEvents: isSavingScore ? "none" : "auto", transition: "opacity 0.2s" }}>
              <ActiveGame
                onScore={handleScore}
                timeLimitSeconds={effectiveTimeLimit(selectedGame)}
                ranking={currentGameRanking}
                pairCount={pairsLimits[selectedGame]}
                gridSize={gridSizes[selectedGame]}
                questionLimit={quizQuestionLimits[selectedGame]}
              />
            </div>
          ) : (
            <p>Jogo não encontrado.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
