import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import type { AgregarEjercicioFormData } from "@/types/rutinas";
import {
  useAddEjercicioToRutinaMutation,
  useDeleteRutinaMutation,
  useGetRutinaByIdQuery,
  useRemoveEjercicioFromRutinaMutation,
} from "../api/rutinasApi";

export function useRoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routineId = Number(id);

  const { data: rutina, isLoading, error, refetch } = useGetRutinaByIdQuery(routineId, { skip: !routineId });
  const [agregarEjercicio] = useAddEjercicioToRutinaMutation();
  const [removerEjercicio, { isLoading: isRemoving }] = useRemoveEjercicioFromRutinaMutation();
  const [eliminarRutina, { isLoading: isDeleting }] = useDeleteRutinaMutation();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const ejerciciosExistentes = useMemo(
    () => (rutina?.EjerciciosRutinas ?? []).map((e) => e.id_ejercicio),
    [rutina?.EjerciciosRutinas]
  );

  const handleEjercicioAgregado = useCallback(
    async (d: AgregarEjercicioFormData) => {
      try {
        await agregarEjercicio({
          id_rutina: routineId,
          id_ejercicio: d.id_ejercicio,
          series: d.series,
          repeticiones: d.repeticiones,
          peso_sugerido: d.peso_sugerido,
        }).unwrap();
        toast.success("Ejercicio agregado exitosamente");
        setIsSelectorOpen(false);
        refetch();
      } catch (e) {
        console.error("Error al agregar ejercicio:", e);
        toast.error("Error al agregar el ejercicio");
      }
    },
    [agregarEjercicio, routineId, refetch]
  );

  const handleRemoverEjercicio = useCallback(
    async (id_ejercicio: number) => {
      try {
        await removerEjercicio({ id_rutina: routineId, id_ejercicio }).unwrap();
        toast.success("Ejercicio removido exitosamente");
        refetch();
      } catch (e) {
        console.error("Error al remover ejercicio:", e);
        toast.error("Error al remover el ejercicio");
      }
    },
    [removerEjercicio, routineId, refetch]
  );

  const handleEliminarRutina = useCallback(async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta rutina?")) return;
    try {
      await eliminarRutina({ id_rutina: routineId }).unwrap();
      toast.success("Rutina eliminada exitosamente");
      navigate("/dashboard/routines");
    } catch (e) {
      console.error("Error al eliminar rutina:", e);
      toast.error("Error al eliminar la rutina");
    }
  }, [eliminarRutina, routineId, navigate]);

  return {
    rutina,
    isLoading,
    error,
    isDeleting,
    isRemoving,
    isSelectorOpen,
    setIsSelectorOpen,
    ejerciciosExistentes,
    handleEjercicioAgregado,
    handleRemoverEjercicio,
    handleEliminarRutina,
  };
}
