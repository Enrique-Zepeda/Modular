import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes/ProtectedRoute";
import { PublicRoute } from "./PublicRoutes/PublicRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import RoutinesPage from "@/pages/dashboard/routines/RoutinesPage";
import CreateRoutinePage from "@/pages/dashboard/routines/CreateRoutinePage";
import RoutineDetailPage from "@/pages/dashboard/routines/RoutineDetailPage";
import { LoginPage, RegisterPage, ResetPasswordPage } from "../pages/auth";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import SettingsPage from "@/pages/dashboard/settings/SettingsPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Dashboard Routes with Persistent Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/routines"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RoutinesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/routines/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CreateRoutinePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/routines/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RoutineDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy routes for compatibility */}
      <Route path="/rutinas" element={<Navigate to="/dashboard/routines" />} />
      <Route path="/rutinas/crear" element={<Navigate to="/dashboard/routines/create" />} />
      <Route path="/rutinas/:id" element={<Navigate to="/dashboard/routines/:id" />} />
    </Routes>
  );
}
