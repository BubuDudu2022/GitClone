import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://127.0.0.1:8000/";

export default function Home() {
  const [stats, setStats] = useState({});
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch(API).then(r => r.json()).then(setStats);
    fetch(API + "repositories/").then(r => r.json()).then(setRepos);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <Card label="Repos" value={stats.total_repositories} />
        <Card label="Open PR" value={stats.open_prs} />
        <Card label="Merged PR" value={stats.merged_prs} />
      </div>

      <h3>Repositories</h3>
      {repos.map(r => (
        <div key={r.id} style={row}>
          <Link to={`/repo/${r.id}`}>{r.owner.username}/{r.name}</Link>
        </div>
      ))}
    </div>
  );
}

const Card = ({ label, value }) => (
  <div style={{ background: "#161b22", padding: 20, flex: 1 }}>
    <h2>{value}</h2>
    <p>{label}</p>
  </div>
);

const row = { padding: 10, borderBottom: "1px solid #30363d" };