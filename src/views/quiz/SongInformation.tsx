import type { songMeta } from "../../utilityFunctions";

interface props {
  metadata: songMeta
}

const SongInformation: ({ }: props) => JSX.Element = ({ metadata }) => (
  <div class="text-center font-light my-3" id="song-information">
    <h2 class="font-black text-3xl text-center text-white my-3">Song information</h2>
    <p class="text-5xl" id="song-title">{metadata.songTitle}</p>
    <p class="text-lg mt-2" id="artist">{metadata.artist}</p>
    {metadata.albumTitle &&
      <><p class="text-gray-400">from</p>
        <p class="text-2xl italic" id="album">{metadata.albumTitle}</p></>
    }
  </div>
)
export default SongInformation;
