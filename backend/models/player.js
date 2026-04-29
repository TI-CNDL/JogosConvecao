module.exports = (sequelize, DataTypes) => {
    const Player = sequelize.define('Player', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: false, unique: true },
        totalPoints: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    }, {
        indexes: [{ unique: true, fields: ['phone'] }],
        timestamps: true,
        tableName: 'players'
    });

    return Player;
};