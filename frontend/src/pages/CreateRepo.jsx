import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateRepo() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ✅ for redirect

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
          description,
          owner_id: user.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Repository created successfully!");

        // 🔥 Redirect after short delay
        setTimeout(() => {
          navigate("/repos"); // change if your route is different
        }, 1000);

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
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Create New Repository</h2>

        <div style={formGroup}>
          <label style={label}>Repository Name</label>
          <input
            style={input}
            placeholder="e.g. my-awesome-project"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={formGroup}>
          <label style={label}>Description (optional)</label>
          <textarea
            style={textarea}
            placeholder="Write a short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button style={button} onClick={create} disabled={loading}>
          {loading ? "Creating..." : "Create Repository"}
        </button>

        {message && <p style={messageStyle}>{message}</p>}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0d1117"
};

const card = {
  width: "400px",
  background: "#161b22",
  padding: "30px",
  borderRadius: "12px",
  border: "1px solid #30363d",
  boxShadow: "0 0 20px rgba(0,0,0,0.5)"
};

const title = {
  marginBottom: "20px",
  textAlign: "center"
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "15px"
};

const label = {
  marginBottom: "6px",
  fontSize: "14px",
  color: "#8b949e"
};

const input = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #30363d",
  background: "#0d1117",
  color: "#c9d1d9",
  outline: "none"
};

const textarea = {
  minHeight: "100px",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #30363d",
  background: "#0d1117",
  color: "#c9d1d9",
  resize: "vertical"
};

const button = {
  width: "100%",
  padding: "12px",
  background: "#238636",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
  marginTop: "10px"
};

const messageStyle = {
  marginTop: "15px",
  textAlign: "center",
  fontSize: "14px"
};