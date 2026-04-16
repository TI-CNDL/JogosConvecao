import "./playerForm.style.css";

export default function PlayerForm({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  canPlay,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Identificação</p>
          <h2>Informe nome e telefone</h2>
        </div>
      </div>
      <div className="form-grid">
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
      </div>
      {!canPlay && <p className="muted">Preencha para liberar os jogos.</p>}
    </section>
  );
}
