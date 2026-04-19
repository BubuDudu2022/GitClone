import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000/";

export default function RepoDetail() {
  const { id } = useParams();

  const [tab, setTab] = useState("code");
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [prs, setPrs] = useState([]);
  const [collabs, setCollabs] = useState([]);

  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("contributor");

  const [selectedPR, setSelectedPR] = useState(null);
  const [prDetails, setPrDetails] = useState(null);
  const [comment, setComment] = useState("");

  const [form, setForm] = useState({
    title: "",
    file_path: "",
    code: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ POST HELPER
  const post = (url, body, callback) => {
    fetch(API + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        user_id: user?.id,
        repo_id: id
      })
    })
      .then(r => r.json())
      .then(() => callback && callback());
  };

  // ✅ LOAD PR DETAILS
  const loadPR = (prId) => {
    fetch(`${API}pull-requests/${prId}/`)
      .then(r => r.json())
      .then(data => {
        setSelectedPR(prId);
        setPrDetails(data);
      });
  };

  // ✅ LOAD DATA
  // ✅ LOAD ALL DATA
  const loadData = () => {
    fetch(`${API}repositories/${id}/`)
      .then(r => r.json())
      .then(setRepo);

    fetch(`${API}files/?repo_id=${id}`).then(r => r.json()).then(setFiles);
    fetch(`${API}pull-requests/?repo_id=${id}`).then(r => r.json()).then(setPrs);
    fetch(`${API}collaborators/?repo_id=${id}`).then(r => r.json()).then(setCollabs);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  return (

    <div>
      
      <h2>
        {repo ? `${repo.owner.username}/${repo.name}` : "Loading..."}
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 20 }}>
        <button onClick={() => setTab("code")}>Code</button>
        <button onClick={() => setTab("prs")}>PRs</button>
        <button onClick={() => setTab("collab")}>Collaborators</button>
      </div>

      {/* ================= CODE TAB ================= */}
      {tab === "code" && (
        <div>
          <h3>Files</h3>

          {files.length === 0 && <p>No files yet</p>}

          {files.map(f => (
            <details key={f.id} style={card}>
              <summary>{f.file_path}</summary>
              <pre>{f.content}</pre>
            </details>
          ))}

          {/* ADD CODE */}
          <div style={card}>
            <h3 style={{ marginBottom: "15px" }}>Add Code</h3>

            <div style={formGroup}>
              <label style={label}>Title</label>
              <input
                style={input}
                placeholder="Enter PR title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div style={formGroup}>
              <label style={label}>File Path</label>
              <input
                style={input}
                placeholder="e.g. src/App.js"
                value={form.file_path}
                onChange={e => setForm({ ...form, file_path: e.target.value })}
              />
            </div>

            <div style={formGroup}>
              <label style={label}>Code</label>
              <textarea
                style={textarea}
                placeholder="Write your code here..."
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <button
              style={button}
              onClick={() => post("pull-requests/", form, loadData)}
            >
              Submit Code
            </button>
          </div>
        </div>
      )}

      {/* ================= PR TAB ================= */}
      {tab === "prs" && (
        <div>
          <h3>Pull Requests</h3>

          {prs.length === 0 && <p>No PRs yet</p>}

                  {prs.map(pr => (
          <div key={pr.id} style={prCard}>
            
            {/* HEADER */}
            <div style={prHeader}>
              <div>
                <h4 style={{ margin: 0 }}>{pr.title}</h4>

                <p style={{ margin: "4px 0", color: "#8b949e", fontSize: "13px" }}>
                     By: {pr.created_by}
                </p>
                <span style={statusBadge(pr.status)}>
                  {pr.status}
                </span>
              </div>

              <button style={viewBtn} onClick={() => loadPR(pr.id)}>
                View
              </button>
            </div>

            {/* DETAILS */}
            {selectedPR === pr.id && prDetails && (
              <div style={prDetailsBox}>
                
                <h4>Code</h4>
                <pre style={codeBlock}>{prDetails.code}</pre>

                {/* COMMENTS */}
                <h4>Comments</h4>

                {prDetails.comments.length === 0 ? (
                  <p style={{ color: "#8b949e" }}>No comments yet</p>
                ) : (
                  prDetails.comments.map((c, i) => (
                    <div key={i} style={commentBox}>
                      <b>{c.user}</b>
                      <p>{c.comment}</p>
                    </div>
                  ))
                )}

                {/* ADD COMMENT */}
                <div style={commentInputBox}>
                  <input
                    style={input}
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />

                  <button
                    style={commentBtn}
                    onClick={() => {
                      post("pr-comments/", {
                        pr_id: pr.id,
                        comment: comment
                      }, () => loadPR(pr.id));
                    }}
                  >
                    Comment
                  </button>
                </div>

              </div>
            )}

            {/* ACTIONS */}
            <div style={actionRow}>
              <button
                style={rejectBtn}
                onClick={() => post("reviews/", {
                  pr_id: pr.id,
                  status: "rejected"
                }, loadData)}
              >
                Reject
              </button>

              <button
                style={mergeBtn}
                onClick={() => post(`pull-requests/${pr.id}/action/`, {
                  action: "merge"
                }, loadData)}
              >
                Merge
              </button>
            </div>

          </div>
        ))}
        </div>
      )}

        {tab === "collab" && (
      <div>
        <h3>Collaborators</h3>

        {/* ADD USER */}
        <div style={card}>
          <h4>Add Collaborator</h4>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              style={input}
              placeholder="Enter User ID"
              value={newUserId}
              onChange={e => setNewUserId(e.target.value)}
            />

            <select
              style={input}
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
            >
              <option value="contributor">Contributor</option>
              <option value="maintainer">Maintainer</option>
            </select>

            <button
              style={button}
              onClick={() => {
                post("collaborators/", {
                  username: newUserId,
                  role: newRole,
                  added_by: user?.id
                }, loadData);
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* LIST */}
        {collabs.map(c => (
          <div key={c.user_id} style={collabCard}>
            
            <div>
              <b style={{ fontSize: "16px" }}>{c.username}</b>
              <p style={{ color: "#8b949e", margin: 0 }}>
                ID: {c.user_id}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              
              <span style={roleBadge(c.role)}>
                {c.role}
              </span>

              <button
                style={removeBtn}
                onClick={() => {
                  fetch(API + "collaborators/", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user_id: c.user_id,
                      repo_id: id
                    })
                  }).then(loadData);
                }}
              >
                Remove
              </button>

            </div>
          </div>
        ))}
      </div>
    )}
    </div>
  );
}

