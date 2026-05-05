const { GameWord, Game } = require('./models');

async function checkAllWords() {
    try {
        const words = await GameWord.findAll({ include: [Game] });
        console.log('Total words:', words.length);
        words.forEach(w => {
            console.log(`ID: ${w.id}, Game: ${w.Game?.code}, Word: ${w.word}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

checkAllWords();
