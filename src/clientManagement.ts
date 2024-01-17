import type { songMeta } from "./utilityFunctions";

export class ClientList {
    private clients: Client[];

    constructor() {
        this.clients = []
    }

    /**
    * Checks if the supplied uuid is being tracked by this ClientList.
    * @param uuid - The uuid of a client to check.
    * @returns A boolean value.
    */
    exists(uuid: string) {
        const clientArr = this.clients.map((client) => client.uuid);
        return clientArr.includes(uuid);
    }

    /**
    * Appends the supplied client to this ClientList.
    * @param client - The client to add to the list.
    */
    append(client: Client) {
        this.clients.push(client);
    }

}

export class Client {
    private id: string;
    private lastSeen: number;

    constructor(uuid: string) {
        this.id = uuid;
        this.lastSeen = Date.now().valueOf(); // Unix time in ms
    }

    /**
    * Checks if the client is inactive (no activity after 5 minutes).
    * @returns A boolean value.
    */
    get isExpired() {
        return this.lastSeen > 1000 * 60 * 5 // 5 minutes in ms
    }

    /**
    * Returns the uuid of this client.
    * @returns A uuid string
    */
    get uuid() {
        return this.id;
    }

}

export const songListExample: songMeta[] = [
    {
        artist: 'HOYO-MiX',
        songTitle: 'Fontaine',
        albumTitle: 'Fountain of Belleau',
        coverArt: '/assets/images/covers/cover.jpg',
        audioUrl: '/assets/audio/Fontaine.flac'
    },
    {
        artist: 'HOYO-MiX',
        songTitle: 'Le Souvenir avec le crepuscule',
        albumTitle: 'Fountain of Belleau',
        coverArt: '/assets/images/covers/cover.jpg',
        audioUrl: '/assets/audio/Le-Souvenir-avec-le-crepuscule.flac'
    }
]

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
            name: "very cool quiz 1",
            creator: "bill gates",
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

export class RoomSession {
    private roomId: string;
    private quizData: Quiz;
    private players: Client[];
    private quizSession = {
        songIndex: 0
    }

    constructor(quiz: Quiz, leader: Client) {
        this.roomId = crypto.randomUUID();
        this.quizData = quiz;
        this.players = [leader];
    }

    increment() {
        if (this.quizSession.songIndex + 1 < this.quizData.songs.length) {
            ++this.quizSession.songIndex;
            return this.quizData.songs[this.quizSession.songIndex];
        } else {
            return null;
        }
    }

    get id() {
        return this.roomId;
    }

    get currentSong() {
        return this.quizData.songs[this.quizSession.songIndex];
    }

    joinRoom(client: Client) {
        this.players.push(client);
    }

    leaveRoom(client: Client) {
        const newArr = this.players.filter((c) => c.uuid !== client.uuid);
        this.players = newArr;
    }

    hasUser(uuid: string) {
        return this.players.map((c) => c.uuid).includes(uuid);
    }

    get leader() {
        return this.players ? this.players[0] : null;
    }
}

export class RoomList {
    private rooms: RoomSession[];

    constructor() {
        this.rooms = []
    }

    findRoom(uuid: string) {
        const roomArr = this.rooms.map((room) => room.id);
        const indexOfRoom = roomArr.indexOf(uuid);
        return indexOfRoom !== -1 ? this.rooms[indexOfRoom] : null;
    }

    createRoom(quiz: Quiz, leader: Client) {
        const room = new RoomSession(quiz, leader);
        this.rooms.push(room);
        // console.log(this.rooms.length)
        return room;
    }

    findUser(uuid: string) {
        const roomArr = this.rooms.filter((room) => room.hasUser(uuid));
        return roomArr.length > 0 ? roomArr[0] : null;
    }

}