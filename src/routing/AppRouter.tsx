import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoutes/ProtectedRoute";

import DashboardPage from "@/pages/dashboard/DashboardPage";
import { LoginPage, RegisterPage } from "../pages/auth";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
