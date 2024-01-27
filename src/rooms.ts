import type { Quiz } from "./quiz";


/**
 * Scores are calculated based
 * on how fast a player enters
 * the correct answer. We index
 * based on the question id.
 * We store the player who answered
 * plus the difference from when the
 * question was first posed so we can
 * refer to it later for leaderboard
 * or rescoring purposes.
 */
type Score = {
    player: string
    answerSpeed: number
}

// Subject to change later on.
type Player = string;

enum GameState {
    LOBBY,
    QUESTION,
    LEADERBOARD,
    ENDED
}

/**
 * Instances of this class are created
 * to handle every game. They are attached
 * to a single quiz, from which it will
 * draw questions.
 */
export class RoomSession {
    private linkedQuiz: Quiz;
    private roomId: string = crypto.randomUUID();
    private playerList: Player[] = [];
    private scores: Map<number, Score[]> = new Map();
    private gameState = {
        currQuestionIndex: -1,
        timeGameStarted: Date.now().valueOf(),
        timeAtPrompt: Date.now().valueOf(),
        timeLimit: 1000 * 15, // in milliseconds
        status: GameState.LOBBY
    }

    constructor(newQuiz: Quiz) {
        this.linkedQuiz = newQuiz;
    }

    /**
     * Passthrough the linkedQuiz metadata.
     * @returns A quizMetadata object.
     */
    get quizMetadata() {
        return this.linkedQuiz.metadata;
    }

    /**
     * Returns the room's unique identifer.
     * @returns A UUID string.
     */
    get id() {
        return this.roomId;
    }

    /**
     * Returns the current question.
     * @returns An object of type Question
     */
    get currentQuestion() {
        return this.linkedQuiz.questions[this.gameState.currQuestionIndex] ?? null;
    }

    /**
     * Returns the time elapsed since the start of room.
     * @returns A difference in Unix time in milliseconds.
     */
    get timeSinceStart() {
        return Date.now().valueOf() - this.gameState.timeGameStarted;
    }

    /**
     * Returns the time elapsed since a question was prompted.
     * @returns A difference in Unix time in milliseconds.
     */
    get timeSincePrompt() {
        return Date.now().valueOf() - this.gameState.timeAtPrompt;
    }

    /**
     * Internal function to replace the time since prompt
     * to an arbitrary value.
     */
    private set timeSincePrompt(newTime: number) {
        this.gameState.timeAtPrompt = newTime;
    }

    /**
     * Internal function to replace the time since prompt
     * to the current time.
     */
    private resetTimeSincePrompt() {
        this.timeSincePrompt = Date.now().valueOf();
    }

    /**
     * Internal function to check whether the time limit
     * for the current question has been exceeded.
     * @returns whether time has expired
     */
    private get hasTimeExpired() {
        return this.timeSincePrompt > this.gameState.timeLimit;
    }

    /**
     * Check if all players have answered the current question
     * correctly and recieved a score.
     * @remarks Good for checking whether to end a round early.
     * @returns A boolean.
     */
    get hasEveryoneAnswered() {
        const arrayOfScores = this.scores.get(this.gameState.currQuestionIndex) ?? null;
        if (arrayOfScores) {
            const arrayOfPlayers = arrayOfScores.map((entry) => entry.player);
            for (const player of this.players) {
                if (!arrayOfPlayers.includes(player)) {
                    return false;
                }
            }
            return true;
        } else {
            throw new Error("Game state inconsistent!")
        }
    }

    /**
     * Checks whether the time limit per question has been reached
     * or everyone has answered. The question will not be advanced
     * if the question index would exceed the length of the quiz questions.
     * @returns A boolean indicating whether the question was able to be advanced.
     */
    private advanceQuestion() {
        if (this.gameState.currQuestionIndex < 0 || this.hasTimeExpired || this.hasEveryoneAnswered) {
            if (this.gameState.currQuestionIndex < this.linkedQuiz.questions.length) {
                this.gameState.currQuestionIndex++;
                this.resetTimeSincePrompt();
                return true;
            } else {
                this.endGame();
                return false;
            }
        }
        return false;
    }

    /**
     * Function to begin a game from the LOBBY state.
     * @remarks requires you to pass the leader player to work
     * @returns boolean indicating whether the game was started
     */
    startGame(player: Player) {
        if (this.leader === player && this.gameState.status === GameState.LOBBY) {
            this.gameState.status = GameState.QUESTION;
            this.advanceQuestion();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Function to end a game.
     * @remarks for final questions or everyone leaves.
     */
    endGame() {
        this.gameState.status = GameState.ENDED;
    }

    /**
     * Returns the current state of the game.
     * @returns an enum of either 0, 1, 2, or 3
     */
    get currentState() {
        return this.gameState.status;
    }

    /**
     * Internal method to record a player answering correctly.
     */
    private updatePlayerScore(player: string, answerSpeed: number) {
        const newScoreEntry = { player, answerSpeed }
        const scoreArray = this.scores.get(this.gameState.currQuestionIndex) ?? null;
        if (scoreArray) {
            scoreArray.push(newScoreEntry);
        } else {
            this.scores.set(this.gameState.currQuestionIndex, [newScoreEntry]);
        }
    }

    /**
     * Checks whether a submitted answer is correct for
     * the current question, updates the scores, and checks
     * if the question can advance.
     * @returns A boolean indicating whether the question was right.
     */
    submitAnswer(player: Player, answer: string) {
        const submissionTime = this.timeSincePrompt;
        if (this.currentQuestion.answer === answer) {
            this.updatePlayerScore(player, submissionTime);
            this.advanceQuestion();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns the current list of players in the game.
     * @returns an array of Player objects
     */
    get players() {
        return this.playerList;
    }

    /**
     * Returns the most senior player in the game, in
     * terms of push order.
     * @returns a Player object
     */
    get leader() {
        return this.playerList[0] ?? null;
    }

    /**
     * Adds a player to the room's internal player list.
     */
    addPlayer(player: Player) {
        this.playerList.push(player);
    }

    /**
     * Removes a player from the room's internal player list.
     */
    removePlayer(player: Player) {
        this.playerList = this.playerList.filter((entry) => player !== entry);
    }

    /**
     * Returns every score collected so far in the game, separated
     * by question.
     * @returns a Map of Score arrays, indexed on the Quiz's question index
     */
    getScores() {
        return this.scores;
    }

    /**
     * Returns every score collected so far for a specific player. Preserves insert order.
     * @remarks does NOT calculate points to award
     * @todo think about a points algorithm
     * @returns an array of a player's answerSpeed values
     */
    getPlayerScore(player: Player) {
        const speedArray = [...this.scores.values()].flatMap((scoreArray) => scoreArray.filter((scoreEntry) => scoreEntry.player === player).map((scoreEntry) => scoreEntry.answerSpeed));
        return speedArray;
    }
}