import type { songMeta } from "./utilityFunctions";

export type Question = {
    prompt: string;
    answer: string;
    data?: songMeta[];
    resources: {
        type: string;
        url: string;
    }[];
}

export type QuizMetadata = {
    title: string;
    creator: string;
    createdTs: number;
    modifiedTs: number;
    playCount: number;
}

export class Quiz {
    private questionList: Question[];
    private quizMetadata: QuizMetadata;

    constructor(questions: Question[], metadata: QuizMetadata) {
        this.questionList = questions;
        this.quizMetadata = metadata;
    }

    get questions() {
        return this.questionList;
    }

    set questions(newQuestions: Question[]) {
        this.quizMetadata.modifiedTs = Date.now().valueOf();
        this.questionList = newQuestions;
    }

    get metadata() {
        return this.quizMetadata;
    }

}