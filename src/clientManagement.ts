import type { Quiz } from "./quizManagement";

export class ClientList {
    private clients: Client[];

    constructor() {
        this.clients = [];
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

    getClient(uuid: string) {
        const clientArr = this.clients.filter((client) => client.uuid === uuid);
        return clientArr.length > 0 ? clientArr[0] : null;
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
    private room: string | null = null;

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
    * Updates the lastSeen of a client to the current time.
    */
    updateLastSeen() {
        this.lastSeen = Date.now().valueOf();
    }

    /**
    * Returns the uuid of this client.
    * @returns A uuid string
    */
    get uuid() {
        return this.id;
    }

    /**
    * Returns the room which a client is in.
    * @returns The string of the current room or null if there isn't one.
    */
    get currentRoom() {
        return this.room;
    }

    /**
    * Sets the room which a client is in. Can be null.
    */
    set currentRoom(newRoom: string | null) {
        this.room = newRoom;
    }

}


type Score = {
    question: number
    points: number
}

enum RoomState {
    InLobby = 0,
    Starting,
    InProgress,
    ShowingLeaderboard,
    Finished
} 

export class RoomSession {
    private roomId: string;
    private quizData: Quiz;
    private players: Client[];
    private scores: Map<Client, Score[]>;
    private roomState: RoomState;
    private quizSession = {
        questionIndex: 0,
        creationTime: Date.now().valueOf()
    }

    constructor(quiz: Quiz, leader: Client) {
        this.roomId = crypto.randomUUID();
        this.quizData = quiz;
        this.players = [leader];
        leader.currentRoom = this.roomId;
        this.scores = new Map();
        this.roomState = RoomState.InLobby;
    }

    increment() {
        let currentSong = this.quizSession.questionIndex;
        if (currentSong + 1 < this.quizData.songs.length) {
            ++currentSong;
            return this.quizData.songs[currentSong];
        } else {
            return null;
        }
    }

    get state() {
        return this.roomState;
    }

    get id() {
        return this.roomId;
    }

    get currentSong() {
        return this.quizData.songs[this.quizSession.questionIndex];
    }

    get playerCount() {
        return this.players.length;
    }

    get creationTime() {
        return this.quizSession.creationTime;
    }

    joinRoom(client: Client) {
        if (client.currentRoom) {
            throw new Error("Already in a room!");
        }
        this.players.push(client);
        client.currentRoom = this.id;
    }

    leaveRoom(client: Client) {
        const newArr = this.players.filter((c) => c.uuid !== client.uuid);
        this.players = newArr;
    }

    hasUser(uuid: string) {
        return this.players.map((c) => c.uuid).includes(uuid);
    }

    get leader() {
        return this.players.length > 0 ? this.players[0] : null;
    }

    getPlayerScore(client: Client) {
        let scoreArray = this.scores.get(client);
        if (scoreArray) {
            return scoreArray.map((score) => score.points).reduce((sum, points) => sum += points);
        } else {
            return null;
        }
    }

    getAllScores() {
        return this.scores;
    }
}

export class RoomList {
    private rooms: RoomSession[];

    constructor() {
        this.rooms = []
    }

    findRoom(roomId: string) {
        const roomArr = this.rooms.filter((room) => room.id === roomId);
        //const indexOfRoom = roomArr.indexOf(uuid);
        //return indexOfRoom !== -1 ? this.rooms[indexOfRoom] : null;
        return roomArr.length > 0 ? roomArr[0] : null;
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