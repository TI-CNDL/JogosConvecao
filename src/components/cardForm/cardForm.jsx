import { useState, useEffect } from "react";
import { Button } from "../componentsTag/button";
import { Titulo } from "../titulo/Titulo";
import { getAdminRecords } from "../../lib/appDatabase";
import "./cardMenu.styles.css";

export function CardForm({ classe, titulo, subtitulo, onStartChallenge }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isKnownPhone, setIsKnownPhone] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  const maskPhone = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "").slice(0, 11);

    if (!digits) return "";

    const ddd = digits.slice(0, 2);
    const firstPart = digits.slice(2, 7);
    const secondPart = digits.slice(7, 11);

    if (digits.length <= 2) {
      return `(${ddd}`;
    }

    if (digits.length <= 7) {
      return `(${ddd}) ${firstPart}`;
    }

    return `(${ddd}) ${firstPart}-${secondPart}`;
  };

  const normalizePhone = (value) => String(value ?? "").replace(/\D/g, "");

  // Carrega lista de jogadores ao montar
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const records = await getAdminRecords();
        setAllPlayers(Array.isArray(records?.players) ? records.players : []);
      } catch {
        setAllPlayers([]);
      }
    };
    loadPlayers();
  }, []);

  // Verifica se telefone é conhecido
  const handlePhoneChange = (value) => {
    const maskedPhone = maskPhone(value);
    setPhone(maskedPhone);
    const knownPlayer = allPlayers.find(
      (p) => normalizePhone(p.phone) === normalizePhone(value),
    );
    if (knownPlayer) {
      setIsKnownPhone(true);
      setName(knownPlayer.name || "");
    } else {
      setIsKnownPhone(false);
      setName("");
    }
  };

  const handleNameChange = (value) => {
    setName(value || "");
  };

  const canPlay = (phone || "").trim() !== "" && (name || "").trim() !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canPlay) {
      onStartChallenge?.({
        phone: normalizePhone(phone),
        name: name.trim(),
      });
    }
  };

  return (
    <section className={classe}>
      <Titulo
        texto={titulo}
        classe="textoTitulo"
        classeSection="titulo-section"
        botao={false}
        background={false}
      />
      <p className="subtituloJogo">{subtitulo}</p>
      <form
        className="formSection"
        id="FormularioDeCadastro"
        onSubmit={handleSubmit}
      >
        <input
          type="tel"
          name="numeroTelefone"
          id="numeroTelefone"
          className="inputCardForm"
          placeholder="Telefone"
          pattern="\(\d{2}\) \d{5}-\d{4}"
          title="Digite um telefone no formato (99) 99999-9999"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          required
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
          />
        )}
        {isKnownPhone && (
          <p className="subtituloJogo">
            Cadastro encontrado. Bem-vindo de volta, {name}.
          </p>
        )}
        {!canPlay && (
          <p className="subtituloJogo">Preencha para liberar os jogos.</p>
        )}
        <Button
          type="submit"
          classe="botaoComecarDesafio"
          texto="Começar o desafio"
          classeTexto="textoBotaoComecarDesafio"
          disabled={!canPlay}
        />
      </form>
    </section>
  );
}
