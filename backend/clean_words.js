const { GameWord } = require('./models');

async function cleanEmptyWords() {
    try {
        const deleted = await GameWord.destroy({
            where: {
                word: ['', null]
            }
        });
        console.log(`Registros vazios deletados: ${deleted}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanEmptyWords();
