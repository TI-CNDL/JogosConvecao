const express = require('express');
const cors = require('cors');
const { sequelize, Player, Game, GameWord, QuizQuestion, SoletraRound, PlayerGameScore, ScoreEvent } = require('./models');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));

async function seedIfNeeded() {
    const gamesCount = await Game.count();
    if (gamesCount > 0) return;

    console.log('Seeding database with sample games and content...');

    const gameDefs = [
        { code: 'hangman', name: 'Hangman' },
        { code: 'wordsearch', name: 'Word Search' },
        { code: 'soletra', name: 'Soletra' },
        { code: 'quiz', name: 'Quiz' },
        { code: 'memory', name: 'Memory' },
        { code: 'labirinto', name: 'Labirinto' },
    ];

    const created = {};
    for (const g of gameDefs) {
        const gmodel = await Game.create({ code: g.code, name: g.name });
        created[g.code] = gmodel;
    }

    const words = ['LOGISTICA', 'SKU', 'PIX', 'ENTREGA', 'INVENTARIO', 'BARRAS', 'ETIQUETA', 'FRETE', 'PDV', 'SCAN'];
    for (const w of words) {
        await GameWord.create({ gameId: created.wordsearch.id, word: w });
    }

    const hangmanWords = ['PLATAFORMA', 'ARMAZENAGEM', 'LOGISTICA', 'TRANSPORTE', 'CAIXA'];
    for (const w of hangmanWords) {
        await GameWord.create({ gameId: created.hangman.id, word: w });
    }

    const memoryWords = ['ESTOQUE', 'PALETE', 'EMPILHADEIRA', 'CAMINHAO', 'GALPAO', 'CAIXA', 'CARRINHO', 'CODIGO'];
    for (const w of memoryWords) {
        await GameWord.create({ gameId: created.memory.id, word: w });
    }

    const labirintoWords = ['SAIDA', 'ROTA', 'CAMINHO', 'MAPA', 'DESTINO'];
    for (const w of labirintoWords) {
        await GameWord.create({ gameId: created.labirinto.id, word: w });
    }

    const soletraWords = [
        { word: 'LOGISTICA', hint: 'Movimentação e gestão de produtos' },
        { word: 'INVENTARIO', hint: 'Registro dos itens em estoque' },
        { word: 'ENTREGA', hint: 'Processo de enviar ao cliente' },
    ];
    for (const s of soletraWords) {
        await SoletraRound.create({ gameId: created.soletra.id, word: s.word, hint: s.hint });
    }

    const quizQs = [
        { question: 'O que é SKU?', options: ['Stock Keeping Unit', 'Sistema de K Pis', 'Serviço de Entrega', 'Tipo de Frete'], answer: 'Stock Keeping Unit' },
        { question: 'O que significa PDV?', options: ['Ponto de Venda', 'Produto de Valor', 'Prazo de Venda', 'Pagamento Digital'], answer: 'Ponto de Venda' },
    ];
    for (const q of quizQs) {
        await QuizQuestion.create({ gameId: created.quiz.id, question: q.question, options: q.options, answer: q.answer });
    }

    console.log('Seeding complete');
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/identify', async (req, res) => {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    let player = await Player.findOne({ where: { phone } });
    if (!player) {
        player = await Player.create({ phone, name: null });
    }

    res.json(player);
});

app.post('/api/register', async (req, res) => {
    const { phone, name } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });
    const [player, created] = await Player.findOrCreate({ where: { phone }, defaults: { name } });
    if (!created) {
        player.name = name || player.name;
        await player.save();
    }
    res.json(player);
});

app.post('/api/scores', async (req, res) => {
    const { phone, gameCode, points, remainingSeconds = 0, timedOut = false, meta = {} } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });
    if (typeof points !== 'number') return res.status(400).json({ error: 'points required' });

    let player = await Player.findOne({ where: { phone } });
    if (!player) {
        player = await Player.create({ phone, name: null });
    }

    const game = await Game.findOne({ where: { code: gameCode } });
    const gameId = game ? game.id : null;

    const timeBonus = timedOut ? 0 : Math.max(0, Math.floor(remainingSeconds) * 5);
    const addedPoints = Math.max(0, Math.round(points)) + timeBonus;

    // record event
    await ScoreEvent.create({ playerId: player.id, gameId, points: Math.round(points), timeBonus, meta });

    // update per-game aggregate
    if (gameId) {
        const [pgs] = await PlayerGameScore.findOrCreate({ where: { playerId: player.id, gameId }, defaults: { points: addedPoints, lastPlayedAt: new Date() } });
        if (pgs) {
            if (pgs.id) {
                pgs.points = (pgs.points || 0) + addedPoints;
                pgs.lastPlayedAt = new Date();
                await pgs.save();
            }
        }
    }

    // update player total
    player.totalPoints = (player.totalPoints || 0) + addedPoints;
    await player.save();

    // return updated player summary
    const top = await Player.findAll({ order: [['totalPoints', 'DESC']], limit: 10 });
    res.json({ player, top10: top });
});

app.get('/api/ranking', async (req, res) => {
    const top = await Player.findAll({ order: [['totalPoints', 'DESC']], limit: 10 });
    res.json(top);
});

app.get('/api/gameContent/:gameCode', async (req, res) => {
    const { gameCode } = req.params;
    const game = await Game.findOne({ where: { code: gameCode } });
    if (!game) return res.status(404).json({ error: 'game not found' });

    const words = await GameWord.findAll({ where: { gameId: game.id } });
    const quiz = await QuizQuestion.findAll({ where: { gameId: game.id } });
    const rounds = await SoletraRound.findAll({ where: { gameId: game.id } });

    res.json({ game: { id: game.id, code: game.code, name: game.name }, words, quiz, rounds });
});

// optional admin endpoint to reset db (careful)
app.post('/api/admin/reset', async (req, res) => {
    try {
        await sequelize.drop();
        await sequelize.sync({ force: true });
        await seedIfNeeded();
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'failed' });
    }
});

(async () => {
    try {
        await sequelize.sync();
        await seedIfNeeded();

        app.listen(PORT, () => {
            console.log(`Backend listening on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
})();