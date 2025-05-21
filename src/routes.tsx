import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import { useUserStore } from "@/store/userStore";
import { JSX } from "react";
import DashboardPage from "./pages/dashboard/DashboardPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import ConfirmEmailPage from "./pages/auth/ConfirmEmailPage";
import VerifyEmailRequestPage from "./pages/auth/VerifyEmailRequestPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
	const user = useUserStore((s) => s.user);
	return user ? children : <Navigate to="/login" />;
}

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/confirm-email" element={<ConfirmEmailPage />} />
			<Route path="/verify-email" element={<VerifyEmailRequestPage />} />
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<HomePage />} />
		</Routes>
	);
}
