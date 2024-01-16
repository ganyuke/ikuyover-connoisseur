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

        create(url) {
            if (this.audio) return;

            this.audio = new Audio(url)

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
    }))
})