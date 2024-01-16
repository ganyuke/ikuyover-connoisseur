const SolveStatus = (props: { solved: boolean, message?: string }) => {
    if (props.solved) {
        return <p id="solve-status" class="text-center text-green-500">{props.message}</p>
    } else {
        return <p id="solve-status" class="text-center text-red-500">{props.message}</p>
    }
}

export default SolveStatus;