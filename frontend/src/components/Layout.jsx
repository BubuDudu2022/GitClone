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
    <div style={{ background: "#0d1117", minHeight: "100vh", color: "white" }}>
      
      {/* Navbar */}
      <div style={{ background: "#161b22", padding: "15px 40px", display: "flex", justifyContent: "space-between" }}>
        
        <div>
          <Link to="/" style={link}>Home</Link>
          <Link to="/repos" style={link}>Repositories</Link>
          <Link to="/prs" style={link}>Pull Requests</Link>
          <Link to="/create-repo" style={link}>Create Repo</Link>
        </div>

        <div>
          {!user ? (
            <>
              <button onClick={() => { setShowModal(true); setIsLogin(true); }}>Login</button>
              <button onClick={() => { setShowModal(true); setIsLogin(false); }} style={{ marginLeft: "10px" }}>
                Register
              </button>
            </>
          ) : (
            <>
              <span style={{ marginRight: "10px" }}>
                👤 {JSON.parse(user).username}
              </span>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>{isLogin ? "Login" : "Register"}</h3>

            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br /><br />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button onClick={handleAuth}>
              {isLogin ? "Login" : "Register"}
            </button>

            <p
              style={{ cursor: "pointer", marginTop: "10px" }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Create account" : "Already have an account?"}
            </p>

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

const link = { marginRight: "20px", color: "#58a6ff" };

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
  borderRadius: "10px",
  width: "300px"
};