import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute } from "./PublicRoutes/PublicRoute";
import { AuthCallbackPage, LoginPage, RegisterPage, ResetPasswordPage } from "../pages/auth";
import { DashboardLayout } from "@/components/dashboard";

import { RoutineBuilderPage, RoutineDetailPage, RoutinesPage } from "@/pages/dashboard/routines";
import SettingsPage from "@/pages/dashboard/settings/SettingsPage";
import { ExerciseListPage } from "@/features/exercises";
import WorkoutLivePage from "@/pages/dashboard/workouts/WorkoutLivePage";
import OnboardingPage from "@/pages/auth/OnboardingPage";
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoute";
import FriendsPage from "@/pages/friends/FriendsPage";
import NotificationsPage from "@/pages/dashboard/settings/NotificationsPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import ProfilePage from "@/pages/profile/ProfilePage";

/** ✅ NUEVO: FriendsPage */


import RecomendacionPage from "@/pages/RecomendacionPage";

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

      {/* ⚠️ SIN GUARDIAS */}
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Onboarding (requiere sesión, permite perfil incompleto) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute allowIncomplete>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Dashboard con layout persistente */}
      <Route
        path="/recomendacion"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RecomendacionPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
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

      {/* ✅ NUEVO: Friends */}
      <Route
        path="/dashboard/friends"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FriendsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/u/:username"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy redirects */}
      <Route path="/rutinas" element={<Navigate to="/dashboard/routines" />} />
      <Route path="/rutinas/crear" element={<Navigate to="/dashboard/routines/new" />} />
      <Route path="/rutinas/:id" element={<Navigate to="/dashboard/routines/:id" />} />
      <Route path="/rutinas/:id/editar" element={<Navigate to="/dashboard/routines/:id/edit" />} />
    </Routes>
  );
}
