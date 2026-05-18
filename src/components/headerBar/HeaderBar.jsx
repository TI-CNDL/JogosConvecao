import "./headerBar.style.css";

/**
 * COMPONENTE BARRA DE NAVEGAÇÃO SUPERIOR (HeaderBar.jsx)
 * Responsável por renderizar o cabeçalho global da aplicação, exibindo o título
 * do painel e os botões de navegação contextual baseados na tela atual (`screen`).
 *
 * @param {Object} props - Propriedades recebidas do componente orquestrador (App).
 * @param {string} props.screen - Tela ativa no momento (ex: "menu", "identify", "play", "admin").
 * @param {Function} props.onBackToCadastro - Callback acionada ao clicar em "Voltar ao cadastro" (disponível na tela de jogo).
 * @param {Function} props.onBackToMenu - Callback acionada ao clicar em "Voltar ao menu".
 */
export default function HeaderBar({ screen, onBackToCadastro, onBackToMenu }) {
  return (
    // Contêiner principal do cabeçalho superior (topbar)
    <header className="topbar">
      
      {/* TÍTULO E SUBTÍTULO DA APLICAÇÃO */}
      <div>
        <p className="eyebrow">Painel Touch</p>
        <h1>Jogos da Convenção</h1>
      </div>

      {/* AÇÕES DA TELA DE JOGO ('play'): Permite voltar para a tela de identificação ou para o menu principal */}
      {screen === "play" && (
        <div className="topbar-actions">
          <button className="ghost" onClick={onBackToCadastro}>
            Voltar ao cadastro
          </button>
          <button className="ghost" onClick={onBackToMenu}>
            Voltar ao menu
          </button>
        </div>
      )}

      {/* AÇÕES DA TELA DE IDENTIFICAÇÃO OU ADMINISTRAÇÃO: Permite retornar ao menu principal */}
      {(screen === "identify" || screen === "admin") && (
        <button className="ghost" onClick={onBackToMenu}>
          Voltar ao menu
        </button>
      )}
    </header>
  );
}
