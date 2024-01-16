import { asTimestamp } from "../../utilityFunctions";
import CoverArt from "./CoverArt";

interface props {
  coverArtUrl: string,
  playbackTime: number,
  duration: number,
  showInfo: boolean
}

const VisualColumn: ({ }: props) => JSX.Element = ({ coverArtUrl, showInfo }) => (
  <div id="visual-column">
    <div id="cover-art" class="from-[#7dcefc] to-[#8dbc85] bg-gradient-to-b rounded-lg p-4">
      <CoverArt coverArtUrl={showInfo ? coverArtUrl : undefined} />
    </div>
    <div id="playback-indicator" class="bg-brand-card rounded-lg mt-4 p-4 relative" x-data="playback" x-on:click={`create()`}>
      <label for="waveform" class="text-gray-400 absolute bottom-2">
        <span x-text="asTimestamp(playbackTime)"></span> / <span x-text="asTimestamp(duration)"></span>
      </label>
      <progress id="waveform" x-bind:max="duration" x-bind:value="playbackTime"></progress>
    </div>
  </div>
)
export default VisualColumn;
