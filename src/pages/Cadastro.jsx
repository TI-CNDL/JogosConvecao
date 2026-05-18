import { useEffect, useState, useRef } from "react";
import { CardForm } from "../components/cardForm/cardForm";
import { getAdminRecords, getPlayer, registerPlayer } from "../lib/appDatabase";

export function Cadastro({
  selectedGame = {},
  onStartChallenge,
  onBackToMenu,
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isKnownPhone, setIsKnownPhone] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Refs para congelar dados da sessão (evita que edições posteriores afetem o placar)
  const lastSessionPhoneRef = useRef("");
  const lastSessionNameRef = useRef("");

  const gameTitle = selectedGame.title ?? "Jogo da Memória";

  // Carregar lista de jogadores
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const records = await getAdminRecords();
        setAllPlayers(Array.isArray(records?.players) ? records.players : []);
        setIsRemoteMode(true);
      } catch {
        setAllPlayers([]);
        setIsRemoteMode(false);
      }
    };
    loadPlayers();
  }, []);

  // Verificar se telefone é conhecido ao digitar
  const handlePhoneChange = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");
    setPhone(digits);

    const knownPlayer = allPlayers.find(
      (p) => String(p.phone ?? "").replace(/\D/g, "") === digits,
    );

    if (knownPlayer) {
      setIsKnownPhone(true);
      setName(knownPlayer.name || "");
    } else {
      setIsKnownPhone(false);
      if (digits.length !== 11) {
        setName("");
      }
    }
  };

  // Buscar jogador no backend ao atingir 11 dígitos (se remoto)
  useEffect(() => {
    if (!isRemoteMode || phone.length < 11) return;

    let active = true;

    const lookupPlayer = async () => {
      try {
        const formatted = formatPhone(phone);
        const playerData = await getPlayer(formatted);
        if (!active) return;

        if (playerData && playerData.name) {
          setIsKnownPhone(true);
          setName(playerData.name);
        }
      } catch (err) {
        // Player não encontrado no backend, mantém estado atual
      }
    };

    lookupPlayer();

    return () => {
      active = false;
    };
  }, [phone, isRemoteMode]);

  const handleNameChange = (value) => {
    setName(value || "");
  };

  const canPlay = phone.length >= 11 && (name || "").trim().length > 0;

  const formatPhone = (digits) => {
    const d = String(digits ?? "")
      .replace(/\D/g, "")
      .slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!canPlay) return;

    const formattedPhone = formatPhone(phone);

    // Registrar jogador no backend se for novo
    if (isRemoteMode && !isKnownPhone) {
      setIsRegistering(true);
      try {
        await registerPlayer(name.trim(), formattedPhone);
      } catch (err) {
        console.error("Erro ao registrar jogador:", err);
        // Continua mesmo se falhar no registro
      } finally {
        setIsRegistering(false);
      }
    }

    // Congela dados para a sessão
    lastSessionPhoneRef.current = formattedPhone;
    lastSessionNameRef.current = name.trim();

    // Chama callback com dados da sessão
    onStartChallenge?.({
      phone: phone,
      name: name.trim(),
    });
  };

  return (
    <section className="CardFormSection">
      <form
        className="formSection"
        id="FormularioDeCadastro"
        onSubmit={handleSubmit}
      >
        <div className="form-wrapper">
          <h2 className="textoTitulo">{gameTitle}</h2>
          <p className="subtituloJogo">
            O participante deve preencher nome e telefone antes de jogar. Assim,
            a pontuação pode ser registrada corretamente no rank.
          </p>

          <input
            type="tel"
            name="numeroTelefone"
            id="numeroTelefone"
            className="inputCardForm"
            placeholder="Telefone"
            pattern="\(\d{2}\) \d{5}-\d{4}"
            title="Digite um telefone no formato (99) 99999-9999"
            value={formatPhone(phone)}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
            disabled={isRegistering}
          />

          {!isKnownPhone && (
            <input
              type="text"
              name="nomeJogador"
              id="nomeJogador"
              className="inputCardForm"
              placeholder="Nome"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              disabled={isRegistering}
            />
          )}

          {isKnownPhone && (
            <p className="subtituloJogo">
              Cadastro encontrado. Bem-vindo de volta, <strong>{name}</strong>.
            </p>
          )}

          {!canPlay && (
            <p className="subtituloJogo" style={{ color: "#ff9800" }}>
              Preencha todos os campos para liberar os jogos.
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              className="botaoComecarDesafio"
              disabled={!canPlay || isRegistering}
            >
              {isRegistering ? "Registrando..." : "Começar o desafio"}
            </button>
            <button
              type="button"
              className="botaoComecarDesafio"
              onClick={onBackToMenu}
              style={{ backgroundColor: "#999" }}
            >
              Voltar ao menu
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default Cadastro;
