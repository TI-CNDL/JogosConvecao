import { useEffect, useMemo, useRef, useState } from "react";
import { Titulo } from "./components/titulo/Titulo.jsx";
import MemoryGame from "./components/JogodaMemoria/MemoryGame.jsx";
import QuizGame from "./components/quizGame/QuizGame.jsx";
import HangmanGame from "./components/hangmanGame/HangmanGame.jsx";
import WordSearchGame from "./components/wordSearchGame/WordSearchGame.jsx";
import LabirintoGame from "./components/labirintoGame/LabirintoGame.jsx";
import SoletraGame from "./components/soletraGame/SoletraGame.jsx";
import CatchGame from "./components/catchGame/CatchGame.jsx";
import WhacGame from "./components/whacGame/WhacGame.jsx";
import AdminHub from "./components/adminHub/AdminHubV2.jsx";
import Home from "./pages/Home.jsx";
import Jogos from "./pages/Jogos.jsx";
import Ranking from "./pages/Ranking.jsx";
import HeaderBar from "./components/headerBar/HeaderBar.jsx";
import Cadastro from "./pages/Cadastro.jsx";
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

/**
 * Lista estática de minijogos disponíveis no sistema.
 * Contém o identificador único, título exibido e descrição curta para o MenuGrid.
 *
 * Observação de separação: este bloco é apenas dados estáticos e é 100% seguro
 * movê-lo para um arquivo separado (ex: `src/data/games.js`) sem afetar a lógica.
 */
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

/**
 * Estrutura padrão inicial de dados para os jogos (palavras, perguntas, rounds).
 * Serve como fallback caso o banco de dados inicial esteja vazio.
 *
 * Observação de separação: também pode ser extraído para `src/lib/defaults.js`.
 */
const defaultGameData = {
  memorySymbols: [],
  labirintoWords: [],
  soletraRoundData: { exemplos: [] },
  quizQuestions: [],
  hangmanWords: [],
  wordSearchWords: [],
};

// Valores padrão de fallback para configurações caso não estejam definidos no banco
const defaultTimeLimits = {};
const defaultPairs = { memory: 6 };
const defaultGridSizes = { whac: 12, wordsearch: 10, labirinto: 8 };
const defaultQuizCounts = { quiz: 5 };
const defaultSoletraWordLimits = { soletra: 3 };
const defaultCatchInitialFallTimes = { catch: 10 };
const defaultWordSearchWordLimits = { wordsearch: 5 };
const defaultHangmanWordLengths = { hangman: 5 };
const defaultLabirintoWordLengths = { labirinto: 5 };

/**
 * Funções utilitárias para normalização e formatação de números de telefone (Padrão DDD + 9 dígitos).
 *
 * Observação de separação: são utilitários puros — seguros para mover para
 * `src/utils/phone.js` e importar onde necessário. Se mover, atualize as
 * importações no `App` e nas páginas que precisarem formatar/validar telefone.
 */
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

/**
 * Calcula a pontuação percentual com base nos acertos parciais.
 *
 * Observação de separação: utilitário de pontuação — seguro para mover para
 * `src/utils/scoring.js`.
 */
const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
};

/**
 * COMPONENTE ORQUESTRADOR PRINCIPAL DA APLICAÇÃO (App)
 * Gerencia o estado global de navegação (telas), jogador ativo, configurações de cada minijogo,
 * sincronização com a API REST do backend e persistência de sessão no localStorage.
 *
 * Sugestão de refatoração / pontos de separação (o que você pediu):
 * - Pages/Home.jsx  -> conteúdo da tela inicial (menu + opções de configuração)
 * - Pages/Cadastro.jsx -> tela de identificação/cadastro do jogador (PlayerForm + botões)
 * - Pages/Jogo.jsx -> responsável por montar e renderizar os jogos (estado de sessão do jogo,
 *                     escolha de componente e wrapper que passa `onScore`, `onPlayAgain`, etc.)
 * - Pages/Ranking.jsx -> UI do ranking (tabela e lógica de ordenação/format)
 *
 * Para cada separação, indico abaixo os trechos "seguros para mover" e as dependências
 * necessárias (props ou hooks). IMPORTANTE: aqui não alterei nenhum comportamento,
 * apenas comentei onde é seguro extrair código.
 */
