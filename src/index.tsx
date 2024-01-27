import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import staticPlugin from '@elysiajs/static';
import { createUserIdentifer, isUuid } from './utilityFunctions';
import nunjucks from 'nunjucks'
import { Client } from './clients';
import { ClientList, RoomList } from './grossLists';
import { fullPageGenerate, sendToRoom, wsHydrateAnswer, wsHydrateQuestion } from './hydration';

// ----------- //
// SETUP STUFF //
// ----------- //

const waypoint = new Elysia();
waypoint.use(html());
waypoint.use(staticPlugin({
    prefix: "/",
    alwaysStatic: true
}))

const PORT = 4200;

const clientList = new ClientList;
export const roomList = new RoomList;

nunjucks.configure('src/views/', { autoescape: true, watch: true });
export const trinty = nunjucks;

waypoint.onError(({ code, set }) => {
    switch (code) {
        case "NOT_FOUND":
            set.headers["content-type"] = 'text/html; charset=utf8';
            return (
                nunjucks.render("PageNotFound.njk")
            )
    }
})

// --------- //
// ENDPOINTS //
// --------- //

/**
 * The objectives in this endpoint are as follows:
 *  - Supply the base page.
 *  - If the player is new, give them a cookie.
 *  - If the player is in a game, hydrate the current game information.
 *  - If the player isn't, prompt them to create a room or join one.
 *  - TODO: Accepts query parameters to join a room.
 */
waypoint.get("/quiz", ({ cookie: { ingsoc } }) => {
    // We want to check if the client exists so we can check if
    // they also have a room. Otherwise, give them a cookie.
    let client: Client | null = null;
    if (ingsoc?.value && isUuid(ingsoc.value)) {
        client = clientList.getClient(ingsoc.value);
    } else {
        // Give the new client an identifier
        ingsoc.value = createUserIdentifer();
        ingsoc.httpOnly = true;
        ingsoc.sameSite = true;
    }

    // Even with a cookie, the client may still not exist yet.
    if (client === null) {
        client = new Client(ingsoc.value);
        clientList.append(client);
    }

    // Hydrate the page with actual data if the client is in a room.
    // Otherwise, create a new client to deal with them.
    return fullPageGenerate(client);

}, {
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
    })
})

/**
 * The objectives in this endpoint are as follows:
 *  - User MUST have a cookie to access.
 *  - Connect the user to a game.
 *  - Hydrate the page with the current state of the game.
 *  - Respond to user inputs (i.e. answers)
 */
waypoint.ws('/ws', {
    open(ws) {
        const uuid = ws.data.cookie.ingsoc.value;
        if (uuid) {
            const client = clientList.getClient(uuid);
            if (client && client.currentRoom) {
                const room = roomList.findRoom(client.currentRoom);
                if (room) {
                    ws.subscribe(room.id);

                    ws.send(<>
                        <p id="room-uuid">Room: {room.id} {`(rejoined)`}</p>
                    </>)
                    return;
                }
            }
        }
        // TODO: deal with people that somehow get
        // past the uuid cookie check
        ws.close();
        return;
    },
    body: t.Object({
        operation: t.String(),
        answer: t.Optional(t.String()),
        HEADERS: t.Object({
            "HX-Request": t.String(),
            "HX-Trigger": t.Nullable(t.String()),
            "HX-Trigger-Name": t.Nullable(t.String()),
            "HX-Target": t.Nullable(t.String()),
            "HX-Current-URL": t.String(),
        })
    }),
    message(ws, message) {
        const uuid = ws.data.cookie.ingsoc.value;
        if (uuid && isUuid(uuid)) {
            let client: Client | null = clientList.getClient(uuid);

            if (client) {
                switch (message.operation) {
                    case "answer":
                        if (message.answer) {
                            const html = wsHydrateAnswer(client, message.answer);
                            if (html) {
                                return ws.send(html);
                            }
                        }
                        break;
                    case "start-game":
                        const html = wsHydrateQuestion(client);
                        if (html) {
                            return ws.send(html);
                        }
                }
            }
        }
    },
    beforeHandle: ({ cookie: { ingsoc } }) => {
        if (ingsoc.value === undefined) {
            return new Response(null, { status: 401 });
        }
    },
    cookie: t.Cookie({
        ingsoc: t.String()
    })
})

/**
 * The objectives in this endpoint are as follows:
 *  - Create a new room and set the leader as the client
 */
waypoint.post("/create-room", ({ cookie: { ingsoc } }) => {
    // We want to check if the client exists so we can check if
    // they also have a room. Otherwise, give them a cookie.
    let client: Client | null = null;
    if (ingsoc?.value && isUuid(ingsoc.value)) {
        client = clientList.getClient(ingsoc.value);
    }

    // Hydrate the page with actual data if the client is in a room.
    // Otherwise, create a new client to deal with them.
    if (client) return sendToRoom(client);

    return new Response(null, { status: 401 });
}, {
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
    })
})


waypoint.listen(PORT, () => {
    console.log("elysia running on http://localhost:" + PORT)
})