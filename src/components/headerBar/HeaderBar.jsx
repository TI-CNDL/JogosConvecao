import "./headerBar.style.css";

export default function HeaderBar({ screen, onBack }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Painel Touch</p>
        <h1>Jogos da Convenção</h1>
      </div>
      {screen !== "menu" && (
        <button className="ghost" onClick={onBack}>
          Voltar ao cadastro
        </button>
      )}
    </header>
  );
}
