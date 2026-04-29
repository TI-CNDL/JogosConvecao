module.exports = (sequelize, DataTypes) => {
    const QuizQuestion = sequelize.define('QuizQuestion', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        gameId: { type: DataTypes.INTEGER, allowNull: false },
        question: { type: DataTypes.STRING, allowNull: false },
        options: { type: DataTypes.JSON, allowNull: true },
        answer: { type: DataTypes.STRING, allowNull: true },
    }, {
        timestamps: true,
        tableName: 'quiz_questions'
    });

    return QuizQuestion;
};