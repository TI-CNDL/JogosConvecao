import { CardForm } from "../components/cardForm/cardForm";

export function Cadastro({ selectedGame = {}, onStartChallenge }) {
  const gameTitle = selectedGame.title ?? "Jogo da Memória";
  return (
    <CardForm
      classe="CardFormSection"
      titulo={gameTitle}
      subtitulo="O participante deve preencher nome e telefone antes de jogar. Assim, a pontuação pode ser registrada corretamente no rank."
      onStartChallenge={onStartChallenge}
    />
  );
}

export default Cadastro;
