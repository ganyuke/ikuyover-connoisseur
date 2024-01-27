document.addEventListener('alpine:init', () => {
    Alpine.data('countdown', () => ({
        time: 0,
        intervalId: -1,
        init(startTime = 0) {
            this.time = startTime
            if (this.intervalId !== -1) {
                clearInterval(this.intervalId)
            }

            this.intervalId = setInterval(() => {
                if (this.time <= 0) {
                    clearInterval(this.intervalId);
                }
                this.time--;
            }, 1000)
        }

    }))
    Alpine.data('timer', () => ({
        time: 0,
        intervalId: -1,
        getTime() {
            const seconds = Math.ceil(this.time % 60)
                .toString()
                .padStart(2, '0')
            const minutes = Math.floor(this.time / 60)
                .toString()
                .padStart(2, '0')
            return minutes + ":" + seconds
        },
        init(offset) {
            this.time = offset
            if (this.intervalId !== -1) {
                clearInterval(this.intervalId)
            }

            this.intervalId = setInterval(() => {
                this.time++;
            }, 1000)
        }

    }))
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
            if (this.audio) return

            this.audio = new Audio(url)

            this.audio.onloadedmetadata = () => {
                if (this.audio) this.duration = this.audio.duration
            }

            this.audio.ontimeupdate = () => {
                if (this.audio) this.playbackTime = this.audio.currentTime
            }

            this.audio.onended = () => {
                if (this.audio) this.audio.remove()
                this.audio = null
            }

            this.audio.play()
        }
    }))
})