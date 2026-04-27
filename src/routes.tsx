import LoginPage from "@/pages/auth/LoginPage";
import { useUserStore } from "@/store/userStore";
import { JSX } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireRole } from "./lib/RequireRole";
import AdminExercisesPage from "./pages/admin/AdminExercisesPage";
import AdminPage from "./pages/admin/AdminPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import ConfirmEmailPage from "./pages/auth/ConfirmEmailPage";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage";
import OAuthFinalizePage from "./pages/auth/OAuthFinalizePage";
import RegisterPage from "./pages/auth/RegisterPage";
import RequestPasswordResetPage from "./pages/auth/RequestPasswordResetPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailRequestPage from "./pages/auth/VerifyEmailRequestPage";
import ClientsLookingForCoachPage from "./pages/clients/ClientsLookingForCoachPage";
import ClientsPage from "./pages/clients/ClientsPage";
import CoachDashboardPage from "./pages/dashboard/CoachDashboardPage";
import ClientExercisesPage from "./pages/exercises/ClientExercisesPage";
import CoachExercisesPage from "./pages/exercises/CoachExercisesPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import CoachProgramsPage from "./pages/programs/CoachProgramsPage";
import ClientProgramsPage from "./pages/programs/ClientProgramsPage";

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
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/forgot-password" element={<RequestPasswordResetPage />} />
      <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
      <Route path="/oauth-finalize" element={<OAuthFinalizePage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RequireRole allow={["ADMIN"]}>
              <AdminPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RequireRole allow={["ADMIN"]}>
              <AdminUsersPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exercises"
        element={
          <ProtectedRoute>
            <RequireRole allow={["ADMIN"]}>
              <AdminExercisesPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />

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
      <Route
        path="/clients/looking-for-coach"
        element={
          <ProtectedRoute>
            <RequireRole allow={["COACH", "ADMIN"]}>
              <ClientsLookingForCoachPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />

      <Route
        path="/programs"
        element={
          <ProtectedRoute>
            <RequireRole allow={["COACH", "ADMIN"]}>
              <CoachProgramsPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-programs"
        element={
          <ProtectedRoute>
            <RequireRole allow={["CLIENT", "ADMIN"]}>
              <ClientProgramsPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/exercises"
        element={
          <ProtectedRoute>
            <RequireRole allow={["COACH", "ADMIN"]}>
              <CoachExercisesPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/exercises"
        element={
          <ProtectedRoute>
            <RequireRole allow={["CLIENT", "ADMIN"]}>
              <ClientExercisesPage />
            </RequireRole>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
