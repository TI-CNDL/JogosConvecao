 const { Player, ScoreEvent, PlayerGameScore } = require('./models');

async function debugDelete(playerId) {
    console.log(`--- Iniciando Debug de Exclusão para Player ID: ${playerId} ---`);
    try {
        const player = await Player.findByPk(playerId);
        if (!player) {
            console.log('Jogador não encontrado.');
            process.exit(0);
        }
        console.log('Jogador encontrado:', player.name, player.phone);

        console.log('1. Tentando excluir ScoreEvents...');
        const seCount = await ScoreEvent.destroy({ where: { playerId } });
        console.log(`   Eventos excluídos: ${seCount}`);

        console.log('2. Tentando excluir PlayerGameScores...');
        const pgsCount = await PlayerGameScore.destroy({ where: { playerId } });
        console.log(`   Pontuações excluídas: ${pgsCount}`);

        console.log('3. Tentando excluir Player...');
        await player.destroy();
        console.log('   Jogador excluído com sucesso!');

        process.exit(0);
    } catch (err) {
        console.error('!!! FALHA NO PROCESSO !!!');
        console.error('Mensagem:', err.message);
        console.error('Nome do Erro:', err.name);
        if (err.parent) {
            console.error('Erro Pai (SQL):', err.parent.message);
        }
        process.exit(1);
    }
}

debugDelete(22);
