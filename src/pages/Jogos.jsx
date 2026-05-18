import { useEffect, useState } from "react";
import MemoryGame from "../components/jogoDaMemoria/MemoryGame";
import HangmanGame from "../components/hangmanGame/HangmanGame";
import LabirintoGame from "../components/labirintoGame/LabirintoGame";
import QuizGame from "../components/quizGame/QuizGame";
import CatchGame from "../components/catchGame/CatchGame";
import WhacGame from "../components/whacGame/WhacGame";
import WordSearchGame from "../components/wordSearchGame/WordSearchGame";
import SoletraGame from "../components/soletraGame/SoletraGame";
import { HeaderJogo } from "../components/headerJogo/HeaderJogo";
import { getGameContent, getRanking, saveGameScore } from "../lib/appDatabase";

export function Jogos({
  player = {},
  selectedGame = {},
  onBackToMenu,
  onBackToCadastro,
}) {
  const [gameState, setGameState] = useState({});
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const gameCode = selectedGame.code ?? "memory";

        // Carrega conteúdo e ranking em paralelo
        const [content, remoteRanking] = await Promise.all([
          getGameContent(gameCode),
          getRanking().catch(() => []),
        ]);

        if (!active) return;

        // Estrutura dados específicos para cada jogo
        const structuredData = structureGameData(gameCode, content);

        setGameState({
          [gameCode]: structuredData,
        });
        setRanking(Array.isArray(remoteRanking) ? remoteRanking : []);
      } catch (error) {
        if (!active) return;
        console.error("Erro ao carregar jogo:", error);
        setGameState({});
        setRanking([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [selectedGame.code]);

  // Estrutura dados específicos de cada jogo
  const structureGameData = (gameCode, rawData) => {
    const structure = {
      memory: () => ({
        symbols: Array.isArray(rawData?.words) ? rawData.words : [],
        raw: rawData,
      }),
      hangman: () => ({
        words: normalizeWords(rawData?.words),
        raw: rawData,
      }),
      labirinto: () => {
        const norm = normalizeWords(rawData?.words);
        const configuredLength = selectedGame.config?.labirintoWordLength;
        const filtered = configuredLength ? norm.filter((w) => w.length === configuredLength) : norm;
        return {
          words: filtered,
          wordLength: rawData?.wordLength,
          raw: rawData,
        };
      },
      quiz: () => ({
        questions: Array.isArray(rawData?.quiz)
          ? rawData.quiz
          : Array.isArray(rawData?.questions)
            ? rawData.questions
            : [],
        raw: rawData,
      }),
      catch: () => ({
        config: rawData?.config || {},
        raw: rawData,
      }),
      whac: () => ({
        config: rawData?.config || {},
        raw: rawData,
      }),
      wordsearch: () => ({
        words: Array.isArray(rawData?.words)
          ? rawData.words.map((w) => (typeof w === "string" ? w : w.word))
          : [],
        raw: rawData,
      }),
      soletra: () => ({
        roundData: rawData,
        raw: rawData,
      }),
    };

    const structureFn = structure[gameCode] || (() => ({ raw: rawData }));
    return structureFn();
  };

  // Normaliza palavras para formato string
  const normalizeWords = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return item.word ?? item.text ?? item.value ?? item.name ?? "";
        }
        return "";
      })
      .map((word) => String(word).trim().toUpperCase())
      .filter((word) => word.length > 0);
  };

  const handleScore = async (payload = {}) => {
    const phone = String(player.phone ?? "").trim();
    if (!phone) return;

    setSaving(true);
    try {
      await saveGameScore({
        phone,
        gameCode: selectedGame.code ?? "memory",
        points: Number(payload.score ?? payload.points ?? 0),
        remainingSeconds: Number(payload.remainingSeconds ?? 0),
        timedOut: Boolean(payload.timedOut),
      });
      const remoteRanking = await getRanking().catch(() => []);
      setRanking(Array.isArray(remoteRanking) ? remoteRanking : []);
    } finally {
      setSaving(false);
    }
  };

  const renderGame = () => {
    const code = selectedGame.code ?? "memory";
    const data = gameState[code] || {};

    const commonProps = {
      ranking,
      onScore: handleScore,
      config: selectedGame.config || {},
    };

    switch (code) {
      case "memory":
        return (
          <MemoryGame data={{ symbols: data.symbols || [] }} {...commonProps} />
        );

      case "hangman":
        return (
          <HangmanGame data={{ words: data.words || [] }} {...commonProps} />
        );

      case "labirinto":
        return (
          <LabirintoGame data={{ words: data.words || [] }} {...commonProps} />
        );

      case "quiz":
        return (
          <QuizGame
            data={{ questions: data.questions || [] }}
            {...commonProps}
          />
        );

      case "catch":
        return <CatchGame data={data} {...commonProps} />;

      case "whac":
        return (
          <WhacGame
            data={data}
            onPlayAgain={() => window.location.reload()}
            {...commonProps}
          />
        );

      case "wordsearch":
        return (
          <WordSearchGame data={{ words: data.words || [] }} {...commonProps} />
        );

      case "soletra":
        return (
          <SoletraGame
            data={{ roundData: data.roundData || data.raw }}
            {...commonProps}
          />
        );

      default:
        return <p>Jogo não encontrado: {code}</p>;
    }
  };

  if (loading) {
    return <p>Carregando {selectedGame.title}...</p>;
  }

  return (
    <>
      <HeaderJogo
        title={selectedGame.title || "Jogo"}
        subtitle="Em progresso"
        time="--:--"
        points={0}
        onBackToMenu={onBackToMenu}
        onBackToCadastro={onBackToCadastro}
      />
      {renderGame()}
      {saving && <p>Salvando pontuação...</p>}
    </>
  );
}

export default Jogos;
