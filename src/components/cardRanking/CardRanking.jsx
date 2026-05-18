import { Tabela } from "../tabela/Tabela";
import { Titulo } from "../titulo/Titulo";
import "./cardRanking.styles.css";

const listaDeUsuarios = [
  { id: 1, nome: "Carlos Dourado", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 2, nome: "Alex Akira", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 3, nome: "Pedro Henrique", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 4, nome: "Pedro Henrique", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 5, nome: "Pedro Henrique", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 6, nome: "Pedro Henrique", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 7, nome: "Pedro Henrique", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 8, nome: "Pedro Henrique", numero: "(61) 9 8442-7417", pontos: 2000 },
  { id: 9, nome: "Pedro Henrique", numero: "(61) 9 8442-7417", pontos: 2000 },
];

export function CardRanking({ classe, titulo, subtitulo }) {
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
      <Tabela dados={listaDeUsuarios} />
    </section>
  );
}
