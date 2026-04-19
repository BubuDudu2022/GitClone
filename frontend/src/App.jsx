import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Repositories from "./pages/Repositories";
import RepoDetail from "./pages/RepoDetail";
import PRs from "./pages/PRs";
import CreateRepo from "./pages/CreateRepo";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/repos" element={<Repositories />} />
          <Route path="/repo/:id" element={<RepoDetail />} />
          <Route path="/prs" element={<PRs />} />
          <Route path="/create-repo" element={<CreateRepo />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}