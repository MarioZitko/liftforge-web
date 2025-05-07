import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/login/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import { useUserStore } from "@/store/userStore";
import { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
	const user = useUserStore((s) => s.user);
	return user ? children : <Navigate to="/login" />;
}

export function AppRoutes() {
	return (
		<BrowserRouter>
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
		</BrowserRouter>
	);
}
