import "./rankingTable.style.css";

export default function RankingTable({ ranking = [] }) {
  const formatSeconds = (ms) => {
    if (!ms && ms !== 0) return "-";
    return `${Math.round(ms / 1000)}s`;
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>Top jogadas (últimas 10)</h2>
        </div>
      </div>
      {ranking.length === 0 ? (
        <p className="muted">Jogue para entrar no ranking.</p>
      ) : (
        <div className="table">
          <div className="table-head">
            <span>Nome</span>
            <span>Jogo</span>
            <span>Pontos</span>
            <span>Tempo</span>
          </div>
          {ranking.map((row) => (
            <div key={row.id} className="table-row">
              <span>{row.name}</span>
              <span>{row.game}</span>
              <span>{row.score}</span>
              <span>{formatSeconds(row.elapsedMs)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
