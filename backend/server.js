const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sequelize, Player, Game, GameWord, QuizQuestion, SoletraRound, PlayerGameScore, ScoreEvent, GameSetting } = require('./models');

const app = express();
const PORT = process.env.PORT || 4000;

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'public', 'images');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${timestamp}-${name}${ext}`);
    }
});
const upload = multer({ storage });

const adminResourceConfig = {
    players: {
        model: Player,
        include: [],
        attributes: ['name', 'phone', 'totalPoints'],
        parse: (body) => ({
            name: body.name ?? null,
            phone: String(body.phone ?? '').trim(),
            totalPoints: Number.isFinite(Number(body.totalPoints)) ? Number(body.totalPoints) : 0,
        }),
    },
    games: {
        model: Game,
        include: [],
        attributes: ['code', 'name', 'metadata'],
        parse: (body) => ({
            code: String(body.code ?? '').trim(),
            name: String(body.name ?? '').trim(),
            metadata: body.metadata ?? null,
        }),
    },
    words: {
        model: GameWord,
        include: [{ model: Game, attributes: ['id', 'code', 'name'] }],
        attributes: ['gameId', 'word', 'imageUrl', 'meta'],
        parse: (body) => ({
            gameId: Number(body.gameId),
            word: String(body.word ?? '').trim(),
            imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
            meta: body.meta ?? null,
        }),
    },
    quizQuestions: {
        model: QuizQuestion,
        include: [{ model: Game, attributes: ['id', 'code', 'name'] }],
        attributes: ['gameId', 'question', 'options', 'answer'],
        parse: (body) => ({
            gameId: Number(body.gameId),
            question: String(body.question ?? '').trim(),
            options: body.options ?? null,
            answer: body.answer ?? null,
        }),
    },
    soletraRounds: {
        model: SoletraRound,
        include: [{ model: Game, attributes: ['id', 'code', 'name'] }],
        attributes: ['gameId', 'word', 'hint'],
        parse: (body) => ({
            gameId: Number(body.gameId),
            word: String(body.word ?? '').trim(),
            hint: body.hint ?? null,
        }),
    },
    playerGameScores: {
        model: PlayerGameScore,
        include: [
            { model: Player, attributes: ['id', 'name', 'phone'] },
            { model: Game, attributes: ['id', 'code', 'name'] },
        ],
        attributes: ['playerId', 'gameId', 'points', 'lastPlayedAt'],
        parse: (body) => ({
            playerId: Number(body.playerId),
            gameId: Number(body.gameId),
            points: Number.isFinite(Number(body.points)) ? Number(body.points) : 0,
            lastPlayedAt: body.lastPlayedAt ? new Date(body.lastPlayedAt) : null,
        }),
    },
    scoreEvents: {
        model: ScoreEvent,
        include: [
            { model: Player, attributes: ['id', 'name', 'phone'] },
            { model: Game, attributes: ['id', 'code', 'name'] },
        ],
        attributes: ['playerId', 'gameId', 'points', 'timeBonus', 'meta'],
        parse: (body) => ({
            playerId: Number(body.playerId),
            gameId: body.gameId ? Number(body.gameId) : null,
            points: Number.isFinite(Number(body.points)) ? Number(body.points) : 0,
            timeBonus: Number.isFinite(Number(body.timeBonus)) ? Number(body.timeBonus) : 0,
            meta: body.meta ?? null,
        }),
    },
    gameSettings: {
        model: GameSetting,
        include: [{ model: Game, attributes: ['id', 'code', 'name'] }],
        attributes: ['gameId', 'key', 'value'],
        parse: (body) => ({
            gameId: Number(body.gameId),
            key: String(body.key ?? '').trim(),
            value: body.value ?? null,
        }),
    },
};

const getAdminResourceConfig = (resource) => adminResourceConfig[resource] ?? null;

const jsonOrNull = (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return null;
        try {
            return JSON.parse(trimmed);
        } catch {
            return value;
        }
    }
    return value;
};

const normalizeAdminPayload = (resource, body) => {
    const config = getAdminResourceConfig(resource);
    if (!config) return null;

    const parsed = config.parse(body || {});
    const payload = { ...parsed };

    if ('metadata' in payload) payload.metadata = jsonOrNull(payload.metadata);
    if ('meta' in payload) payload.meta = jsonOrNull(payload.meta);
    if ('options' in payload) payload.options = jsonOrNull(payload.options);
    if ('value' in payload) payload.value = jsonOrNull(payload.value);

    return payload;
};

const ensureAdminResource = (req, res) => {
    const { resource } = req.params;
    const config = getAdminResourceConfig(resource);
    if (!config) {
        res.status(404).json({ error: 'resource not found' });
        return null;
    }
    return config;
};

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));

async function seedIfNeeded() {
    const gamesCount = await Game.count();
    const wordsCount = await GameWord.count();
    if (gamesCount > 0 && wordsCount > 0) return;

    console.log('Seeding database with sample games and content...');

    // Clear existing to avoid partial duplicates if only words were missing
    if (gamesCount > 0) {
        await GameWord.destroy({ where: {} });
        await QuizQuestion.destroy({ where: {} });
        await SoletraRound.destroy({ where: {} });
    } else {
        const gameDefs = [
            { code: 'hangman', name: 'Hangman' },
            { code: 'wordsearch', name: 'Word Search' },
            { code: 'soletra', name: 'Soletra' },
            { code: 'quiz', name: 'Quiz' },
            { code: 'memory', name: 'Memory' },
            { code: 'labirinto', name: 'Labirinto' },
        ];
        for (const g of gameDefs) {
            await Game.findOrCreate({ where: { code: g.code }, defaults: { name: g.name } });
        }
    }

    const createdList = await Game.findAll();
    const created = {};
    createdList.forEach(g => { created[g.code] = g; });

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

app.get('/api/admin/records', async (req, res) => {
    try {
        const [players, games, gameWords, quizQuestions, soletraRounds, playerGameScores, scoreEvents, gameSettings] = await Promise.all([
            Player.findAll({ order: [['id', 'ASC']] }),
            Game.findAll({ order: [['id', 'ASC']] }),
            GameWord.findAll({ include: [{ model: Game, attributes: ['id', 'code', 'name'] }], order: [['id', 'ASC']] }),
            QuizQuestion.findAll({ include: [{ model: Game, attributes: ['id', 'code', 'name'] }], order: [['id', 'ASC']] }),
            SoletraRound.findAll({ include: [{ model: Game, attributes: ['id', 'code', 'name'] }], order: [['id', 'ASC']] }),
            PlayerGameScore.findAll({ include: [{ model: Player, attributes: ['id', 'name', 'phone'] }, { model: Game, attributes: ['id', 'code', 'name'] }], order: [['id', 'ASC']] }),
            ScoreEvent.findAll({ include: [{ model: Player, attributes: ['id', 'name', 'phone'] }, { model: Game, attributes: ['id', 'code', 'name'] }], order: [['id', 'ASC']] }),
            GameSetting.findAll({ include: [{ model: Game, attributes: ['id', 'code', 'name'] }], order: [['id', 'ASC']] }),
        ]);

        const plain = (rows) => rows.map((row) => row.get({ plain: true }));

        res.json({
            counts: {
                players: players.length,
                games: games.length,
                words: gameWords.length,
                quizQuestions: quizQuestions.length,
                soletraRounds: soletraRounds.length,
                playerGameScores: playerGameScores.length,
                scoreEvents: scoreEvents.length,
                gameSettings: gameSettings.length,
            },
            players: plain(players),
            games: plain(games),
            words: plain(gameWords),
            quizQuestions: plain(quizQuestions),
            soletraRounds: plain(soletraRounds),
            playerGameScores: plain(playerGameScores),
            scoreEvents: plain(scoreEvents),
            gameSettings: plain(gameSettings),
        });
    } catch (err) {
        console.error('Failed to load admin records', err);
        return res.status(500).json({ error: 'failed to load admin records' });
    }
});

app.post('/api/admin/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename, url: `/images/${req.file.filename}` });
});

app.post('/api/admin/:resource', async (req, res) => {
    try {
        const config = ensureAdminResource(req, res);
        if (!config) return;

        const payload = normalizeAdminPayload(req.params.resource, req.body);
        if (!payload) {
            return res.status(400).json({ error: 'invalid payload' });
        }

        if (req.params.resource === 'playerGameScores' && payload.lastPlayedAt === null) {
            payload.lastPlayedAt = new Date();
        }

        if (req.params.resource === 'scoreEvents' && payload.meta === undefined) {
            payload.meta = {};
        }

        const created = await config.model.create(payload);
        const withInclude = await config.model.findByPk(created.id, { include: config.include });
        return res.json(withInclude ? withInclude.get({ plain: true }) : created.get({ plain: true }));
    } catch (err) {
        console.error('Failed to create admin record', err);
        return res.status(500).json({ error: 'failed to create record' });
    }
});

app.put('/api/admin/:resource/:id', async (req, res) => {
    try {
        const config = ensureAdminResource(req, res);
        if (!config) return;

        const record = await config.model.findByPk(req.params.id);
        if (!record) {
            return res.status(404).json({ error: 'record not found' });
        }

        const payload = normalizeAdminPayload(req.params.resource, req.body);
        if (!payload) {
            return res.status(400).json({ error: 'invalid payload' });
        }

        await record.update(payload);
        const updated = await config.model.findByPk(record.id, { include: config.include });
        return res.json(updated ? updated.get({ plain: true }) : record.get({ plain: true }));
    } catch (err) {
        console.error('Failed to update admin record', err);
        return res.status(500).json({ error: 'failed to update record' });
    }
});

app.delete('/api/admin/:resource/:id', async (req, res) => {
    try {
        const config = ensureAdminResource(req, res);
        if (!config) return;

        const record = await config.model.findByPk(req.params.id);
        if (!record) {
            return res.status(404).json({ error: 'record not found' });
        }

        if (req.params.resource === 'players') {
            await ScoreEvent.destroy({ where: { playerId: req.params.id } });
            await PlayerGameScore.destroy({ where: { playerId: req.params.id } });
        }

        await record.destroy();
        return res.json({ ok: true });
    } catch (err) {
        console.error('Failed to delete admin record', err);
        return res.status(500).json({ 
            error: 'failed to delete record', 
            details: err.message,
            stack: err.stack 
        });
    }
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

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: err.message });
});