export function App() {
  // Inicializa o banco de dados semente (vazio) como base
  const [initialDatabase] = useState(() => getSeedDatabase());

  // Estado da tela atual ('menu', 'identify', 'play', 'admin') com persistência no localStorage
  const [screen, setScreen] = useState(() => {
    const saved = localStorage.getItem("app_screen");
    return saved || (initialDatabase.session.screen ?? "menu");
  });

  // Identificador do jogo selecionado atualmente
  const [selectedGame, setSelectedGame] = useState(() => {
    const saved = localStorage.getItem("app_selectedGame");
    return saved || (initialDatabase.session.selectedGame ?? null);
  });

  // Dados do jogador ativo (Nome e Telefone)
  const [name, setName] = useState(initialDatabase.player.name ?? "");
  const [phone, setPhone] = useState(initialDatabase.player.phone ?? "");

  // Dados de conteúdo dos jogos (palavras, perguntas, símbolos)
  const [gameData, setGameData] = useState({
    ...defaultGameData,
    ...(initialDatabase.gameData ?? {}),
  });

  // Lista do ranking geral
  const [ranking, setRanking] = useState(initialDatabase.ranking ?? []);
  // Cache de leads/jogadores conhecidos mapeados por telefone
  const [leadsByPhone, setLeadsByPhone] = useState(initialDatabase.leads ?? {});

  // Estados de configurações individuais por minijogo (Tempo, Pares, Grid, Limites)
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

  // Flags de controle de requisição e hidratação
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isDatabaseHydrated, setIsDatabaseHydrated] = useState(false);
  const [gameSessionKey, setGameSessionKey] = useState(0);

  // Referências para capturar e congelar os dados da sessão no momento do início do jogo
  const lastSessionPhoneRef = useRef("");
  const lastSessionNameRef = useRef("");
  const didInitialHydrate = useRef(false);

  // Efeito de inicialização: busca as configurações e ranking do servidor ao abrir o app
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

  // Observação: este cálculo determina quantas palavras do conteúdo cabem
  // no grid atual. Pode ser movido para um hook `useWordSearchBounds(gameData, gridSize)`.

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

  // Observação: validade de conteúdo para o Quiz. Seguro para extrair para um
  // hook `useQuizQuestionBounds` ou utilitário de validação de conteúdo.

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

  // Observação: bounds do Soletra — pode virar hook `useSoletraBounds(gameData)`.

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

  // Observação: estes pré-loads apenas garantem que o menu tenha counts corretos
  // mesmo antes da seleção. Se mover a UI do menu, mantenha estes pré-loads num
  // hook executado em `App` ou dentro de `Pages/Home.jsx` dependendo de onde você
  // desejar centralizar a lógica de dados.

  // Efeito executado ao selecionar um jogo: busca o conteúdo específico (palavras/perguntas) da API
  useEffect(() => {
    if (!selectedGame || !isDatabaseHydrated) return;

    const loadGameData = async () => {
      try {
        const content = await getGameContent(selectedGame);
        if (!content) return;

        const { words = [], quiz = [], rounds = [] } = content;

        // Mapeia o código do jogo para a respectiva chave de estado no gameData
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

  // Observação: `loadGameData` só atualiza `gameData` com o conteúdo do jogo
  // selecionado. Seguro para mover para dentro de `Pages/Jogo.jsx` ou para um
  // hook `useGameContent(selectedGame)` — desde que o estado final (`setGameData`)
  // seja preservado/atualizado da mesma forma.

  const normalizedPhone = normalizePhone(phone);

  /**
   * Efeito de busca automática de jogador: ao digitar um telefone completo (11 dígitos),
   * consulta a API para verificar se o jogador já existe e preenche seu nome automaticamente.
   */
  useEffect(() => {
    if (!isRemoteMode || normalizedPhone.length < 11) return;

    let active = true;
    const masked = formatPhoneDigits(normalizedPhone);
    getPlayer(masked)
      .then((player) => {
        if (!active) return;
        if (player && player.name) {
          setLeadsByPhone((prev) => ({
            ...prev,
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

  // Observação: Efeito que busca jogador remoto por telefone. Se mover o bloco
  // de cadastro para `Pages/Cadastro.jsx`, mantenha este efeito lá e passe
  // `setLeadsByPhone` e `setName` por props ou via contexto.

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
  // Observação: `gameComponents` é a fábrica de componentes de jogo. É recomendável
  // mover essa fábrica para `Pages/Jogo.jsx` (ou `src/games/index.js`) e expor
  // um componente `GameRenderer({ gameKey, config, data, onScore, onPlayAgain })`.
  // Se mover, passe `gameData` e `gameConfig` como props.
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

  // ==========================================================================
  // MANIPULADORES DE NAVEGAÇÃO E CONFIGURAÇÃO DE JOGOS
  // ==========================================================================

  // Retorna à tela de identificação/cadastro limpando os dados atuais
  const goCadastro = () => {
    setPhone("");
    setName("");
    setScreen("identify");
  };

  // Retorna ao menu principal com confirmação prévia caso um jogo esteja em andamento
  const goMainMenu = () => {
    const confirmed = window.confirm(
      "Deseja realmente voltar ao menu principal? O jogo atual será encerrado.",
    );
    if (!confirmed) return;
    setScreen("menu");
    setSelectedGame(null);
  };

  // Abre o painel de administração (AdminHub)
  const openAdminHub = () => {
    setSelectedGame(null);
    setScreen("admin");
  };

  // Seleciona um jogo no menu e avança para a tela de identificação do jogador
  const handleSelectGame = (gameId) => {
    setSelectedGame(gameId);
    setPhone("");
    setName("");
    setScreen("identify");
  };

  // Atualiza o tempo limite configurado para um jogo específico
  const handleTimeLimitChange = (gameId, valueSeconds) => {
    setTimeLimits((prev) => ({ ...prev, [gameId]: valueSeconds }));
  };

  // Atualiza o número de pares configurado para o Jogo da Memória
  const handlePairsChange = (gameId, valuePairs) => {
    setPairsLimits((prev) => ({ ...prev, [gameId]: valuePairs }));
  };

  // Atualiza o tamanho do tabuleiro (gridSize) garantindo valores seguros para o Labirinto (8 ou 10)
  const handleGridSizeChange = (gameId, valueSize) => {
    if (gameId === "labirinto") {
      const allowedSizes = [8, 10];
      const safeSize = allowedSizes.includes(valueSize) ? valueSize : 8;
      setGridSizes((prev) => ({ ...prev, [gameId]: safeSize }));
      return;
    }

    setGridSizes((prev) => ({ ...prev, [gameId]: valueSize }));
  };

  // Atualiza o limite de perguntas do Quiz
  const handleQuizLimitChange = (gameId, valueLimit) => {
    setQuizQuestionLimits((prev) => ({ ...prev, [gameId]: valueLimit }));
  };

  // Atualiza o limite de palavras do Caça-Palavras
  const handleWordSearchWordLimitChange = (gameId, valueLimit) => {
    setWordSearchWordLimits((prev) => ({ ...prev, [gameId]: valueLimit }));
  };

  // Atualiza o comprimento exato das palavras da Forca
  const handleHangmanWordLengthChange = (gameId, value) => {
    setHangmanWordLengths((prev) => ({ ...prev, [gameId]: value }));
  };

  // Atualiza o comprimento exato das palavras do Labirinto
  const handleLabirintoWordLengthChange = (gameId, value) => {
    setLabirintoWordLengths((prev) => ({ ...prev, [gameId]: value }));
  };

  // Atualiza o limite de rodadas/palavras do Soletra
  const handleSoletraWordLimitChange = (gameId, valueLimit) => {
    setSoletraWordLimits((prev) => ({ ...prev, [gameId]: valueLimit }));
  };

  // Atualiza o tempo inicial de queda dos itens na Cesta de Ofertas (CatchGame)
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

  // Observação: `gameConfigMemo` consolida configurações por jogo. Pode ficar
  // em `App` e ser passada para `Pages/Jogo.jsx` como `config`.

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

  /**
   * GERENCIADOR DE PONTUAÇÃO E FIM DE JOGO (handleScore)
   * Recebe os pontos e tempo restante de qualquer minijogo concluído, calcula bônus de tempo,
   * atualiza o ranking local otimistamente e envia os dados para persistência na API REST do backend.
   */
  const handleScore = async ({
    points = 0,
    remainingSeconds = 0,
    timedOut = false,
  }) => {
    const gameId = selectedGame;
    // Observação: este gerenciador centraliza a lógica de pontuação:
    // 1) cálculo de bônus de tempo;
    // 2) atualização otimista do ranking local;
    // 3) tentativa de sincronização com o backend (modo remoto) e fallback.
    // Pode ser extraído para um hook `useHandleScore({ setRanking, isRemoteMode, saveGameScore })`
    // desde que as refs congeladas (lastSessionPhoneRef/lastSessionNameRef) sejam passadas.
    // Utiliza o telefone e nome congelados no início da sessão para evitar que edições posteriores no input afitem o placar
    const phoneKey =
      lastSessionPhoneRef.current || formatPhoneDigits(normalizedPhone);
    const playerName =
      lastSessionNameRef.current || (isKnownPhone ? knownLead.name : name);
    if (!phoneKey || !playerName || !gameId) return;

    // Calcula o bônus somando os segundos restantes (se não tiver esgotado o tempo)
    const timeBonus = timedOut
      ? 0
      : Math.max(0, Number(remainingSeconds || 0)) * 1;
    const totalPoints = Number(points || 0) + timeBonus;

    // Atualização otimista do ranking local
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

        // Plano B: Salva no localStorage como fallback caso o backend falhe
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

    // Sincronização com o backend em modo remoto
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

  // Reinicia a partida atual incrementando a chave de sessão (força remontagem do componente do jogo)
  const handlePlayAgain = () => {
    setGameSessionKey((currentKey) => currentKey + 1);
  };

  /**
   * INÍCIO DE PARTIDA (startGame)
   * Valida os dados do jogador, registra na API caso seja um novo jogador,
   * congela as referências de nome/telefone para a sessão e avança para a tela de jogo ('play').
   */
  const startGame = async (payload = {}) => {
    // payload opcional permite iniciar jogo a partir de componentes externos
    // que forneçam `phone` (digits) e `name` diretamente (ex: CardForm).
    const providedPhone = payload.phone ?? null;
    const providedName = payload.name ?? null;

    const phoneDigits = providedPhone
      ? normalizePhone(providedPhone)
      : normalizePhone(phone);
    const phoneMasked = formatPhoneDigits(phoneDigits);

    const finalNameCandidate = providedName !== null ? providedName : name;
    const finalName =
      isKnownPhone && knownLead?.name && finalNameCandidate !== knownLead.name
        ? knownLead.name
        : String(finalNameCandidate ?? "").trim();

    if (!canPlay && !providedPhone) return;

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
    } else if (knownLead?.name && String(finalName) !== knownLead.name) {
      setName(knownLead.name);
    }

    // Congela o telefone e nome da sessão atual para garantir consistência no envio do placar
    lastSessionPhoneRef.current = phoneMasked;
    lastSessionNameRef.current = finalName;

    // garante que o estado de telefone e nome reflita os valores usados na sessão
    setPhone(phoneMasked);
    setName(finalName);

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

  // Observação: este handler faz parsing + busca local em `leadsByPhone`.
  // Se mover a UI de cadastro, exporte essa função ou reimplemente o lookup
  // usando o mesmo `leadsByPhone` (passado por props) ou um hook `useLeads()`.

  return (
    <div className="app-shell">
      {screen === "menu" && (
        <Home
          onStartGame={(payload) => {
            // payload: { code, title, config }
            setSelectedGame(String(payload?.code ?? "memory"));
            setPhone("");
            setName("");
            setScreen("identify");
          }}
        />
      )}

      {screen === "identify" && (
        <section className="game-area">
          {selectedMeta ? (
            <Cadastro
              selectedGame={selectedMeta}
              onStartChallenge={(payload) => {
                // payload expected: { phone: digitsOnly, name }
                const phoneDigits = String(payload?.phone ?? "");
                const playerName = String(payload?.name ?? "").trim();
                // atualiza inputs visuais e inicia o fluxo de startGame usando payload
                setPhone(formatPhoneDigits(phoneDigits));
                setName(playerName);
                startGame({ phone: phoneDigits, name: playerName });
              }}
            />
          ) : (
            <p>Selecione um jogo para continuar.</p>
          )}
        </section>
      )}

      {screen === "play" && (
        <Jogos
          player={{ name, phone }}
          selectedGame={selectedMeta}
          onBackToMenu={goMainMenu}
          onBackToCadastro={goCadastro}
        />
      )}

      {screen === "admin" && (
        <section className="game-area">
          {/* Observação: painel de administração — pode ser mantido como
              `AdminHub` aqui ou extraído para `Pages/Admin.jsx` se desejar
              manter todas as Pages em uma pasta `Pages/`. */}
          <AdminHub onBackToMenu={goMainMenu} />
        </section>
      )}

      {screen === "ranking" && (
        <section className="game-area">
          <Ranking />
        </section>
      )}
    </div>
  );
}

export default App;
