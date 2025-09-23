import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute } from "./PublicRoutes/PublicRoute";
import { AuthCallbackPage, LoginPage, RegisterPage, ResetPasswordPage } from "../pages/auth";
import { DashboardLayout } from "@/components/dashboard";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import { RoutineBuilderPage, RoutineDetailPage, RoutinesPage } from "@/pages/dashboard/routines";

import SettingsPage from "@/pages/dashboard/settings/SettingsPage";
import { ExerciseListPage } from "@/features/exercises";
import WorkoutLivePage from "@/pages/dashboard/workouts/WorkoutLivePage";
import OnboardingPage from "@/pages/auth/OnboardingPage";
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoute";

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

      {/* 👇 NUEVA RUTA: Onboarding (requiere sesión, permite perfil incompleto) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute allowIncomplete>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

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
      {/* Added unified builder routes for create and edit */}
      <Route
        path="/dashboard/routines/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RoutineBuilderPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/routines/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RoutineBuilderPage />
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
        path="/dashboard/workout/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WorkoutLivePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/ejercicios"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ExerciseListPage />
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
      <Route path="/rutinas/crear" element={<Navigate to="/dashboard/routines/new" />} />
      {/* Updated legacy route to use new builder */}
      <Route path="/rutinas/:id" element={<Navigate to="/dashboard/routines/:id" />} />
      <Route path="/rutinas/:id/editar" element={<Navigate to="/dashboard/routines/:id/edit" />} />
    </Routes>
  );
}
