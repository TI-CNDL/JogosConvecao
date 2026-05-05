const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
});

const Player = require('./player')(sequelize, DataTypes);
const Game = require('./game')(sequelize, DataTypes);
const GameSetting = require('./gameSetting')(sequelize, DataTypes);
const PlayerGameScore = require('./playerGameScore')(sequelize, DataTypes);
const ScoreEvent = require('./scoreEvent')(sequelize, DataTypes);
const GameWord = require('./gameWord')(sequelize, DataTypes);
const QuizQuestion = require('./quizQuestion')(sequelize, DataTypes);
const SoletraRound = require('./soletraRound')(sequelize, DataTypes);

// Associations
Player.hasMany(ScoreEvent, { foreignKey: 'playerId', onDelete: 'CASCADE' });
ScoreEvent.belongsTo(Player, { foreignKey: 'playerId' });

Player.hasMany(PlayerGameScore, { foreignKey: 'playerId', onDelete: 'CASCADE' });
PlayerGameScore.belongsTo(Player, { foreignKey: 'playerId' });

Game.hasMany(ScoreEvent, { foreignKey: 'gameId' });
ScoreEvent.belongsTo(Game, { foreignKey: 'gameId' });

Game.hasMany(PlayerGameScore, { foreignKey: 'gameId' });
PlayerGameScore.belongsTo(Game, { foreignKey: 'gameId' });

Player.belongsToMany(Game, { through: PlayerGameScore, foreignKey: 'playerId', otherKey: 'gameId' });
Game.belongsToMany(Player, { through: PlayerGameScore, foreignKey: 'gameId', otherKey: 'playerId' });

Game.hasMany(GameWord, { foreignKey: 'gameId' });
GameWord.belongsTo(Game, { foreignKey: 'gameId' });

Game.hasMany(QuizQuestion, { foreignKey: 'gameId' });
QuizQuestion.belongsTo(Game, { foreignKey: 'gameId' });

Game.hasMany(SoletraRound, { foreignKey: 'gameId' });
SoletraRound.belongsTo(Game, { foreignKey: 'gameId' });

Game.hasMany(GameSetting, { foreignKey: 'gameId' });
GameSetting.belongsTo(Game, { foreignKey: 'gameId' });

module.exports = {
    sequelize,
    Sequelize,
    Player,
    Game,
    GameSetting,
    PlayerGameScore,
    ScoreEvent,
    GameWord,
    QuizQuestion,
    SoletraRound,
};