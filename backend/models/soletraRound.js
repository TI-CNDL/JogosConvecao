module.exports = (sequelize, DataTypes) => {
    const SoletraRound = sequelize.define('SoletraRound', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        gameId: { type: DataTypes.INTEGER, allowNull: false },
        word: { type: DataTypes.STRING, allowNull: false },
        hint: { type: DataTypes.STRING, allowNull: true },
    }, {
        timestamps: true,
        tableName: 'soletra_rounds'
    });

    return SoletraRound;
};