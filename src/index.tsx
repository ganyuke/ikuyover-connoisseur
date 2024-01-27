import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import staticPlugin from '@elysiajs/static';
import { createUserIdentifer, isUuid } from './utilityFunctions';
import nunjucks from 'nunjucks'
import { Client } from './clients';
import { ClientList, RoomList, quizList } from './grossLists';

// ----------- //
// SETUP STUFF //
// ----------- //

const waypoint = new Elysia();
waypoint.use(html());
waypoint.use(staticPlugin({
    prefix: "/",
    alwaysStatic: true
}))

const clientList = new ClientList;
const roomList = new RoomList;

nunjucks.configure('src/views/', { autoescape: true, watch: true });

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
        // Track the client
        client = new Client(ingsoc.value);
        clientList.append(client);
        roomList.createRoom(quizList[0], client);
    }

    // Hydrate the page with actual data if the client is in a room.
    // Otherwise, create a new client to deal with them.
    if (client) {
        client.updateLastSeen();
        const currentRoom = client.currentRoom ? roomList.findRoom(client.currentRoom) : null;
        if (currentRoom) {
            const data = {
                sessionData: {
                    elapsedTime: Math.floor(currentRoom.timeSinceStart / 1000),
                    playerCount: currentRoom.players.length,
                    title: currentRoom.quizMetadata.title,
                    uuid: currentRoom.id
                },
                audio_url: currentRoom.currentQuestion.resources.find((resource) => resource.type === "audio")?.url,
                question: "name the song!"
            }
            return (
                nunjucks.render("QuizView.njk", data)
            )
        }
    }

    return (
        nunjucks.render("LobbyView.njk")
    )
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
        if (uuid && isUuid(uuid)) {
            let client: Client | null = clientList.getClient(uuid);
            if (client && client.currentRoom) {
                const room = roomList.findRoom(client.currentRoom);

                if (room?.submitAnswer(client.uuid, message.answer)) {
                    const victoryHtml: string = [
                        nunjucks.render("quiz/SongInformation.njk", { metadata: room.currentQuestion.data?.[0].songTitle }),
                        nunjucks.render("quiz/CoverArt.njk", { coverArtUrl: room.currentQuestion.resources.find((entry) => entry.type === "cover")?.url }),
                        nunjucks.render("quiz/SolveStatus.njk", { solve_status: true, message: 'good job' })
                    ].join();
                    ws.send(victoryHtml);

                    // TODO: notify other players that someone answered correctly.
                    //       ws.publish('fontaine', )

                } else {
                    const incorrectReponseHtml: string = nunjucks.render("quiz/SolveStatus.njk", { solve_status: false, message: 'no idiot' });
                    ws.send(incorrectReponseHtml);
                }
            }
        } else {
            ws.close();
            return;
        }
    },
    beforeHandle: ({ cookie: { ingsoc } }) => {
        if (ingsoc.value === undefined) {
            return new Response(null, { status: 401 });
        }
    },
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
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
    } else {
        ingsoc.value = createUserIdentifer();
        ingsoc.httpOnly = true;
        ingsoc.sameSite = true;
    }

    // Hydrate the page with actual data if the client is in a room.
    // Otherwise, create a new client to deal with them.
    if (client) {
        client.updateLastSeen();
        if (client.currentRoom) {
            return new Response(null, { status: 400 })
        } else {
            roomList.createRoom(quizList[0], client);
            return new Response(null, { status: 200 })
        }
    }

    return new Response(null, { status: 401 })
}, {
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
    })
})


waypoint.listen(4200, () => {
    console.log("elysia running on http://localhost:4200")
})