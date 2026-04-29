module.exports = (sequelize, DataTypes) => {
    const GameSetting = sequelize.define('GameSetting', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        gameId: { type: DataTypes.INTEGER, allowNull: false },
        key: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.JSON, allowNull: true },
    }, {
        timestamps: true,
        tableName: 'game_settings'
    });

    return GameSetting;
};