const card = {
  background: "#161b22",
  padding: 15,
  marginBottom: 10,
  borderRadius: "8px"
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
  minHeight: "200px",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #30363d",
  background: "#0d1117",
  color: "#c9d1d9",
  fontFamily: "monospace",
  fontSize: "14px",
  resize: "vertical"
};

const button = {
  padding: "10px 15px",
  background: "#238636",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

const prCard = {
  background: "#161b22",
  padding: 15,
  marginBottom: 15,
  borderRadius: "10px",
  border: "1px solid #30363d"
};

const prHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px"
};

const prDetailsBox = {
  marginTop: "10px",
  padding: "10px",
  background: "#0d1117",
  borderRadius: "8px"
};

const codeBlock = {
  background: "#010409",
  padding: "10px",
  borderRadius: "6px",
  overflowX: "auto",
  fontFamily: "monospace"
};

const actionRow = {
  marginTop: "10px",
  display: "flex",
  gap: "10px"
};

const viewBtn = {
  padding: "6px 12px",
  background: "#1f6feb",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

const mergeBtn = {
  padding: "8px 14px",
  background: "#238636",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

const rejectBtn = {
  padding: "8px 14px",
  background: "#da3633",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

const commentBox = {
  background: "#161b22",
  padding: "8px",
  borderRadius: "6px",
  marginBottom: "6px"
};

const commentInputBox = {
  display: "flex",
  gap: "10px",
  marginTop: "10px"
};

const commentBtn = {
  padding: "8px 12px",
  background: "#238636",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

const statusBadge = (status) => ({
  display: "inline-block",
  marginTop: "5px",
  padding: "3px 8px",
  borderRadius: "20px",
  fontSize: "12px",
  background:
    status === "merged"
      ? "#238636"
      : status === "rejected"
      ? "#da3633"
      : "#1f6feb",
  color: "white"
});

const collabCard = {
  background: "#161b22",
  padding: "12px 15px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #30363d",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const roleBadge = (role) => ({
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  background:
    role === "owner"
      ? "#8957e5"
      : role === "maintainer"
      ? "#1f6feb"
      : "#30363d",
  color: "white"
});

const removeBtn = {
  padding: "6px 10px",
  background: "#da3633",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};