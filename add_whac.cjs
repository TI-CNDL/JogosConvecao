const { Game } = require('./backend/models');

async function addWhac() {
    try {
        const [game, created] = await Game.findOrCreate({
            where: { code: 'whac' },
            defaults: { name: 'Omni-Catch' }
        });
        if (created) {
            console.log('SUCESSO: Jogo Omni-Catch (whac) adicionado ao banco.');
        } else {
            console.log('AVISO: O jogo whac já existe no banco.');
        }
        process.exit(0);
    } catch (err) {
        console.error('ERRO:', err);
        process.exit(1);
    }
}

addWhac();
