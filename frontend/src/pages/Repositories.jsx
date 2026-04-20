import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Repositories() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    fetch("http://127.0.0.1:8000/repositories/")
      .then(r => r.json())
      .then(data => {
        const filtered = data.filter(
          repo => repo.owner.id === user?.id
        );
        setRepos(filtered);
      });
  }, []);

  return (
    <div>
      <h2>My Repositories</h2>

      {repos.length === 0 && <p>No repositories found</p>}

      {repos.map(r => (
        <div key={r.id} style={card}>
          <Link to={`/repo/${r.id}`} style={link}>
            <h3>{r.owner.username}/{r.name}</h3>
          </Link>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "#161b22",
  padding: 15,
  marginBottom: 10,
  borderRadius: "8px",
  border: "1px solid #30363d"
};

const link = {
  textDecoration: "none",
  color: "#58a6ff"
};