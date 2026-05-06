import { useEffect, useMemo, useRef, useState } from "react";
import MemoryGame from "./components/memoryGame/MemoryGame.jsx";
import QuizGame from "./components/quizGame/QuizGame.jsx";
import HangmanGame from "./components/hangmanGame/HangmanGame.jsx";
import WordSearchGame from "./components/wordSearchGame/WordSearchGame.jsx";
import LabirintoGame from "./components/labirintoGame/LabirintoGame.jsx";
import SoletraGame from "./components/soletraGame/SoletraGame.jsx";
import CatchGame from "./components/catchGame/CatchGame.jsx";
import WhacGame from "./components/whacGame/WhacGame.jsx";
import AdminHub from "./components/adminHub/AdminHubV2.jsx";
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
  { id: "whac", title: "Omni-Catch", description: "Acerte os alvos rápido!" },
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

const defaultPairs = { memory: 6 };

const defaultGridSizes = { whac: 12, wordsearch: 10, labirinto: 8 };

const defaultQuizCounts = { quiz: 5 };

const defaultSoletraWordLimits = { soletra: 3 };

const defaultCatchInitialFallTimes = { catch: 10 };

const defaultWordSearchWordLimits = { wordsearch: 5 };
const defaultHangmanWordLengths = { hangman: 5 };
const defaultLabirintoWordLengths = { labirinto: 5 };

