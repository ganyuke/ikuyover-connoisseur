import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import staticPlugin from '@elysiajs/static';
import { createUserIdentifer, isUuid } from './utilityFunctions';
import nunjucks from 'nunjucks'
import { Client, ClientList, RoomList, quizList } from './clientManagement';

const waypoint = new Elysia();
waypoint.use(html());
waypoint.use(staticPlugin({
    prefix: "/",
    alwaysStatic: true
}))

const clientList = new ClientList;
const roomList = new RoomList;

nunjucks.configure('src/views/', { autoescape: true });

waypoint.onError(({ code, set }) => {
    switch (code) {
        case "NOT_FOUND":
            set.headers["content-type"] = 'text/html; charset=utf8';
            return (
                nunjucks.render("PageNotFound.njk")
            )
    }
})

waypoint.get("/quiz", ({ cookie: { ingsoc } }) => {
    // TODO: If user supplies a RoomId in query params,
    // fetch the data for that room.
    if (ingsoc?.value && isUuid(ingsoc.value)) {
        // do nothing
    } else {
        ingsoc.value = createUserIdentifer();
        ingsoc.httpOnly = true;
        ingsoc.sameSite = true;
    }

    return (
        nunjucks.render("QuizView.njk", { sessionData: {
            elapsedTime: 0,
            title: "Very cool quiz",
            playerCount: 0
         }, question: "chat, what is this?", audio_url: "assets/audio/Le-Souvenir-avec-le-crepuscule.flac" })
    )
}, {
    cookie: t.Cookie({
        ingsoc: t.Optional(t.String())
    }),
})

waypoint.ws('/ws', {
    open(ws) {
        const uuid = ws.data.cookie.ingsoc.value;
        // TODO: If user supplies a RoomId in query params,
        // subscribe the user to that room.
        if (uuid) {
            if (clientList.exists(uuid)) {
                const room = roomList.findUser(uuid)
                if (room) {
                    // TODO: get room id and subscribe
                    ws.subscribe(room.id);

                    ws.send(<>
                        <p id="room-uuid">Room: {room.id} {`(rejoined)`}</p>
                    </>)
                }
            } else {
                const client = new Client(uuid);
                clientList.append(client);
                // TODO: send client current game state

                const room = roomList.createRoom(quizList[0], client);
                ws.subscribe(room.id);

                ws.send(<>
                    <p id="room-uuid">Room: {room.id} {`(new join)`}</p>

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
        if (uuid && isUuid(uuid)) {
            const room = roomList.findUser(uuid);

            if (message.answer === room?.currentSong.songTitle) {
                const victoryHtml: string = [
                    nunjucks.render("quiz/SongInformation.njk", { metadata: room.currentSong }),
                    nunjucks.render("quiz/CoverArt.njk", { coverArtUrl: room.currentSong.coverArt }),
                    nunjucks.render("quiz/SolveStatus.njk", { solve_status: true, message: 'good job' })
                ].join();
                ws.send(victoryHtml);

                // TODO: notify other players that someone answered correctly.
                //       ws.publish('fontaine', )

            } else {
                const incorrectReponseHtml: string = nunjucks.render("quiz/SolveStatus.njk", { solve_status: false, message: 'no idiot' });
                ws.send(incorrectReponseHtml);
            }
        } else {
            ws.close();
            return;
        }
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