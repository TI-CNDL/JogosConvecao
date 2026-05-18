import GameNav from "../gameNav/GameNav";
import { Titulo } from "../titulo/Titulo";
import "./headerJogo.styles.css";

export function HeaderJogo({
  title = "",
  subtitle = "",
  time = "00:00",
  points = 0,
  onBackToMenu,
  onBackToCadastro,
}) {
  return (
    <>
      <GameNav
        onBackToMenu={onBackToMenu}
        onBackToCadastro={onBackToCadastro}
      />
      <section className="headerJogoSection">
        <Titulo
          texto={title}
          background={false}
          classe="TituloJogo"
          borda={true}
        />
        <section className="pontoTempoSction">
          <section className="tempoSection">
            <p className="tempo">{time}</p>
          </section>
          <section className="pontuacaoSection">
            <p className="pontuacao">Pontos: {points}</p>
          </section>
        </section>
        <p className="headerJogoSubtitle">{subtitle}</p>
      </section>
    </>
  );
}
