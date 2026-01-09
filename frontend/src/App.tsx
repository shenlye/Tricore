import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LoginPage from "@/pages/LoginPage";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate replace to="/login" />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/dashboard" element={<DashboardPage />} />
		</Routes>
	);
}
