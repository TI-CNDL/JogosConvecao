module.exports = (sequelize, DataTypes) => {
    const GameWord = sequelize.define('GameWord', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        gameId: { type: DataTypes.INTEGER, allowNull: false },
        word: { type: DataTypes.STRING, allowNull: false },
        imageUrl: { type: DataTypes.STRING, allowNull: true },
        meta: { type: DataTypes.JSON, allowNull: true },
    }, {
        timestamps: true,
        tableName: 'game_words'
    });

    return GameWord;
};