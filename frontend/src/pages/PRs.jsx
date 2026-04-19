import { useState } from "react";

export default function PRs() {
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user"));

  const getPR = () => {
    fetch(`http://127.0.0.1:8000/pull-requests/${id}/?user_id=${user?.id}`)
      .then(r => r.json())
      .then(setData);
  };

  return (
    <div>
      <input onChange={e => setId(e.target.value)} placeholder="PR ID" />
      <button onClick={getPR}>Get</button>

      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}