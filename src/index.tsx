import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import HomePage from './views/Home';
import PageNotFound from './views/PageNotFound';
import staticPlugin from '@elysiajs/static';
import QuizView from './views/QuizView';
import type { songMeta } from './utilityFunctions';
import SongInformation from './views/quiz/SongInformation';
import CoverArt from './views/quiz/CoverArt';
import SolveStatus from './views/quiz/SolveStatus';

const waypoint = new Elysia();

waypoint.use(html());
waypoint.use(staticPlugin({
    prefix: "/"
}))

waypoint.onError(({ code, set }) => {
    switch (code) {
        case "NOT_FOUND":
            set.headers["content-type"] = 'text/html; charset=utf8';
            return (
                <PageNotFound />
            )
    }
})

waypoint.get("/", () => {
    const logo = "https://bowenchen.xyz/assets/images/jellyfin-icon.svg";
    return (
        <HomePage logo={logo} />
    )
})

waypoint.get("/quiz", ({ cookie: { ingsoc } }) => {
    if (ingsoc.value?.length === 36 && ingsoc.value.match(uuidRegexMatch)) {
        // do nothing
    } else {
        ingsoc.value = crypto.randomUUID();
    }

    return (
        <QuizView />
    )
}, {
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
    })
})

const uuidRegexMatch = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

/*waypoint.get("/identify", ({ cookie: { ingsoc } }) => {
    if (ingsoc.value?.length === 36 && ingsoc.value.match(uuidRegexMatch)) {
        return;
    } else {
        ingsoc.value = crypto.randomUUID();
        return;
    }
}, {
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
    })
})*/

/*const rooms = new class WSRooms {
    private rooms: Map<string, Client[]>;

    constructor() {
        this.rooms = new Map();
    }

    newRoom(client: Client) {
        const roomId = crypto.randomUUID();
        this.rooms.set(roomId, [client]);
    }

    joinRoom(roomId: string, client: Client) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.push(client);
        } else {
            this.rooms.set(roomId, [client]);
        }
    }

    leaveRoom(roomId: string, client: Client) {
        const room = this.rooms.get(roomId);
        if (room) {
            const newRoom = room.filter((c) => c !== client);
            this.rooms.set(roomId, newRoom);
        }
    }

    closeRoom(roomId: string) {
        const room = this.rooms.get(roomId);
        room?.forEach((client) => client.disconnect());
        this.rooms.delete(roomId);
    }
}*/


const clientList = new class ClientList {
    private clients: Client[];

    constructor() {
        this.clients = []
    }

    exists(uuid: string) {
        const clientArr = this.clients.map((client) => client.uuid);
        return clientArr.includes(uuid);
    }

    append(client: Client) {
        this.clients.push(client);
        console.log(this.clients)
    }

}

class Client {
    private id: string;
    private lastSeen: number;
    //private wsConnection: ElysiaWS<any>; // idc
    //private connected: boolean;

    constructor(uuid: string/*, ws: ElysiaWS<any>*/) {
        this.id = uuid;
        this.lastSeen = Date.now().valueOf(); // Unix time in ms
        //this.wsConnection = ws;
        //this.connected = true;newClient() {
    }

    get isExpired() {
        return this.lastSeen > 1000 * 60 * 5 // 5 minutes in ms
    }

    get uuid() {
        return this.id;
    }

    /*get isConnected() {
        return this.connected;
    }

    disconnect() {
        this.connected = false;
        this.wsConnection.close();
    }*/

}

const songListExample: songMeta[] = [
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
        audioUrl: '/assets/audio/Le Souvenir avec le crepuscule.flac'
    }
]

class Quiz {
    private songList: songMeta[];
    private createTime: number;

    constructor(songList: songMeta[]) {
        // TODO: load quiz data
        this.songList = songList
        this.createTime = new Date().valueOf();
    }

    /*getSong(index: number) {
        if (index > 0 && index < this.songList.length) {
            return this.songList[index];
        } else {
            return null;
        }
    }*/

    get songs() {
        return this.songList;
    }

    get creationTime() {
        return this.createTime;
    }

}

const quizList: Quiz[] = [
    new Quiz(songListExample)
]

class RoomSession {
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

const roomList = new class RoomList {
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

waypoint.ws('/ws', {
    open(ws) {
        const uuid = ws.data.cookie.ingsoc.value;
        if (uuid) {
            if (clientList.exists(uuid)) {
                const room = roomList.findUser(uuid)
                if (room) {
                    ws.subscribe("fontaine");

                    ws.send(<>
                        <p id="room-uuid">OLD {room.id}</p>
                    </>)
                }
            } else {
                const client = new Client(uuid);
                clientList.append(client);
                // TODO : send client currennt game state

                ws.subscribe("fontaine");
                const room = roomList.createRoom(quizList[0], client);

                ws.send(<>
                    <p id="room-uuid">NEW {room.id}</p>
                    
                </>)

            }
        } else {
            // TODO: deal with people that somehow get 
            // past the uuid cookie check
            ws.close();
            return;
        }
    },
    body: t.Object({
        answer: t.String(),
        HEADERS: t.Object({
            "HX-Request": t.String(),
            "HX-Trigger": t.Union([t.String(), t.Null()]),
            "HX-Trigger-Name": t.Union([t.String(), t.Null()]),
            "HX-Target": t.Union([t.String(), t.Null()]),
            "HX-Current-URL": t.String(),
        })
    }),
    message(ws, message) {
        const uuid = ws.data.cookie.ingsoc.value;

        // TODO: check if client solution was correct
        console.log(message, uuid)

        if (uuid === undefined) {
            ws.close();
            return;
        }

        const room = roomList.findUser(uuid)

        if (message.answer === room?.currentSong.songTitle) {
            ws.send(<>
                <SongInformation metadata={room.currentSong} />
                <div id="cover-art" class="from-[#7dcefc] to-[#8dbc85] bg-gradient-to-b rounded-lg p-4">
                    <CoverArt coverArtUrl={room.currentSong.coverArt} />
                </div>
                <SolveStatus solved={true} message='good job' />
                </>
            )
        } else {
            ws.send(<>
                <SolveStatus solved={false} message='no idiot' />
            </>)
        }

        ws.publish('fontaine', 'message')

    },
    beforeHandle: ({ cookie: { ingsoc } }) => {
        if (ingsoc.value === undefined) {
            return new Response(null, { status: 401 })
        }
    },
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
    })
})

waypoint.listen(4200, () => {
    console.log("elysia running on http://localhost:4200")
})