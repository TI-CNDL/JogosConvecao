const { GameWord, Game } = require('./models');

async function inspectWords() {
    try {
        const words = await GameWord.findAll({ include: [Game] });
        console.log(`Total de palavras: ${words.length}`);
        words.forEach(w => {
            console.log(`ID: ${w.id} | Jogo: ${w.Game?.code} | Palavra: "${w.word}" | Tamanho: ${w.word?.length} | Imagem: ${w.imageUrl}`);
            if (w.word) {
                for (let i = 0; i < w.word.length; i++) {
                    console.log(`  Char at ${i}: ${w.word.charCodeAt(i)}`);
                }
            }
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectWords();
