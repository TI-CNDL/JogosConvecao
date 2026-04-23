import "./rankingTable.style.css";

export default function RankingTable({ ranking = [] }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>Ranking geral por pessoa</h2>
        </div>
      </div>
      {ranking.length === 0 ? (
        <p className="muted">Jogue para entrar no ranking.</p>
      ) : (
        <div className="table">
          <div className="table-head">
            <span>Nome</span>
            <span>Telefone</span>
            <span>Pontos</span>
            <span>Erros</span>
          </div>
          {ranking.map((row) => (
            <div key={row.id} className="table-row">
              <span>{row.name}</span>
              <span>{row.phone}</span>
              <span>{row.totalPoints ?? 0}</span>
              <span>{row.totalErrors ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
