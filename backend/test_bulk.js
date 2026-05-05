const { Game, GameWord } = require('./models');

async function testBulkInsert() {
    try {
        const game = await Game.findOne({ where: { code: 'hangman' } });
        if (!game) {
            console.error('Jogo hangman não encontrado');
            process.exit(1);
        }

        const rawList = "CLIENTE, OFERTA, VITRINE, DESCONTO, PROMOÇÃO, VENDEDOR, ESTOQUE, QUALIDADE, ATENDIMENTO, COMÉRCIO, COMPRA, VENDA, PARAÍBA, CULTURA, TURISMO, INOVAÇÃO, FUTURO, TECNOLOGIA, DIGITAL, LOJA, NOTA, PAGO, CABO, MODA, LOGO, CAIXA, SALDO, LUCRO, VENDA, VALOR";
        const words = rawList.split(',').map(w => w.trim()).filter(w => w);
        
        console.log(`Iniciando inserção de ${words.length} palavras...`);
        
        for (const w of words) {
            await GameWord.create({
                gameId: game.id,
                word: w
            });
        }
        
        console.log('Sucesso! Todas as palavras foram inseridas.');
        process.exit(0);
    } catch (err) {
        console.error('ERRO NA INSERÇÃO:', err.message);
        process.exit(1);
    }
}

testBulkInsert();
