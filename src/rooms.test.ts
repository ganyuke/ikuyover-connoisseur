import { expect, test, describe } from "bun:test";
import { metadata, testQuestionsOne } from "./resources.test";
import { Quiz } from "./quiz";
import { RoomSession } from "./rooms";

describe("Testing room functionality.", () => {
    describe("Test player mangement.", () => {
        const newQuiz = new Quiz(testQuestionsOne, metadata);
        const newRoom = new RoomSession(newQuiz);    
        const bestGirl = "Furina de Fontaine";
        test("Check adding a player", () => {
            newRoom.addPlayer(bestGirl);
            expect(newRoom.players).toBeArrayOfSize(1);
            expect(newRoom.players).toContain(bestGirl);
        })

        test(`Check that the leader is ${bestGirl}`, () => {
            expect(newRoom.leader).toStrictEqual(bestGirl);
        })

        test("Check removing a player", () => {
            newRoom.removePlayer(bestGirl);
            expect(newRoom.players).toBeArrayOfSize(0);
        })

        test("Check that the leader becomes null.", () => {
            expect(newRoom.leader).toBeNull();
        })
    })

    describe("Test answering functionality.", () => {
        const newQuiz = new Quiz(testQuestionsOne, metadata);
        const newRoom = new RoomSession(newQuiz);    
        const bestGirl = "Furina de Fontaine";
        const walnut = "Hu Tao";
        newRoom.addPlayer(bestGirl);
        newRoom.addPlayer(walnut);

        newRoom.currentQuestion;

        test("Check whether the initial current question is null.", () => {
            expect(newRoom.currentQuestion).toBeNull();
        })

        test("Check that initial game state is LOBBY", () => {
            expect(newRoom.currentState).toBe(0);
        })

        test("Check that game won't update unless leader issues order.", () => {
            expect(newRoom.startGame(walnut)).toBeFalse();
        })

        test("Check game state updates on game start.", () => {
            expect(newRoom.startGame(bestGirl)).toBeTrue();
            expect(newRoom.currentState).toBe(1);
        })

        test("Check that the first question is correct.", () => {
            expect(newRoom.currentQuestion).toMatchObject(testQuestionsOne[0]);
        })

        test("Check that answering a question advances the game.", () => {
            expect(newRoom.currentQuestion).toMatchObject(testQuestionsOne[0]);
        })

        test("Check that answering wrong returns false.", () => {
            expect(newRoom.submitAnswer(bestGirl, "Witness my magnificence!")).toBeFalse();
        })

        test("Check that answering right returns true.", () => {
            expect(newRoom.submitAnswer(walnut, testQuestionsOne[0].answer)).toBeTrue();
        })

        test("Check that 1/2 players answering right does NOT advance game.", () => {
            expect(newRoom.currentQuestion).toMatchObject(testQuestionsOne[0]);
        })

        test("Check that 2/2 players answering right DOES advance game.", () => {
            newRoom.submitAnswer(bestGirl, testQuestionsOne[0].answer);
            expect(newRoom.currentQuestion).toMatchObject(testQuestionsOne[1]);
        })

    })

    describe("Test game life cycle.", () => {
        const newQuiz = new Quiz(testQuestionsOne, metadata);
        let newRoom = new RoomSession(newQuiz);    
        const bestGirl = "Furina de Fontaine";

        test("Check that we can end the game by making everyone leave.", () => {
            newRoom.addPlayer(bestGirl);
            expect(newRoom.currentState === 0);
            newRoom.startGame(bestGirl);
            expect(newRoom.currentState === 1);
            newRoom.removePlayer(bestGirl);
            expect(newRoom.currentState === 3);
        })

        newRoom = new RoomSession(newQuiz);

        test("Check that we can end the game by answering everything.", async () => {
            newRoom.addPlayer(bestGirl);
            expect(newRoom.currentState === 0);
            newRoom.startGame(bestGirl);
            expect(newRoom.currentState === 1);
            for (const question of testQuestionsOne) {
                expect(newRoom.currentQuestion).toMatchObject(question);
                expect(newRoom.submitAnswer(bestGirl, question.answer)).toBeTrue();
            }
            expect(newRoom.currentState === 3);
        })        
    })

    describe("Test scoring.", () => {
        const newQuiz = new Quiz(testQuestionsOne, metadata);
        let newRoom = new RoomSession(newQuiz);    
        const bestGirl = "Furina de Fontaine";

        test("Test that delaying will affect scoring.", async () => {
            newRoom.addPlayer(bestGirl);
            newRoom.startGame(bestGirl);
            const delays = [200, 500, 1000];
            let i = 0;
            for (const question of testQuestionsOne) {
                const delay = (delays[i] ?? 0);
                console.log("Testing scoring with delay at " + delay);
                await new Promise((r) => setTimeout(r, delay));
                newRoom.submitAnswer(bestGirl, question.answer);
                expect(newRoom.getPlayerScore(bestGirl)[i]).toBeWithin(delay, delay + 10);
                i++;
            }
        })     
    })

});