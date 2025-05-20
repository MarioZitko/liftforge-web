import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import { useUserStore } from "@/store/userStore";
import { JSX } from "react";
import DashboardPage from "./pages/dashboard/DashboardPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
	const user = useUserStore((s) => s.user);
	return user ? children : <Navigate to="/login" />;
}

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/dashboard" />} />
		</Routes>
	);
}
