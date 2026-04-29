module.exports = (sequelize, DataTypes) => {
    const ScoreEvent = sequelize.define('ScoreEvent', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        playerId: { type: DataTypes.INTEGER, allowNull: false },
        gameId: { type: DataTypes.INTEGER, allowNull: true },
        points: { type: DataTypes.INTEGER, allowNull: false },
        timeBonus: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        meta: { type: DataTypes.JSON, allowNull: true },
    }, {
        timestamps: true,
        tableName: 'score_events'
    });

    return ScoreEvent;
};