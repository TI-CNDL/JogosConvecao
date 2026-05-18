import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Jogos from "./pages/Jogos.jsx";
import Ranking from "./pages/Ranking.jsx";
import AdminHub from "./components/adminHub/AdminHubV2.jsx";
import HeaderBar from "./components/headerBar/HeaderBar.jsx";

/**
 * COMPONENTE RAIZ (App)
 * Responsável APENAS por:
 * - Gerenciar estado de navegação entre telas
 * - Manter dados do jogador (name, phone) e jogo selecionado
 * - Renderizar a página/Page apropriada
 *
 * TODA lógica de negócio é distribuída entre as Pages:
 * - Home.jsx: Carrega configs, settings, rankings
 * - Cadastro.jsx: Busca de jogador, validação, início de jogo
 * - Jogos.jsx: Carregamento de conteúdo do jogo, scoring
 * - Ranking.jsx: Carregamento e exibição de ranking
 */
export function App() {
  // Estado de navegação
  const [sectionId, setSectionId] = useState(() => {
    const saved = localStorage.getItem("app_screen");
    return saved || "menu";
  });

  // Dados do jogador ativo (preenchidos em Cadastro, usados em Jogos)
  const [player, setPlayer] = useState({
    name: "",
    phone: "",
  });

  // Jogo selecionado no menu (preenchido em Home, usado em Cadastro/Jogos)
  const [selectedGame, setSelectedGame] = useState(() => {
    const saved = localStorage.getItem("app_selectedGame");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback para valor antigo armazenado como string simples
      return null;
    }
  });

  // Persistir estado de navegação
  useEffect(() => {
    localStorage.setItem("app_screen", sectionId);
  }, [sectionId]);

  // Persistir jogo selecionado
  useEffect(() => {
    if (selectedGame) {
      localStorage.setItem("app_selectedGame", JSON.stringify(selectedGame));
    } else {
      localStorage.removeItem("app_selectedGame");
    }
  }, [selectedGame]);

  // Limpar valores antigos inválidos do localStorage na primeira montagem
  useEffect(() => {
    try {
      const old = localStorage.getItem("app_selectedGame");
      if (old && !old.startsWith("{")) {
        // Valor antigo em formato inválido, remove
        localStorage.removeItem("app_selectedGame");
      }
    } catch {}
  }, []);

  // ========== Funções de Navegação ==========

  const goToMenu = () => {
    const confirmed = window.confirm(
      "Deseja realmente voltar ao menu principal? O jogo atual será encerrado.",
    );
    if (!confirmed) return;
    setSectionId("menu");
    setSelectedGame(null);
    setPlayer({ name: "", phone: "" });
  };

  const goToCadastro = (gamePayload) => {
    // Home passa { code, title, config }
    setSelectedGame(gamePayload);
    setPlayer({ name: "", phone: "" }); // Limpa dados anteriores
    setSectionId("cadastro");
  };

  const goToJogos = (playerPayload) => {
    // Cadastro passa { name, phone }
    setPlayer(playerPayload);
    setSectionId("jogos");
  };

  const goToRanking = () => {
    setSectionId("ranking");
  };

  const goToAdmin = () => {
    setSectionId("admin");
  };

  // ========== Render ==========

  const showHeaderBar =
    sectionId !== "jogos" && sectionId !== "admin" && sectionId !== "menu";

  return (
    <div className="app-shell">
      {showHeaderBar && <HeaderBar onBackToMenu={goToMenu} />}

      {sectionId === "menu" && (
        <Home onSelectGame={goToCadastro} onOpenAdmin={goToAdmin} />
      )}

      {sectionId === "cadastro" && (
        <section className="game-area">
          <Cadastro
            selectedGame={selectedGame}
            onStartChallenge={goToJogos}
            onBackToMenu={goToMenu}
          />
        </section>
      )}

      {sectionId === "jogos" && (
        <Jogos
          player={player}
          selectedGame={selectedGame}
          onBackToMenu={goToMenu}
          onBackToCadastro={() => setSectionId("cadastro")}
        />
      )}

      {sectionId === "ranking" && (
        <section className="game-area">
          <Ranking onBackToMenu={goToMenu} />
        </section>
      )}

      {sectionId === "admin" && (
        <section className="game-area">
          <AdminHub onBackToMenu={goToMenu} />
        </section>
      )}
    </div>
  );
}

export default App;
