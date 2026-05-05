const { Game, GameWord, QuizQuestion, SoletraRound } = require('./models');

async function checkCounts() {
    try {
        console.log('Games:', await Game.count());
        console.log('Words:', await GameWord.count());
        console.log('Quiz:', await QuizQuestion.count());
        console.log('Rounds:', await SoletraRound.count());
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCounts();
