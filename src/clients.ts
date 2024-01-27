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