import SolveStatus from "./SolveStatus";

interface props {
  question?: string;
}

const InteractableQuestion: ({ }: props) => JSX.Element = ({ question = "Name that song!" }) => (
  <div class="my-4" id="interactable-question">
    <h2 class="font-black text-3xl text-center text-white uppercase">{question}</h2>
    <form class="text-center my-3 w-full" ws-send method="post">
      <input
        type="text"
        id="answer-submitter"
        name="answer"
        required
        class="bg-[#393c48] text-center text-white h-16 text-2xl"
      />
    </form>
    <SolveStatus solved={false} />
  </div>
)

export default InteractableQuestion;