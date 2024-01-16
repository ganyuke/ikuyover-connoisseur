import { asTimestamp, type songMeta } from "../utilityFunctions"
import BaseLayout from "./BaseLayout"
import InteractableQuestion from "./quiz/InteractableQuestion"
import SongInformation from "./quiz/SongInformation"
import VisualColumn from "./quiz/VisualColumn"

// let audio: HTMLAudioElement | null
let songIndex = 0

type quizMeta = {
  title: string
  elapsedTime: number // in seconds
  playerCount: number
}

const quizList: quizMeta[] = [
  { title: `Quiz Name 1 - Fontaine's Waltz & Tangos`, elapsedTime: 100, playerCount: 10 }
]



// https://www.lichter.io/articles/nuxt3-vue3-dynamic-images/#the-importmetaglob-trick
/*const covers: { [key: string]: { default: string } } = import.meta.glob(
  '@/assets/images/covers/*.jpg',
  { eager: true }
)
const coverImages = Object.fromEntries(
  Object.entries(covers).map(([key, value]) => [key.split('/').pop(), value.default])
)

const audios: { [key: string]: { default: string } } = import.meta.glob('@/assets/audio/*.flac', {
  eager: true
})
const audioUrls = Object.fromEntries(
  Object.entries(audios).map(([key, value]) => [key.split('/').pop(), value.default])
)*/


const nextSongSeconds = 0
const songMetadata = {
  artist: '',
  songTitle: '',
  albumTitle: '',
  coverArt: '',
  audioUrl: ''
}
let quizMetadata: quizMeta = quizList[0]

const getCoverArt = (filename: string) => {
  // return coverImages[filename]
  return "a"
}

const getAudioSrc = (filename: string) => {
  // return audioUrls[filename]
  return "a"
}

/*
const playAudio = async () => {
  // exit early if audio already exists
  if (audio) {
    return
  }

  audio = new Audio(audioUrls[songMetadata.value.audioUrl])
  audio.onloadedmetadata = () => {
    if (audio) duration.value = audio.duration
  }
  audio.ontimeupdate = () => {
    if (audio) playbackTime.value = audio.currentTime
  }
  audio.onended = () => {
    if (audio) audio.remove()
    audio = null
  }
  audio.play()
}

const nextSong = async () => {
  if (audio) audio = null
  if (songIndex + 1 < songList.length) songIndex++
  songMetadata.value = songList[songIndex]
}*/


const QuizView = () => (
  <BaseLayout>
    <div class="max-w-[50em] sm:mx-auto my-20 mx-4" hx-ext="ws" ws-connect="/ws">
      <div class="my-4">
        <p id="room-uuid">uuid</p>
        <h1 class="font-black text-white text-4xl my-3 uppercase">{quizMetadata.title}</h1>
        <p class="font-black text-gray-500 text-lg">
          <span>{asTimestamp(quizMetadata.elapsedTime)}</span> -
          <span>{quizMetadata.playerCount}</span> players
        </p>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <VisualColumn coverArtUrl={songMetadata.coverArt} playbackTime={0} duration={420} showInfo={false} />
        <div class="bg-brand-card rounded-lg">
          <InteractableQuestion />
          <SongInformation metadata={songMetadata} />
        </div>
        <div></div>
        <div class="ml-auto mx-5">
          <p class="text-gray-400">Next song in {nextSongSeconds} second(s)</p>
        </div>
      </div>
    </div>
  </BaseLayout>
)
export default QuizView;