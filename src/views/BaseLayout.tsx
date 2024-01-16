const BaseLayout: Html.Component = (props) => (
<html lang="en" class="font-sans bg-brand-dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Connoisseur</title>
    <link rel="stylesheet" type="text/css" href="/main.css" />
    <link rel="stylesheet" type="text/css" href="/uno.css" />
    <link href="https://cdn.skypack.dev/sanitize.css" rel="stylesheet" />  </head>
  <body>
    <div id="app">
      {props.children}
    </div>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <script src="https://unpkg.com/htmx.org/dist/ext/ws.js"></script>
    <script src="//unpkg.com/alpinejs" defer></script>
    <><script>
    {`
    document.addEventListener('alpine:init', () => {
        Alpine.data('playback', () => ({
            duration: 0,
            playbackTime: 0,
            audio: null,

            asTimestamp(time) {
              const seconds = Math.ceil(time % 60)
                .toString()
                .padStart(2, '0')
              const minutes = Math.floor(time / 60)
                .toString()
                .padStart(2, '0')
              return minutes + ":" + seconds
            },

            create() {
                if (this.audio) return;

                this.audio = new Audio("/assets/audio/Fontaine.flac")
                
                this.audio.onloadedmetadata = () => {
                    if (this.audio) this.duration = this.audio.duration
                    console.log(this.duration)
                }
                
                this.audio.ontimeupdate = () => {
                    if (this.audio) this.playbackTime = this.audio.currentTime
                    console.log(this.playbackTime)
                }
                
                this.audio.onended = () => {
                    if (this.audio) this.audio.remove()
                    this.audio = null
                }
                
                this.audio.play()
            }
        }))})
    `}   
</script></>
  </body>
</html>
)
export default BaseLayout;