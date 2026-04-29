module.exports = (sequelize, DataTypes) => {
    const PlayerGameScore = sequelize.define('PlayerGameScore', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        playerId: { type: DataTypes.INTEGER, allowNull: false },
        gameId: { type: DataTypes.INTEGER, allowNull: false },
        points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        lastPlayedAt: { type: DataTypes.DATE, allowNull: true },
    }, {
        timestamps: true,
        tableName: 'player_game_scores',
        indexes: [{ fields: ['playerId', 'gameId'] }]
    });

    return PlayerGameScore;
};