module.exports = (sequelize, DataTypes) => {
    const Game = sequelize.define('Game', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        code: { type: DataTypes.STRING, allowNull: false, unique: true },
        name: { type: DataTypes.STRING, allowNull: false },
        metadata: { type: DataTypes.JSON, allowNull: true },
    }, {
        timestamps: true,
        tableName: 'games'
    });

    return Game;
};