const normalizePhone = (value) => (value || "").replace(/\D/g, "");
const onlyDigits = (value) => (value || "").replace(/\D/g, "").slice(0, 11);
const formatPhoneDigits = (digits) => {
  const d = (digits || "").replace(/\D/g, "").slice(0, 11);
  const len = d.length;
  if (len === 0) return "";
  if (len <= 2) return `(${d}`;
  if (len <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
};

export function App() {
  const [initialDatabase] = useState(() => getSeedDatabase());
  const [screen, setScreen] = useState(() => {
    const saved = localStorage.getItem("app_screen");
    return saved || (initialDatabase.session.screen ?? "menu");
  });
  const [selectedGame, setSelectedGame] = useState(() => {
    const saved = localStorage.getItem("app_selectedGame");
    return saved || (initialDatabase.session.selectedGame ?? null);
  });
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
  const [soletraWordLimits, setSoletraWordLimits] = useState({
    ...defaultSoletraWordLimits,
    ...(initialDatabase.settings.soletraWordLimits ?? {}),
  });
  const [catchInitialFallTimes, setCatchInitialFallTimes] = useState({
    ...defaultCatchInitialFallTimes,
    ...(initialDatabase.settings.catchInitialFallTimes ?? {}),
  });
  const [wordSearchWordLimits, setWordSearchWordLimits] = useState({
    ...defaultWordSearchWordLimits,
    ...(initialDatabase.settings.wordSearchWordLimits ?? {}),
  });
  const [hangmanWordLengths, setHangmanWordLengths] = useState({
    ...defaultHangmanWordLengths,
    ...(initialDatabase.settings.hangmanWordLengths ?? {}),
  });
  const [labirintoWordLengths, setLabirintoWordLengths] = useState({
    ...defaultLabirintoWordLengths,
    ...(initialDatabase.settings.labirintoWordLengths ?? {}),
  });
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isDatabaseHydrated, setIsDatabaseHydrated] = useState(false);
  const [gameSessionKey, setGameSessionKey] = useState(0);
  const lastSessionPhoneRef = useRef("");
  const lastSessionNameRef = useRef("");
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

      setName(db.player.name ?? "");
      const hydratedPhone = db.player.phone
        ? formatPhoneDigits(normalizePhone(db.player.phone))
        : "";
      setPhone(hydratedPhone);
      setGameData({ ...defaultGameData, ...(db.gameData ?? {}) });

      try {
        const remoteRanking = await getRanking();
        setRanking(Array.isArray(remoteRanking) ? remoteRanking : []);
      } catch (e) {
        setRanking(Array.isArray(db.ranking) ? db.ranking : []);
      }

      setLeadsByPhone(db.leads ?? {});
      setTimeLimits({
        ...defaultTimeLimits,
        ...(db.settings.timeLimits ?? {}),
      });
      setWordSearchWordLimits({
        ...defaultWordSearchWordLimits,
        ...(db.settings.wordSearchWordLimits ?? {}),
      });
      setHangmanWordLengths({
        ...defaultHangmanWordLengths,
        ...(db.settings.hangmanWordLengths ?? {}),
      });
      setLabirintoWordLengths({
        ...defaultLabirintoWordLengths,
        ...(db.settings.labirintoWordLengths ?? {}),
      });
      setPairsLimits({ ...defaultPairs, ...(db.settings.pairsLimits ?? {}) });
      setGridSizes({ ...defaultGridSizes, ...(db.settings.gridSizes ?? {}) });
      setQuizQuestionLimits({
        ...defaultQuizCounts,
        ...(db.settings.quizQuestionLimits ?? {}),
      });
      setSoletraWordLimits({
        ...defaultSoletraWordLimits,
        ...(db.settings.soletraWordLimits ?? {}),
      });
      setCatchInitialFallTimes({
        ...defaultCatchInitialFallTimes,
        ...(db.settings.catchInitialFallTimes ?? {}),
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

  // Persistência de Sessão
  useEffect(() => {
    localStorage.setItem("app_screen", screen);
    if (selectedGame) {
      localStorage.setItem("app_selectedGame", selectedGame);
    } else {
      localStorage.removeItem("app_selectedGame");
    }
  }, [screen, selectedGame]);

  const effectiveTimeLimit = (gameId) => timeLimits[gameId] ?? 30;

  const wordSearchWordBounds = useMemo(() => {
    const currentGridSize = Math.max(1, Number(gridSizes.wordsearch ?? 10));
    const words = Array.isArray(gameData.wordSearchWords)
      ? gameData.wordSearchWords
      : [];

    const fittingCount = words.filter(
      (word) =>
        String(word ?? "").trim().length > 0 &&
        String(word).length <= currentGridSize,
    ).length;

    return {
      min: fittingCount > 0 ? 1 : 0,
      max: fittingCount,
    };
  }, [gameData.wordSearchWords, gridSizes.wordsearch]);

  const quizQuestionBounds = useMemo(() => {
    const questions = Array.isArray(gameData.quizQuestions)
      ? gameData.quizQuestions
      : [];

    const fittingCount = questions.filter((question) => {
      const prompt = String(
        question?.question ?? question?.prompt ?? "",
      ).trim();
      const answer = String(question?.answer ?? "").trim();
      return prompt.length > 0 && answer.length > 0;
    }).length;

    return {
      min: fittingCount > 0 ? 1 : 0,
      max: fittingCount,
    };
  }, [gameData.quizQuestions]);

  const soletraWordBounds = useMemo(() => {
    const rounds = Array.isArray(gameData.soletraRoundData?.exemplos)
      ? gameData.soletraRoundData.exemplos
      : [];

    const fittingCount = rounds.reduce((total, round) => {
      if (Array.isArray(round?.alvos) && round.alvos.length > 0) {
        return (
          total +
          round.alvos.filter(
            (item) => String(item?.palavra ?? "").trim().length > 0,
          ).length
        );
      }

      return total + (String(round?.word ?? "").trim().length > 0 ? 1 : 0);
    }, 0);

    return {
      min: fittingCount > 0 ? 1 : 0,
      max: fittingCount,
    };
  }, [gameData.soletraRoundData]);

  useEffect(() => {
    // Garante limites corretos no menu mesmo antes de selecionar o jogo
    if (!isDatabaseHydrated) return;

    const preloadWordSearchData = async () => {
      try {
        const content = await getGameContent("wordsearch");
        if (!content) return;

        const words = Array.isArray(content.words)
          ? content.words.map((w) => w.word)
          : [];

        setGameData((prev) => ({
          ...prev,
          wordSearchWords: words,
        }));
      } catch (err) {}
    };

    const preloadQuizData = async () => {
      try {
        const content = await getGameContent("quiz");
        if (!content) return;

        const quiz = Array.isArray(content.quiz) ? content.quiz : [];

        setGameData((prev) => ({
          ...prev,
          quizQuestions: quiz,
        }));
      } catch (err) {}
    };

    const preloadSoletraData = async () => {
      try {
        const content = await getGameContent("soletra");
        if (!content) return;

        const rounds = Array.isArray(content.rounds) ? content.rounds : [];

        setGameData((prev) => ({
          ...prev,
          soletraRoundData: { exemplos: rounds },
        }));
      } catch (err) {}
    };

    preloadWordSearchData();
    preloadQuizData();
    preloadSoletraData();
  }, [isDatabaseHydrated]);
  useEffect(() => {
    if (!selectedGame || !isDatabaseHydrated) return;

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
          whac: { key: "whacData", data: words },
        };

        const mapping = dataMap[selectedGame];
        if (mapping) {
          setGameData((prev) => ({
            ...prev,
            [mapping.key]: mapping.data,
          }));
        }
      } catch (err) {}
    };

    loadGameData();
  }, [selectedGame, isDatabaseHydrated]);

  const normalizedPhone = normalizePhone(phone);

  // Busca o nome do jogador no backend automaticamente ao digitar o telefone
  useEffect(() => {
    if (!isRemoteMode || normalizedPhone.length < 11) return;

    let active = true;
    // Send masked phone to identify endpoint (backend expects masked format)
    const masked = formatPhoneDigits(normalizedPhone);
    getPlayer(masked)
      .then((player) => {
        if (!active) return;
        if (player && player.name) {
          setLeadsByPhone((prev) => ({
            ...prev,
            // keep lookup key as normalized digits
            [normalizedPhone]: { name: player.name, phone: masked },
          }));
          setName((currentName) => {
            if (!currentName || currentName === "") return player.name;
            return currentName;
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [normalizedPhone, isRemoteMode]);

  const knownLead = normalizedPhone ? leadsByPhone[normalizedPhone] : null;
  const isKnownPhone = Boolean(knownLead);
  const canPlay =
    normalizedPhone.length >= 11 && (isKnownPhone || name.trim().length > 0);
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
            maxWords: props.wordSearchWordLimit,
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
            gridSize: props.gridSize || 8,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      soletra: (props) => (
        <SoletraGame
          data={{ roundData: gameData.soletraRoundData }}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds,
            wordLimit: props.wordLimit,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      catch: (props) => (
        <CatchGame
          data={{}}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds,
            initialFallTimeSeconds: props.initialFallTimeSeconds,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
        />
      ),
      whac: (props) => (
        <WhacGame
          data={{}}
          settings={{
            timeLimitSeconds: props.timeLimitSeconds || 30,
            gridSize: props.gridSize,
          }}
          ranking={props.ranking}
          onScore={props.onScore}
          onGameOver={props.onGameOver}
          onPlayAgain={props.onPlayAgain}
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

  const openAdminHub = () => {
    setSelectedGame(null);
    setScreen("admin");
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
    if (gameId === "labirinto") {
      const allowedSizes = [5, 8, 10];
      const safeSize = allowedSizes.includes(valueSize) ? valueSize : 8;
      setGridSizes((prev) => ({ ...prev, [gameId]: safeSize }));
      return;
    }

    setGridSizes((prev) => ({ ...prev, [gameId]: valueSize }));
  };

  const handleQuizLimitChange = (gameId, valueLimit) => {
    setQuizQuestionLimits((prev) => ({ ...prev, [gameId]: valueLimit }));
  };

  const handleWordSearchWordLimitChange = (gameId, valueLimit) => {
    setWordSearchWordLimits((prev) => ({ ...prev, [gameId]: valueLimit }));
  };

  const handleHangmanWordLengthChange = (gameId, value) => {
    setHangmanWordLengths((prev) => ({ ...prev, [gameId]: value }));
  };

  const handleLabirintoWordLengthChange = (gameId, value) => {
    setLabirintoWordLengths((prev) => ({ ...prev, [gameId]: value }));
  };

  const handleSoletraWordLimitChange = (gameId, valueLimit) => {
    setSoletraWordLimits((prev) => ({ ...prev, [gameId]: valueLimit }));
  };

  const handleCatchInitialFallTimeChange = (gameId, valueSeconds) => {
    const safeValue = Number.isFinite(valueSeconds)
      ? Math.min(30, Math.max(3, valueSeconds))
      : 10;
    setCatchInitialFallTimes((prev) => ({ ...prev, [gameId]: safeValue }));
  };

  const gameKey = String(selectedGame || "").trim();

  const gameDataMemo = useMemo(
    () => ({
      symbols: gameData.memorySymbols,
      questions: gameData.quizQuestions,
      words:
        gameKey === "hangman"
          ? (gameData.hangmanWords || []).filter(
              (w) => w.length === (hangmanWordLengths[gameKey] || 5),
            )
          : gameKey === "labirinto"
            ? (gameData.labirintoWords || []).filter(
                (w) => w.length === (labirintoWordLengths[gameKey] || 5),
              )
            : gameData.hangmanWords ||
              gameData.wordSearchWords ||
              gameData.labirintoWords,
      rounds: gameData.soletraRoundData?.exemplos,
    }),
    [gameKey, gameData, hangmanWordLengths, labirintoWordLengths],
  );

  const gameConfigMemo = useMemo(
    () => ({
      timeLimitSeconds: effectiveTimeLimit(gameKey) || 30,
      pairCount: pairsLimits && pairsLimits[gameKey] ? pairsLimits[gameKey] : 6,
      gridSize:
        gameKey === "labirinto"
          ? gridSizes[gameKey] || 8
          : gridSizes[gameKey] || 12,
      questionLimit: quizQuestionLimits[gameKey] || 5,
      wordLimit:
        gameKey === "hangman"
          ? hangmanWordLengths[gameKey] || 5
          : gameKey === "labirinto"
            ? labirintoWordLengths[gameKey] || 5
            : soletraWordLimits[gameKey] || 3,
      wordSearchWordLimit: wordSearchWordLimits[gameKey] || 5,
      initialFallTimeSeconds: catchInitialFallTimes[gameKey] || 10,
    }),
    [
      gameKey,
      pairsLimits,
      gridSizes,
      quizQuestionLimits,
      hangmanWordLengths,
      labirintoWordLengths,
      soletraWordLimits,
      catchInitialFallTimes,
    ],
  );

  useEffect(() => {
    const min = wordSearchWordBounds.min;
    const max = wordSearchWordBounds.max;
    const currentValue = wordSearchWordLimits.wordsearch;

    const fallback = max < 1 ? 0 : Math.min(5, max);
    const normalizedCurrent = Number.isFinite(currentValue)
      ? Math.floor(currentValue)
      : fallback;

    const clamped =
      max < 1 ? 0 : Math.min(max, Math.max(min, normalizedCurrent));

    if (currentValue !== clamped) {
      setWordSearchWordLimits((prev) => ({ ...prev, wordsearch: clamped }));
    }
  }, [wordSearchWordBounds, wordSearchWordLimits.wordsearch]);

  useEffect(() => {
    const min = quizQuestionBounds.min;
    const max = quizQuestionBounds.max;
    const currentValue = quizQuestionLimits.quiz;

    const fallback = max < 1 ? 0 : Math.min(5, max);
    const normalizedCurrent = Number.isFinite(currentValue)
      ? Math.floor(currentValue)
      : fallback;

    const clamped =
      max < 1 ? 0 : Math.min(max, Math.max(min, normalizedCurrent));

    if (currentValue !== clamped) {
      setQuizQuestionLimits((prev) => ({ ...prev, quiz: clamped }));
    }
  }, [quizQuestionBounds, quizQuestionLimits.quiz]);

  useEffect(() => {
    const min = soletraWordBounds.min;
    const max = soletraWordBounds.max;
    const currentValue = soletraWordLimits.soletra;

    const fallback = max < 1 ? 0 : Math.min(3, max);
    const normalizedCurrent = Number.isFinite(currentValue)
      ? Math.floor(currentValue)
      : fallback;

    const clamped =
      max < 1 ? 0 : Math.min(max, Math.max(min, normalizedCurrent));

    if (currentValue !== clamped) {
      setSoletraWordLimits((prev) => ({ ...prev, soletra: clamped }));
    }
  }, [soletraWordBounds, soletraWordLimits.soletra]);

  const handleScore = async ({
    points = 0,
    remainingSeconds = 0,
    timedOut = false,
  }) => {
    const gameId = selectedGame;
    // Use the phone/name captured at the moment the session started (masked)
    const phoneKey =
      lastSessionPhoneRef.current || formatPhoneDigits(normalizedPhone);
    const playerName =
      lastSessionNameRef.current || (isKnownPhone ? knownLead.name : name);
    if (!phoneKey || !playerName || !gameId) return;

    const timeBonus = timedOut
      ? 0
      : Math.max(0, Number(remainingSeconds || 0)) * 1;
    const totalPoints = Number(points || 0) + timeBonus;

    const updateLocalRanking = () => {
      setRanking((prev) => {
        const current = prev.find((row) => row.phone === phoneKey);

        const nextEntry = {
          id:
            current?.id ??
            (crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`),
          name: playerName,
          phone: phoneKey,
          totalPoints: (current?.totalPoints ?? 0) + totalPoints,
        };

        const withoutCurrent = prev.filter((row) => row.phone !== phoneKey);
        const newRanking = sortRanking([...withoutCurrent, nextEntry]);

        // Plano B: Salvar fallback local
        try {
          localStorage.setItem(
            "jogos_fallback_ranking",
            JSON.stringify(newRanking),
          );
        } catch (e) {}

        return newRanking;
      });

      return totalPoints;
    };

    const optimisticPoints = updateLocalRanking();

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
        if (response && Array.isArray(response.top10)) {
          setRanking((prev) => {
            const mergedByPhone = new Map(prev.map((row) => [row.phone, row]));

            response.top10.forEach((row) => {
              const localRow = mergedByPhone.get(row.phone);
              mergedByPhone.set(row.phone, {
                ...row,
                totalPoints:
                  row.totalPoints ?? row.points ?? localRow?.totalPoints ?? 0,
              });
            });

            return sortRanking(Array.from(mergedByPhone.values()));
          });
        }
      } catch (err) {
        console.error("Falha ao salvar no backend, usando Plano B:", err);
      } finally {
        setIsSavingScore(false);
      }
    }

    return optimisticPoints;
  };

  const handlePlayAgain = () => {
    setGameSessionKey((currentKey) => currentKey + 1);
  };

  const startGame = async () => {
    if (!canPlay || !selectedGame) return;
    const phoneDigits = normalizePhone(phone);
    const phoneMasked = formatPhoneDigits(phoneDigits);
    const finalName =
      isKnownPhone && knownLead?.name && name !== knownLead.name
        ? knownLead.name
        : name.trim();

    if (!isKnownPhone && finalName.length === 0) {
      window.alert("Informe o nome para cadastrar um novo jogador.");
      return;
    }

    if (isRemoteMode) {
      setIsStartingGame(true);
      try {
        await registerPlayer(finalName, phoneMasked);
      } catch (err) {
        console.error("Falha ao registrar jogador no backend", err);
      } finally {
        setIsStartingGame(false);
      }
    }

    if (!isKnownPhone) {
      setLeadsByPhone((prev) => ({
        ...prev,
        [phoneDigits]: {
          name: finalName,
          phone: phoneMasked,
        },
      }));
    } else if (knownLead?.name && name !== knownLead.name) {
      setName(knownLead.name);
    }

    // Capture phone/name (masked) for this session to avoid later edits affecting saved score
    lastSessionPhoneRef.current = phoneMasked;
    lastSessionNameRef.current = finalName;

    setScreen("play");
  };

  const handlePhoneChange = (value) => {
    const digits = onlyDigits(value);
    const masked = formatPhoneDigits(digits);
    setPhone(masked);
    const existing = digits ? leadsByPhone[digits] : null;
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
            catchInitialFallTimes={catchInitialFallTimes}
            wordSearchWordLimits={wordSearchWordLimits}
            wordSearchWordBounds={wordSearchWordBounds}
            hangmanWordLengths={hangmanWordLengths}
            labirintoWordLengths={labirintoWordLengths}
            pairsLimits={pairsLimits}
            gridSizes={gridSizes}
            quizQuestionBounds={quizQuestionBounds}
            quizQuestionLimits={quizQuestionLimits}
            soletraWordBounds={soletraWordBounds}
            soletraWordLimits={soletraWordLimits}
            onTimeLimitChange={handleTimeLimitChange}
            onCatchInitialFallTimeChange={handleCatchInitialFallTimeChange}
            onWordSearchWordLimitChange={handleWordSearchWordLimitChange}
            onHangmanWordLengthChange={handleHangmanWordLengthChange}
            onLabirintoWordLengthChange={handleLabirintoWordLengthChange}
            onPairsChange={handlePairsChange}
            onGridSizeChange={handleGridSizeChange}
            onQuizLimitChange={handleQuizLimitChange}
            onSoletraWordLimitChange={handleSoletraWordLimitChange}
            onOpenAdminHub={openAdminHub}
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
                {isStartingGame
                  ? "Registrando..."
                  : `Começar ${selectedMeta.title}`}
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
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(11, 18, 32, 0.8)",
                borderRadius: 12,
                color: "var(--text-color)",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: "1.2rem" }}>
                Salvando placar...
              </p>
            </div>
          )}
          {ActiveGame ? (
            <div
              style={{
                opacity: isSavingScore ? 0.6 : 1,
                pointerEvents: isSavingScore ? "none" : "auto",
                transition: "opacity 0.2s",
              }}
            >
              {(() => {
                const commonProps = {
                  onScore: handleScore,
                  onPlayAgain: handlePlayAgain,
                  ranking: [],
                };
                const gameKeyId = `${gameKey}-${gameSessionKey}`;

                if (gameKey === "memory")
                  return (
                    <MemoryGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                    />
                  );
                if (gameKey === "quiz")
                  return (
                    <QuizGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                    />
                  );
                if (gameKey === "hangman")
                  return (
                    <HangmanGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                    />
                  );
                if (gameKey === "wordsearch")
                  return (
                    <WordSearchGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                    />
                  );
                if (gameKey === "labirinto")
                  return (
                    <LabirintoGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                    />
                  );
                if (gameKey === "soletra")
                  return (
                    <SoletraGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                    />
                  );
                if (gameKey === "catch")
                  return (
                    <CatchGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                      initialFallTimeSeconds={
                        gameConfigMemo.initialFallTimeSeconds
                      }
                    />
                  );
                if (gameKey === "whac")
                  return (
                    <WhacGame
                      key={gameKeyId}
                      {...commonProps}
                      data={gameDataMemo}
                      config={gameConfigMemo}
                    />
                  );

                return <p>Jogo não encontrado.</p>;
              })()}
            </div>
          ) : (
            <p>Jogo não encontrado.</p>
          )}
        </section>
      )}

      {screen === "admin" && (
        <section className="game-area">
          <AdminHub onBackToMenu={goMainMenu} />
        </section>
      )}
    </div>
  );
}

export default App;
