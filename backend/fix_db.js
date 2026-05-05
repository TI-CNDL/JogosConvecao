const { sequelize } = require('./models');

async function fixSchema() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('game_words');
        
        if (!tableInfo.imageUrl) {
            console.log('Adding imageUrl column to game_words...');
            await queryInterface.addColumn('game_words', 'imageUrl', {
                type: require('sequelize').DataTypes.STRING,
                allowNull: true
            });
            console.log('Column added successfully.');
        } else {
            console.log('imageUrl column already exists.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Failed to fix schema:', err);
        process.exit(1);
    }
}

fixSchema();
