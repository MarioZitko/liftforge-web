import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import { useUserStore } from "@/store/userStore";
import { JSX } from "react";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import ConfirmEmailPage from "./pages/auth/ConfirmEmailPage";
import VerifyEmailRequestPage from "./pages/auth/VerifyEmailRequestPage";
import { RequireRole } from "./lib/RequireRole";
import CoachDashboardPage from "./pages/dashboard/CoachDashboardPage";
import ClientsPage from "./pages/clients/ClientsPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";

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
			<Route path="/oauth-callback" element={<OAuthCallbackPage />} />

			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<RequireRole allow={["COACH", "ADMIN"]}>
							<CoachDashboardPage />
						</RequireRole>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/clients"
				element={
					<ProtectedRoute>
						<RequireRole allow={["COACH", "ADMIN"]}>
							<ClientsPage />
						</RequireRole>
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<HomePage />} />
		</Routes>
	);
}
