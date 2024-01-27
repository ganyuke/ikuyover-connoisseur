import type { Client } from "./clients";
import { Quiz } from "./quiz";
import { RoomSession } from "./rooms";
import type { songMeta } from "./utilityFunctions";

export class RoomList {
    private rooms: Map<string, RoomSession>;

    constructor() {
        this.rooms = new Map();
    }

    findRoom(roomId: string) {
        const roomArr = this.rooms.get(roomId);
        //const indexOfRoom = roomArr.indexOf(uuid);
        //return indexOfRoom !== -1 ? this.rooms[indexOfRoom] : null;
        return roomArr ? roomArr : null;
    }

    createRoom(quiz: Quiz, leader: Client) {
        const room = new RoomSession(quiz);
        room.addPlayer(leader.uuid)
        this.rooms.set(room.id, room);
        // console.log(this.rooms.length)
        return room;
    }

}

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

export const songListExample: songMeta[] = [
    {
        artist: 'Hoshimachi Suisei',
        songTitle: 'NEXT COLOR PLANET',
        albumTitle: 'Still Still Stellar',
    },
    {
        artist: 'HOYO-MiX',
        songTitle: 'Fontaine',
        albumTitle: 'Fountain of Belleau',
    },
    {
        artist: 'HOYO-MiX',
        songTitle: 'Le Souvenir avec le crepuscule',
        albumTitle: 'Fountain of Belleau',
    },
    {
        artist: 'HOYO-MiX',
        songTitle: 'Ballad of Many Waters',
        albumTitle: 'Fountain of Belleau',
    }
]


const questions = [
    {
        prompt: "Name this song!",
        answer: "Next Color Planet",
        data: [
            songListExample[0]
        ],
        resources: [
            {
                type: "cover",
                url: "/assets/images/covers/1c061b6a-9bdb-4c2b-a554-53b172b53768.png"
            },
            {
                type: "audio",
                url: "/assets/audio/Next-Color-Planet.mp3"
            }
        ]
    },
    {
        prompt: "Name this song!",
        answer: "Fontaine",
        data: [
            songListExample[1]
        ],
        resources: [
            {
                type: "cover",
                url: "/assets/images/covers/cover.jpg"
            },
            {
                type: "audio",
                url: "/assets/audio/Fontaine.flac"
            }
        ]
    },
    {
        prompt: "Name this song!",
        answer: "Ballad of Many Waters",
        data: [
            songListExample[3]
        ],
        resources: [
            {
                type: "cover",
                url: "/assets/images/covers/cover.jpg"
            },
            {
                type: "audio",
                url: "/assets/audio/ballad-of-many-waters.flac"
            }
        ]
    }
]

export const metadata = {
    title: "Not Rock, But Still Goes Hard",
    creator: "Zhongli",
    createdTs: Date.now().valueOf(),
    modifiedTs: Date.now().valueOf(),
    playCount: 0
}

export const quizList = [
    new Quiz(questions, metadata)
]