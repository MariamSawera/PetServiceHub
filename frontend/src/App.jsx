import { useEffect } from "react";
import api from "./lib/axios.js";


function App() {
  useEffect(() => {
    api.get("/api/health")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h1 className="text-blue-500">Frontend running ⚛️</h1>;
  <button className="btn btn-primary">hello</button>
  

}

export default App;
