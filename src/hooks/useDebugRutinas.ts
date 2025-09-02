import { useEffect } from "react";
import { useGetRutinasUsuarioQuery, useGetRutinasActivasQuery, useGetRutinasPublicasQuery } from "@/features/rutinas/api/rutinasApi";

export function useDebugRutinas() {
  const rutinasUsuario = useGetRutinasUsuarioQuery();
  const rutinasActivas = useGetRutinasActivasQuery();
  const rutinasPublicas = useGetRutinasPublicasQuery();

  useEffect(() => {
    console.log("=== DEBUG RUTINAS ===");
    console.log("Rutinas Usuario:", {
      isLoading: rutinasUsuario.isLoading,
      error: rutinasUsuario.error,
      data: rutinasUsuario.data,
      isSuccess: rutinasUsuario.isSuccess,
      isError: rutinasUsuario.isError
    });
    console.log("Rutinas Activas:", {
      isLoading: rutinasActivas.isLoading,
      error: rutinasActivas.error,
      data: rutinasActivas.data,
      isSuccess: rutinasActivas.isSuccess,
      isError: rutinasActivas.isError
    });
    console.log("Rutinas Públicas:", {
      isLoading: rutinasPublicas.isLoading,
      error: rutinasPublicas.error,
      data: rutinasPublicas.data,
      isSuccess: rutinasPublicas.isSuccess,
      isError: rutinasPublicas.isError
    });
    console.log("=====================");
  }, [rutinasUsuario, rutinasActivas, rutinasPublicas]);

  return {
    rutinasUsuario,
    rutinasActivas,
    rutinasPublicas
  };
}
