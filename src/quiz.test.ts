import { expect, test, describe } from "bun:test";
import { Quiz } from "./quiz";
import { testQuestionsOne, testQuestionsTwo, metadata } from "./resources.test";

describe("Testing a new quiz.", () => {
    const newQuiz = new Quiz(testQuestionsOne, metadata);
    test("Check that all questions were added correctly.", () =>{
        expect(newQuiz.questions).toBeArrayOfSize(3);
        expect(newQuiz.questions).toMatchObject(testQuestionsOne);    
    })

    test("Check setting new questions.", () => {
        newQuiz.questions = testQuestionsTwo;
        expect(newQuiz.questions).toMatchObject(testQuestionsTwo);    
    })

    test("Check metadata properly set.", () => {
        expect(newQuiz.metadata).toMatchObject(metadata);
    })

});
