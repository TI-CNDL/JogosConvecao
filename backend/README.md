# Backend - Servidor Express + Sequelize SQLite

Sistema de API REST para gerenciar pontuações e conteúdo de jogos de convenção varejo.

## 📋 Instalação

```bash
npm install
```

## 🚀 Execução

### Modo de Desenvolvimento (com auto-reload via nodemon)
```bash
npm run dev
```

### Modo de Produção
```bash
npm start
```

O servidor roda em `http://localhost:4000` por padrão.

## 🗄️ Banco de Dados

Arquivo SQLite gerado automaticamente: `database.sqlite` (raiz do projeto, fora de /backend)

### Tabelas
- **players**: Jogadores (id, name, phone, totalPoints)
- **games**: Definições de jogos (id, code, name)
- **game_settings**: Configurações por jogo
- **player_game_scores**: Pontuação por jogador/jogo
- **score_events**: Histórico de eventos de pontuação
- **game_words**: Palavras para jogos
- **quiz_questions**: Perguntas de quiz
- **soletra_rounds**: Rodadas de soletra

## 📡 Endpoints

### `POST /api/identify`
Identifica ou cria um jogador por telefone.
```json
{ "phone": "5511999999999" }
```

### `POST /api/register`
Registra/atualiza informações do jogador.
```json
{ "name": "João", "phone": "5511999999999" }
```

### `POST /api/scores`
Registra pontuação e atualiza rankings.
```json
{
  "phone": "5511999999999",
  "gameCode": "hangman",
  "points": 85,
  "remainingSeconds": 45,
  "timedOut": false,
  "meta": {}
}
```

### `GET /api/ranking`
Retorna top 10 jogadores por pontos totais.

### `GET /api/gameContent/:gameCode`
Retorna palavras, perguntas e rounds para um jogo específico.

### `GET /api/health`
Verificação de saúde do servidor.

### `POST /api/admin/reset` (⚠️ Cuidado!)
Limpa e ressemeia o banco de dados.

## 🔐 Regras de Negócio

- **Phone Único**: Campo `phone` em `players` é único e indexado
- **Pontuação**: 
  - Pontos base: 0-100% por round
  - Bônus de tempo: `remainingSeconds * 5` (se não timedOut)
  - Agregação: Soma em `player.totalPoints` e `player_game_scores.points`
- **CORS**: Configurado para aceitar requisições de `http://localhost:5173` (frontend Vite)

## 🌱 Seeding Automático

Na primeira execução, o servidor popula automaticamente as tabelas de conteúdo com:
- Palavras: LOGISTICA, SKU, PIX, ENTREGA, INVENTARIO, etc.
- Perguntas de quiz sobre logística e varejo
- Exemplos de soletra

## 📝 Logging

Sequelize logging está desativado para evitar spam. Para habilitar:
```javascript
// em models/index.js, mude:
logging: false → logging: console.log
```

## 🛠️ Desenvolvimento

Estrutura:
```
backend/
├── server.js           # Servidor principal
├── models/
│   ├── index.js        # Inicialização de modelos
│   ├── player.js
│   ├── game.js
│   ├── playerGameScore.js
│   ├── scoreEvent.js
│   ├── gameWord.js
│   ├── quizQuestion.js
│   └── soletraRound.js
├── package.json
└── database.sqlite     (gerado automaticamente)
```

## 📦 Dependências

- **express**: Framework web
- **sequelize**: ORM SQL
- **sqlite3**: Driver SQLite
- **cors**: Cross-Origin Resource Sharing
- **nodemon** (dev): Auto-reload em desenvolvimento

## 💡 Próximos Passos

- Implementar autenticação/validação
- Adicionar endpoints de admin para gerenciar conteúdo
- Implementar paginação em `/api/ranking`
- Adicionar logs estruturados (Winston, etc.)
- Testes automatizados
