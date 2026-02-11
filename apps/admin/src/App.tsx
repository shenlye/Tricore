import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LinksPage from "@/pages/dashboard/links";
import PostsPage from "@/pages/dashboard/posts";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/posts" element={<PostsPage />} />
      <Route path="/dashboard/links" element={<LinksPage />} />
    </Routes>
  );
}
