import { CardForm } from "../components/cardForm/cardForm";
import { CardRanking } from "../components/cardRanking/CardRanking";
import { Titulo } from "../components/titulo/Titulo";

export function Ranking() {
  return (
    <CardRanking
      classe="cardRankingSection"
      titulo="Rank Total"
      subtitulo="Aqui é exibida a soma de pontos de todos os jogos que o participante já jogou, formando sua pontuação total no ranking."
    />
  );
}

export default Ranking;
