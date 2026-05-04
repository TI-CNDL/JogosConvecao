import "./headerBar.style.css";

export default function HeaderBar({ screen, onBackToCadastro, onBackToMenu }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Painel Touch</p>
        <h1>Jogos da Convenção</h1>
      </div>
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
      {(screen === "identify" || screen === "admin") && (
        <button className="ghost" onClick={onBackToMenu}>
          Voltar ao menu
        </button>
      )}
    </header>
  );
}
