import { useEffect, useState } from "react";
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

const games = [
  { id: "memory", title: "Jogo da memória", description: "Ache os pares." },
  { id: "wordsearch", title: "Caça-palavras", description: "Encontre todos." },
  { id: "hangman", title: "Forca", description: "Descubra a palavra." },
  { id: "quiz", title: "Quiz", description: "3 perguntas rápidas." },
  { id: "labirinto", title: "Labirinto", description: "Ache a saída." },
  { id: "soletra", title: "Soletra", description: "Forme palavras." },
  { id: "catch", title: "Cesta de Ofertas", description: "Colete bons itens." },
];

const gameLabels = {
  memory: "Memória",
  wordsearch: "Caça-palavras",
  hangman: "Forca",
  quiz: "Quiz",
  labirinto: "Labirinto",
  soletra: "Soletra",
  catch: "Cesta de Ofertas",
};

const memorySymbols = [
  "CX",
  "SKU",
  "PIX",
  "NF",
  "POS",
  "PDV",
  "CAIXA",
  "ESTOQUE",
  "FRETE",
  "HUB",
  "LASTMILE",
  "PICKUP",
  "ROTA",
  "LOJA",
  "GONDOLA",
  "ESTOQUEBAIXO",
  "CHECKOUT",
  "CAIXAELETRONICO",
  "OPERADOR",
  "SUPERMERCADO",
  "ATACAREJO",
  "BALCAO",
  "BACKSTORE",
  "CD",
  "DARKSTORE",
  "OMNI",
  "OMNICHANNEL",
  "RETIRADALOJA",
  "CLICKCOLLECT",
  "ENTREGARAPIDA",
  "CURB",
  "CARRINHO",
  "PROMOCAO",
  "FIDELIDADE",
  "CASHBACK",
  "COMPROVANTE",
  "CUPOM",
  "ETIQUETA",
  "BALANCA",
  "SACOLA",
  "LOGETRO",
  "CEASA",
  "JOAOPESSOA",
  "PARAIBA",
  "MANGABEIRA",
  "TAMBAU",
  "CABOBRANCO",
  "BESSA",
];
const labirintoWords = [
  "LOJA",
  "PIX",
  "SKU",
  "PDV",
  "FILA",
  "CAIXA",
  "TOUCH",
  "JOGAR",
  "VAREJO",
  "PAINEL",
  "ENTREGA",
  "ESTOQUE",
  "JARDINEIRO",
];
const soletraRoundData = {
  exemplos: [
    {
      letras: ["L", "O", "G", "I", "S", "T", "A"],
      alvos: [
        {
          palavra: "LOGISTA",
          dica: "Profissional que organiza operacoes de transporte e distribuicao.",
        },
        {
          palavra: "SIGLA",
          dica: "Abreviacao comum em termos tecnicos do varejo.",
        },
        {
          palavra: "SOLO",
          dica: "Modo individual de operacao, com foco em uma unica pessoa.",
        },
      ],
    },
    {
      letras: ["C", "A", "I", "X", "P", "D", "V"],
      alvos: [
        {
          palavra: "CAIXA",
          dica: "Ponto de pagamento e fechamento da compra no varejo.",
        },
        {
          palavra: "PDV",
          dica: "Sigla do local onde a venda acontece ao cliente.",
        },
        {
          palavra: "VIA",
          dica: "Canal ou meio por onde a venda ou entrega ocorre.",
        },
      ],
    },
    {
      letras: ["E", "N", "T", "R", "G", "A", "L"],
      alvos: [
        {
          palavra: "ENTREGA",
          dica: "Etapa final da operacao logistica ate o cliente.",
        },
        {
          palavra: "TAG",
          dica: "Etiqueta curta usada para identificar item/processo.",
        },
        {
          palavra: "LAR",
          dica: "Destino residencial de boa parte das entregas.",
        },
      ],
    },
    {
      letras: ["E", "S", "T", "O", "Q", "U", "L"],
      alvos: [
        {
          palavra: "ESTOQUE",
          dica: "Conjunto de produtos armazenados para venda.",
        },
        {
          palavra: "LOTE",
          dica: "Conjunto de itens agrupados para controle.",
        },
        {
          palavra: "TOQUE",
          dica: "Contato no item usado em etapas de conferencia.",
        },
      ],
    },
    {
      letras: ["F", "R", "E", "T", "H", "U", "B"],
      alvos: [
        {
          palavra: "FRETE",
          dica: "Custo e operacao de transporte de mercadorias.",
        },
        {
          palavra: "HUB",
          dica: "Ponto central de consolidacao e distribuicao.",
        },
        {
          palavra: "RUTE",
          dica: "Forma reduzida de rota usada no planejamento.",
        },
      ],
    },
    {
      letras: ["O", "M", "N", "I", "C", "A", "L"],
      alvos: [
        {
          palavra: "OMNI",
          dica: "Estrategia que integra canais de atendimento e venda.",
        },
        {
          palavra: "CANAL",
          dica: "Meio de comunicacao e venda com o cliente.",
        },
        {
          palavra: "CLIMA",
          dica: "Termo usado para percepcao do ambiente da loja.",
        },
      ],
    },
  ],
};
const quizQuestions = [
  {
    prompt: "O que significa SKU no varejo?",
    options: ["Stock Keeping Unit", "Store Key Unit", "Sale Key User"],
    answer: "Stock Keeping Unit",
  },
  {
    prompt: "O PDV é mais usado para?",
    options: ["Ponto de venda", "Posto de viagem", "Plano de divulgação"],
    answer: "Ponto de venda",
  },
  {
    prompt: "Last mile é a etapa de?",
    options: ["Entrega final ao cliente", "Compra de insumos", "Gestão fiscal"],
    answer: "Entrega final ao cliente",
  },
  {
    prompt: "Qual meio de pagamento é instantâneo no Brasil?",
    options: ["Boleto", "PIX", "TED D+1"],
    answer: "PIX",
  },
  {
    prompt: "João Pessoa é capital de qual estado?",
    options: ["Pernambuco", "Paraíba", "Rio Grande do Norte"],
    answer: "Paraíba",
  },
  {
    prompt: "Click and collect corresponde a?",
    options: ["Retirar na loja", "Entrega por drone", "Pagamento em dinheiro"],
    answer: "Retirar na loja",
  },
  {
    prompt: "Qual praia famosa fica em João Pessoa?",
    options: ["Copacabana", "Cabo Branco", "Pipa"],
    answer: "Cabo Branco",
  },
  {
    prompt: "Qual bairro comercial é grande em João Pessoa?",
    options: ["Mangabeira", "Moema", "Savassi"],
    answer: "Mangabeira",
  },
  {
    prompt: "O que é dark store no varejo?",
    options: ["Loja fechada para picking", "Depósito fiscal", "Caixa rápido"],
    answer: "Loja fechada para picking",
  },
];
const hangmanWords = [
  "LOGISTICA",
  "VAREJO",
  "PAINEL",
  "TOUCH",
  "JOAOPESSOA",
  "PARAIBA",
  "MANGABEIRA",
  "ESTOQUE",
  "ENTREGA",
  "PICKUP",
  "FRETE",
  "HUBLOGISTICO",
  "OMNI",
  "CAIXA",
  "PDV",
  "GONDOLA",
  "CABOBRANCO",
  "BESSA",
  "TAMBAU",
];
const wordSearchWords = [
  "VAREJO",
  "LOGISTICA",
  "FRETE",
  "ESTOQUE",
  "ENTREGA",
  "CAIXA",
  "PDV",
  "SKU",
  "PIX",
  "PICKUP",
  "HUB",
  "JOAOPESSOA",
  "PARAIBA",
  "CABOBRANCO",
  "MANGABEIRA",
  "BESSA",
  "TAMBAU",
  "SUPERMERCADO",
  "ATACAREJO",
  "OMNI",
  "FIDELIDADE",
  "CASHBACK",
];

