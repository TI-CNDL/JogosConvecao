import "./tabela.styles.css";

export function Tabela({ dados }) {
  return (
    <table className="RankingTabela">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Número</th>
          <th>Pontos</th>
        </tr>
      </thead>
      <tbody>
        {/* Aqui a mágica acontece! O map vai rodar para cada usuário na lista */}
        {dados.map((usuario) => (
          // O React exige essa propriedade 'key' única para não se perder na lista!
          <tr key={usuario.id}>
            <td>{usuario.nome}</td>
            <td>{usuario.numero}</td>
            <td>{usuario.pontos}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
