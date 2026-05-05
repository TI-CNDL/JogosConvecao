const { sequelize } = require('./backend/models');

(async () => {
  try {
    console.log('Iniciando limpeza profunda da tabela de palavras...');
    
    // Desativa chaves estrangeiras
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    
    // Apaga a tabela com os dois nomes possíveis para garantir
    await sequelize.query('DROP TABLE IF EXISTS `game_words`;');
    await sequelize.query('DROP TABLE IF EXISTS `GameWords`;');
    
    // Sincroniza o banco (isso vai recriar a tabela com as novas regras: word opcional e imageUrl longo)
    await sequelize.sync();
    
    // Reativa chaves estrangeiras
    await sequelize.query('PRAGMA foreign_keys = ON;');
    
    console.log('SUCESSO: Tabela game_words recriada com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('ERRO AO REPARAR BANCO:', err);
    process.exit(1);
  }
})();
