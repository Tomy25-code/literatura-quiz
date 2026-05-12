import authors from "./data/authors.json";
import works from "./data/works.json";
import questions from "./data/questions.json";

function App() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Матура БЕЛ Quiz</h1>

      <p>Автори: {authors.length}</p>
      <p>Произведения: {works.length}</p>
      <p>Въпроси: {questions.length}</p>
    </main>
  );
}

export default App;