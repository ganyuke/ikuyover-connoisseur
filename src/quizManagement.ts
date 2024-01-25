import { songListExample } from "./songList";
import type { songMeta } from "./utilityFunctions";

type quizMeta = {
    name: string,
    creator: string,
    createTime: number
}

export class Quiz {
    private songList: songMeta[];
    private quizMetadata: quizMeta;

    /**
    * Returns information associated with this quiz.
    * @param songList - A list of songs to associate with this quiz
    */
    constructor(songList: songMeta[]) {
        // TODO: load quiz data
        this.songList = songList
        this.quizMetadata = {
            name: "I love Suisei",
            creator: "hoshiyomi",
            createTime: new Date().valueOf()
        }
    }

    /**
    * Returns information associated with this quiz.
    * @returns A quiz metadata object.
    */
    get data() {
        return this.quizMetadata;
    }

    /**
    * Returns list of songs associated with this quiz.
    * @returns An array of song metadata.
    */
    get songs() {
        return this.songList;
    }

}

export const quizList: Quiz[] = [
    new Quiz(songListExample)
]