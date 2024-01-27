import { roomList, trinty } from ".";
import type { Client } from "./clients";
import { quizList } from "./grossLists";

export const fullPageGenerate = (client: Client, room?: string) => {
    if (client) {
        client.updateLastSeen();
        const currentRoom = client.currentRoom ? roomList.findRoom(client.currentRoom) : room ? roomList.findRoom(room) : null;
        if (currentRoom) {
            if (currentRoom.currentState === 1) {
                const audio = currentRoom.currentQuestion?.resources.find((resource) => resource.type === "audio")?.url ?? null;
                const data = {
                    sessionData: {
                        elapsedTime: Math.floor(currentRoom.timeSinceStart / 1000),
                        players: currentRoom.players,
                        title: currentRoom.quizMetadata.title,
                        uuid: currentRoom.id
                    },
                    audio_url: audio,
                    question: currentRoom.currentQuestion?.prompt
                }
                return (
                    trinty.render("QuizView.njk", data)
                )
            } else {
                const data = {
                    sessionData: {
                        elapsedTime: Math.floor(currentRoom.timeSinceStart / 1000),
                        players: currentRoom.players,
                        title: currentRoom.quizMetadata.title,
                        uuid: currentRoom.id
                    },
                    client_id: client.uuid
                }
                return (
                    trinty.render("LobbyView.njk", data)
                )
            }
        }
    }

    return (
        trinty.render("JoinView.njk")
    )
}

export const sendToRoom = (client: Client) => {
    client.updateLastSeen();
    if (client.currentRoom) {
        return new Response(null, { status: 400 });
    } else {
        const room = roomList.createRoom(quizList[0], client);
        const data = {
            sessionData: {
                elapsedTime: Math.floor(room.timeSinceStart / 1000),
                players: room.players,
                title: room.quizMetadata.title,
                uuid: room.id
            }
        }
        const htmlReplacements = [
            trinty.render("quiz/QuizHeading.njk", data),
            trinty.render("lobby/LobbyWorkspace.njk", data)
        ].join();
        return (
            htmlReplacements
        )
    }
}

export const wsHydrateQuestion = (client: Client) => {
    if (client.currentRoom) {
        const room = roomList.findRoom(client.currentRoom);
        if (!room) return;
        if (room.currentState === 0) room.startGame(client.uuid); // We need to start the game so currentQuestion can exist
        const audio = room.currentQuestion?.resources.find((resource) => resource.type === "audio")?.url ?? null;
        const data = {
            sessionData: {
                elapsedTime: Math.floor(room.timeSinceStart / 1000),
                players: room.players,
                title: room.quizMetadata.title,
                uuid: room.id
            },
            audio_url: audio,
            question: room.currentQuestion?.prompt
        }
        return trinty.render("quiz/QuizWorkspace.njk", data);
    }
}

export const wsHydrateAnswer = (client: Client, answer: string) => {
    if (client.currentRoom) {
        const room = roomList.findRoom(client.currentRoom);
        if (!room) return;
        const question = room.currentQuestion;
        if (answer && room.submitAnswer(client.uuid, answer)) {
            const victoryHtml: string = [
                trinty.render("quiz/SongInformation.njk", { metadata: question?.data?.[0] }),
                trinty.render("quiz/CoverArt.njk", { coverArtUrl: question?.resources.find((entry) => entry.type === "cover")?.url }),
                trinty.render("quiz/SolveStatus.njk", { solve_status: true, message: 'good job' })
            ].join();
            return victoryHtml;

            // TODO: notify other players that someone answered correctly.
            //       ws.publish('fontaine', )

        } else {
            const incorrectReponseHtml: string = trinty.render("quiz/SolveStatus.njk", { solve_status: false, message: 'no idiot' });
            return incorrectReponseHtml;
        }
    }
}