# Jogos Convenção

Aplicação web para totem touch com minijogos de convenção em React + Vite.

## Tecnologias

- React 19
- Vite 8
- ESLint 9
- Armazenamento local com localStorage

## Jogos disponíveis

- Jogo da Memória
- Caça-palavras
- Forca
- Quiz
- Labirinto
- Soletra

## Destaques recentes

- Labirinto: tamanho configuravel de grade (4x4, 8x8, 10x10).
- Soletra: modo de 3 palavras-alvo por rodada com colmeia de 7 letras.
- Soletra: sistema de dicas em 2 niveis com penalidade de +10s por uso (aplicada ao tempo final).
- Soletra: validacao focada apenas nas palavras-alvo do round.

## Regras de pontuação

- O ranking usa quantidade de erros.
- Menor número de erros fica na frente.
- Em caso de empate, menor tempo vence.
- Não existe mais sistema de vidas.

## Ranking

- Área principal: Top 1 de cada jogo.
- Dentro de cada jogo: ranking do jogo atual.

## Persistência

O aplicativo salva no localStorage:

- Dados do jogador (nome e telefone)
- Configurações por jogo (tempo, pares, grade e quantidade de perguntas)
- Sessão atual (tela e jogo selecionado)
- Ranking

## Scripts

- npm run dev
- npm run build
- npm run preview
- npm run lint
