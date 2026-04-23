import "./playerForm.style.css";

export default function PlayerForm({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  canPlay,
  isKnownPhone = false,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Identificação</p>
          <h2>Informe seu celular</h2>
        </div>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Telefone</span>
          <input
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="(DDD) 99999-9999"
          />
        </label>
        {!isKnownPhone && (
          <label className="field">
            <span>Nome</span>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Seu nome"
            />
          </label>
        )}
      </div>
      {isKnownPhone && (
        <p className="muted">
          Cadastro encontrado. Bem-vindo de volta, {name}.
        </p>
      )}
      {!canPlay && <p className="muted">Preencha para liberar os jogos.</p>}
    </section>
  );
}
