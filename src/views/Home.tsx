import BaseLayout from "./BaseLayout";

interface HomePageProps {
    logo?: string;
}

const HomePage = (props: HomePageProps) => (
    <BaseLayout>
    <div class="App">
        <header class="App-header">
            <img src={props.logo} class="App-logo" alt="logo" />
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                class="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
        </header>
    </div>
    </BaseLayout>
)

export default HomePage;