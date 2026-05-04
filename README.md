# Jogos Convenção

Aplicação web para totem touch com minijogos de convenção em React + Vite.

## Tecnologias

- React 19
- Vite 8
- ESLint 9
- Backend Node.js (Express + Sequelize + SQLite)

## Jogos disponíveis

- Jogo da Memória
- Caça-palavras
- Forca
- Quiz
- Labirinto
- Soletra
- Cesta de Ofertas (Catch)
- Omni-Catch (Whac-A-Mole Neon)

## Destaques recentes

- **Omni-Catch (Novo)**: Whac-A-Mole neon com grade 3x3, spawn aleatório de itens, +10 por acerto/-5 por erro, duração 30s, identidade visual neon (#F60085).
- Labirinto: tamanho configuravel de grade (4x4, 8x8, 10x10).
- Soletra: modo de 3 palavras-alvo por rodada com colmeia de 7 letras.
- Soletra: sistema de dicas em 2 niveis com desbloqueio sequencial de palavras.
- Todos os jogos em modo de rounds continuos durante o tempo configurado.
- Cesta de Ofertas: azul +10, vermelho -10, especial coletado +50, especial perdido -50.
- Cadastro phone-first: telefone conhecido reaproveita nome automaticamente.

## Regras de pontuação

- O tempo nao e metrica de ranking.
- Cada rodada concluida vale 100 pontos; rodada parcial vale porcentagem de progresso.
- O ranking e geral por pessoa (acumulado entre jogos).
- Ordenacao: mais pontos primeiro; em empate, menos erros.
- Nao existe sistema de vidas global.

## Ranking

- Area principal: ranking geral consolidado por pessoa.
- Dentro de cada jogo: mini-ranking mostra a classificacao geral acumulada.

## Persistência

O aplicativo persiste dados pela API em SQLite:

- Jogadores por telefone (cadastro/identificação)
- Pontuação por partida e por jogo
- Ranking geral acumulado
- Conteúdo dos jogos (palavras, perguntas e rodadas)

## Scripts

- npm run dev
- npm run build
- npm run preview
- npm run lint
- npm run backend
- npm run fullstack

## Backend local

O comando `npm run backend` sobe a API em `http://localhost:4000`.

Para rodar frontend e backend juntos, use `npm run fullstack`.

Consulte os detalhes do backend em `backend/README.md`.
