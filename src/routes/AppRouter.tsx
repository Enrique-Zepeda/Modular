import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoutes/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import RegistroEjercicio from "@/pages/RegistroEjercicio";
import CrearRutina from "@/pages/CrearRutina";
import Pruebas from "@/pages/Pruebas"; 

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registro-ejercicio" element={<RegistroEjercicio  />} />
      <Route path="/crear-rutina" element={<CrearRutina  />} />
      <Route path="/pruebas" element={<Pruebas />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
