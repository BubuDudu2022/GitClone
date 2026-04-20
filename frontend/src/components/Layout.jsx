import { Link } from "react-router-dom";
import { useState } from "react";

export default function Layout({ children }) {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const user = localStorage.getItem("user");

  const handleAuth = async () => {
    const url = isLogin
      ? "http://127.0.0.1:8000/login/"
      : "http://127.0.0.1:8000/register/";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      setShowModal(false);
      window.location.reload();
    } else {
      alert(data.error || "Error");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div style={container}>
      
      {/* NAVBAR */}
      <div style={navbar}>
        <div style={navLeft}>
          <Link to="/" style={logo}>MiniGit</Link>

          <Link to="/repos" style={link}>Repositories</Link>
          <Link to="/create-repo" style={link}>Create Repo</Link>
        </div>

        <div style={navRight}>
          {!user ? (
            <>
              <button style={secondaryBtn} onClick={() => { setShowModal(true); setIsLogin(true); }}>
                Login
              </button>
              <button style={primaryBtn} onClick={() => { setShowModal(true); setIsLogin(false); }}>
                Register
              </button>
            </>
          ) : (
            <>
              <span style={userBadge}>
                👤 {JSON.parse(user).username}
              </span>
              <button style={dangerBtn} onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginBottom: "20px" }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            <input
              style={input}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              style={input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button style={primaryBtnFull} onClick={handleAuth}>
              {isLogin ? "Login" : "Register"}
            </button>

            <p style={switchText} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Create account" : "Already have an account?"}
            </p>

            <button style={closeBtn} onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div style={content}>
        {children}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  background: "#0d1117",
  minHeight: "100vh",
  color: "white"
};

const navbar = {
  background: "#161b22",
  padding: "12px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #30363d"
};

const navLeft = {
  display: "flex",
  alignItems: "center",
  gap: "20px"
};

const navRight = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const logo = {
  fontWeight: "bold",
  fontSize: "18px",
  color: "#58a6ff",
  textDecoration: "none"
};

const link = {
  color: "#c9d1d9",
  textDecoration: "none",
  fontSize: "14px"
};

const userBadge = {
  marginRight: "10px",
  fontSize: "14px",
  color: "#8b949e"
};

/* BUTTONS */
const primaryBtn = {
  padding: "6px 12px",
  background: "#238636",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

const primaryBtnFull = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  background: "#238636",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

const secondaryBtn = {
  padding: "6px 12px",
  background: "transparent",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

const dangerBtn = {
  padding: "6px 12px",
  background: "#da3633",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

/* MODAL */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalBox = {
  background: "#161b22",
  padding: "30px",
  borderRadius: "12px",
  width: "320px",
  border: "1px solid #30363d",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const input = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #30363d",
  background: "#0d1117",
  color: "#c9d1d9"
};

const switchText = {
  textAlign: "center",
  cursor: "pointer",
  color: "#58a6ff",
  fontSize: "14px"
};

const closeBtn = {
  marginTop: "10px",
  background: "transparent",
  border: "1px solid #30363d",
  color: "white",
  padding: "6px",
  borderRadius: "6px",
  cursor: "pointer"
};

const content = {
  maxWidth: "1000px",
  margin: "auto",
  padding: "20px"
};