const defaultTimeLimits = {
  memory: 120,
  wordsearch: 150,
  hangman: 150,
  quiz: 120,
  labirinto: 120,
  soletra: 120,
  catch: 120,
};

const defaultPairs = {
  memory: 6,
};

const defaultGridSizes = {
  wordsearch: 10,
  labirinto: 8,
};

const defaultQuizCounts = {
  quiz: 5,
};

const storageKeys = {
  player: "player",
  leads: "leads",
  settings: "settings",
  session: "session",
  ranking: "ranking",
};

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const normalizePhone = (value) => (value || "").replace(/\D/g, "");
const calcularPontos = (parcial, total) => {
  if (!total || total <= 0) return 0;
  return Math.floor((Math.max(0, parcial) / total) * 100);
};

const gameComponents = {
  memory: (props) => (
    <MemoryGame
      symbols={memorySymbols}
      pairCount={props.pairCount}
      {...props}
    />
  ),
  wordsearch: (props) => (
    <WordSearchGame
      words={wordSearchWords}
      gridSize={props.gridSize}
      {...props}
    />
  ),
  hangman: (props) => <HangmanGame words={hangmanWords} {...props} />,
  quiz: (props) => (
    <QuizGame
      questions={quizQuestions}
      questionLimit={props.questionLimit}
      {...props}
    />
  ),
  labirinto: (props) => <LabirintoGame words={labirintoWords} {...props} />,
  soletra: (props) => <SoletraGame roundData={soletraRoundData} {...props} />,
  catch: (props) => <CatchGame {...props} />,
};

