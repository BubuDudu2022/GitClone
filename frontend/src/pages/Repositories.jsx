import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Repositories() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/repositories/")
      .then(r => r.json())
      .then(setRepos);
  }, []);

  return (
    <div>
      <h2>Repositories</h2>
      {repos.map(r => (
        <div key={r.id} style={card}>
          <Link to={`/repo/${r.id}`}><h3>{r.name}</h3></Link>
        </div>
      ))}
    </div>
  );
}

const card = { background: "#161b22", padding: 15, marginBottom: 10 };