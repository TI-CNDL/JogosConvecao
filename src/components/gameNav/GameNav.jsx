import { useState } from "react";
import "./gameNav.style.css";

export function GameNav({ onBackToMenu, onBackToCadastro }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`game-nav ${open ? "open" : ""}`}>
      <button
        className="game-nav-toggle"
        onClick={() => setOpen((s) => !s)}
        aria-label={open ? "Fechar navegação" : "Abrir navegação"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#F60085" />
        </svg>
      </button>

      <div className="game-nav-panel" role="menu">
        <button
          className="nav-btn"
          title="Voltar ao menu"
          onClick={() => {
            setOpen(false);
            onBackToMenu?.();
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z"
              fill="#fff"
            />
          </svg>
        </button>

        <button
          className="nav-btn"
          title="Voltar ao cadastro"
          onClick={() => {
            setOpen(false);
            onBackToCadastro?.();
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H20v-2z"
              fill="#fff"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default GameNav;
