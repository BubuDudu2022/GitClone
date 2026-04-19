import { useState } from "react";

export default function CreateRepo() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // ✅ FIX
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name) {
      setMessage("Repository name is required");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setMessage("❌ Please login first");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://127.0.0.1:8000/repositories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description,  // ✅ FIX
          owner_id: user.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Repository created successfully!");
        setName("");
        setDescription(""); // reset
      } else {
        setMessage(data.error || "Something went wrong");
      }

    } catch (err) {
      setMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Repository</h2>

      <input
        placeholder="Repository name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <button onClick={create} disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>

      <p>{message}</p>
    </div>
  );
}