const { GameWord, Game } = require('./models');

async function testQuery() {
    try {
        const game = await Game.findOne({ where: { code: 'memory' } });
        if (!game) {
            console.log('Memory game not found');
            process.exit(1);
        }
        console.log('Game found:', game.id);
        const words = await GameWord.findAll({ where: { gameId: game.id } });
        console.log('Words found:', words.length);
        if (words.length > 0) {
            console.log('First word:', JSON.stringify(words[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error('QUERY FAILED:', err);
        process.exit(1);
    }
}

testQuery();
