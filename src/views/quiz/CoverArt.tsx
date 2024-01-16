interface props {
    coverArtUrl?: string,
}

const CoverArt: ({ }: props) => JSX.Element = ({ coverArtUrl }) => {
    if (coverArtUrl) {
        return (<img src={coverArtUrl} class="w-full" />)
    } else {
        return (
            <div class="w-full aspect-square flex">
                <p class="text-8xl my-auto mx-auto">?</p>
            </div>
        )
    }
}

export default CoverArt;