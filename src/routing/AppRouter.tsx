import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes/ProtectedRoute";
import { PublicRoute } from "./PublicRoutes/PublicRoute";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import { LoginPage, RegisterPage, ResetPasswordPage } from "../pages/auth";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import { ListaRutinasPage, CrearRutinaPage, VerRutinaPage } from "@/pages/rutinas";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/rutinas" element={<ListaRutinasPage />} />
      <Route path="/rutinas/crear" element={<CrearRutinaPage />} />
      <Route path="/rutinas/:id" element={<VerRutinaPage />} />

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

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