export function App() {
  const [screen, setScreen] = useState("menu");
  const [selectedGame, setSelectedGame] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ranking, setRanking] = useState([]);
  const [leadsByPhone, setLeadsByPhone] = useState({});
  const [timeLimits, setTimeLimits] = useState(defaultTimeLimits);
  const [pairsLimits, setPairsLimits] = useState(defaultPairs);
  const [gridSizes, setGridSizes] = useState(defaultGridSizes);
  const [quizQuestionLimits, setQuizQuestionLimits] =
    useState(defaultQuizCounts);

  const effectiveTimeLimit = (gameId) => Math.min(timeLimits[gameId] ?? 30, 30);

  useEffect(() => {
    const storedPlayer = safeParse(
      localStorage.getItem(storageKeys.player),
      {},
    );
    if (storedPlayer.name) setName(storedPlayer.name);
    if (storedPlayer.phone) setPhone(storedPlayer.phone);

    const storedSettings = safeParse(
      localStorage.getItem(storageKeys.settings),
      {},
    );
    if (storedSettings.timeLimits)
      setTimeLimits({ ...defaultTimeLimits, ...storedSettings.timeLimits });
    if (storedSettings.pairsLimits)
      setPairsLimits({ ...defaultPairs, ...storedSettings.pairsLimits });
    if (storedSettings.gridSizes)
      setGridSizes({ ...defaultGridSizes, ...storedSettings.gridSizes });
    if (storedSettings.quizQuestionLimits)
      setQuizQuestionLimits({
        ...defaultQuizCounts,
        ...storedSettings.quizQuestionLimits,
      });

    const storedSession = safeParse(
      localStorage.getItem(storageKeys.session),
      {},
    );
    if (storedSession.selectedGame) setSelectedGame(storedSession.selectedGame);
    if (storedSession.screen) setScreen(storedSession.screen);

    const storedLeads = safeParse(localStorage.getItem(storageKeys.leads), {});
    if (storedLeads && typeof storedLeads === "object") {
      setLeadsByPhone(storedLeads);
    }

    const storedRanking = safeParse(
      localStorage.getItem(storageKeys.ranking),
      [],
    );
    if (Array.isArray(storedRanking)) {
      setRanking(storedRanking);
    }
  }, []);
  const normalizedPhone = normalizePhone(phone);
  const knownLead = normalizedPhone ? leadsByPhone[normalizedPhone] : null;
  const isKnownPhone = Boolean(knownLead);
  const canPlay =
    normalizedPhone.length >= 10 && (isKnownPhone || name.trim().length > 1);
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
        .filter((row) => row.totalPoints !== 0)
        .slice(0, 10)
    : [];

  const mainMenuRanking = sortRanking(ranking).slice(0, 10);

  useEffect(() => {
    try {
      localStorage.setItem(storageKeys.player, JSON.stringify({ name, phone }));
    } catch {
      // ignore persist errors
    }
  }, [name, phone]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKeys.leads, JSON.stringify(leadsByPhone));
    } catch {
      // ignore persist errors
    }
  }, [leadsByPhone]);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKeys.settings,
        JSON.stringify({
          timeLimits,
          pairsLimits,
          gridSizes,
          quizQuestionLimits,
        }),
      );
    } catch {
      // ignore persist errors
    }
  }, [timeLimits, pairsLimits, gridSizes, quizQuestionLimits]);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKeys.session,
        JSON.stringify({ selectedGame, screen }),
      );
    } catch {
      // ignore persist errors
    }
  }, [selectedGame, screen]);

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
      const next = sortRanking([...withoutCurrent, nextEntry]);
      try {
        localStorage.setItem(storageKeys.ranking, JSON.stringify(next));
      } catch {
        // ignore persist errors
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKeys.ranking, JSON.stringify(ranking));
    } catch {
      // ignore persist errors
    }
  }, [ranking]);

  useEffect(() => {
    if (
      screen === "identify" &&
      selectedGame &&
      normalizedPhone.length >= 10 &&
      isKnownPhone
    ) {
      setScreen("play");
    }
  }, [screen, selectedGame, normalizedPhone, isKnownPhone]);

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
