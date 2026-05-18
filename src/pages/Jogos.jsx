import { useEffect, useState } from "react";
import MemoryGame from "../components/jogoDaMemoria/MemoryGame";
import HangmanGame from "../components/hangmanGame/HangmanGame";
import LabirintoGame from "../components/labirintoGame/LabirintoGame";
import QuizGame from "../components/quizGame/QuizGame";
import CatchGame from "../components/catchGame/CatchGame";
import WhacGame from "../components/whacGame/WhacGame";
import WordSearchGame from "../components/wordSearchGame/WordSearchGame";
import SoletraGame from "../components/soletraGame/SoletraGame";

import { getGameContent, getRanking, saveGameScore } from "../lib/appDatabase";

export function Jogos({
  player = {},
  selectedGame = {},
  onBackToMenu,
  onBackToCadastro,
}) {
  const [gameData, setGameData] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const gameCode = selectedGame.code ?? "memory";
        const [content, remoteRanking] = await Promise.all([
          getGameContent(gameCode),
          getRanking().catch(() => []),
        ]);

        if (!active) return;

        setGameData(content);
        setRanking(Array.isArray(remoteRanking) ? remoteRanking : []);
      } catch {
        if (!active) return;
        setGameData(null);
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

  if (loading) {
    return <p>Carregando {selectedGame.title}...</p>;
  }

  const commonProps = {
    ranking,
    onScore: handleScore,
    headerProps: {
      title: selectedGame.title,
      onBackToMenu,
      onBackToCadastro,
    },
    config: selectedGame.config || {},
  };

  const renderGame = () => {
    const code = selectedGame.code ?? "memory";

    // Normalizar words: converter objetos GameWord para strings
    const normalizeWords = (items) => {
      if (!Array.isArray(items)) return [];
      return items
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            return (
              item.word ??
              item.text ??
              item.value ??
              item.name ??
              item.title ??
              ""
            );
          }
          return "";
        })
        .map((word) => String(word).trim().toUpperCase())
        .filter((word) => word.length > 0);
    };

    const normalizedWords = normalizeWords(gameData?.words);

    switch (code) {
      case "memory":
        return (
          <MemoryGame
            data={{ symbols: gameData?.words || [] }}
            {...commonProps}
          />
        );
      case "hangman":
        return (
          <HangmanGame data={{ words: normalizedWords }} {...commonProps} />
        );
      case "labirinto": {
        const labirintoWordLength = commonProps.config?.labirintoWordLength;
        const filteredWords = labirintoWordLength
          ? normalizedWords.filter(
              (word) => word.length === labirintoWordLength,
            )
          : normalizedWords;
        return (
          <LabirintoGame data={{ words: filteredWords }} {...commonProps} />
        );
      }
      case "quiz":
        return (
          <QuizGame
            data={{ questions: gameData?.questions || [] }}
            {...commonProps}
          />
        );
      case "catch":
        return <CatchGame {...commonProps} />;
      case "whac":
        return (
          <WhacGame
            onPlayAgain={() => window.location.reload()}
            {...commonProps}
          />
        );
      case "wordsearch":
        return (
          <WordSearchGame
            data={{
              words: Array.isArray(gameData?.words)
                ? gameData.words.map((w) =>
                    typeof w === "string" ? w : w.word,
                  )
                : [],
            }}
            {...commonProps}
          />
        );
      case "soletra":
        return <SoletraGame data={{ roundData: gameData }} {...commonProps} />;
      default:
        return <p>Jogo não encontrado: {code}</p>;
    }
  };

  return (
    <>
      {renderGame()}
      {saving && <p>Salvando pontuação...</p>}
    </>
  );
}
export default Jogos;
