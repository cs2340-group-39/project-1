import "./App.css";

interface Data {
  data: any;
}

function App({ data }: Data) {
  return (
    <>
      <h1>{data.message}</h1>
    </>
  );
}

export default App;
