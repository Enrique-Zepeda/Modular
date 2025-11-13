import { useMemo, useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGetRutinasQuery, useDeleteRutinaMutation } from "@/features/routines/api/rutinasApi";
import { useRoutinesFilters, useRoutinesRealtime } from "@/features/routines/hooks";
import {
  RoutinesEmptyState,
  RoutinesFilters,
  RoutinesGrid,
  RoutinesHeader,
  RoutinesSkeleton,
} from "@/features/routines/components";
import { DeleteRoutineDialog } from "@/components/ui/delete-routine-dialog";

export function RoutinesPage() {
  const { loading: authLoading, isAuthenticated, requireAuth } = useAuth();
  const filters = useRoutinesFilters();

  const { uid } = useRoutinesRealtime({ onChange: () => refetch() });

  const {
    data: routines = [],
    isLoading,
    error,
    refetch,
  } = useGetRutinasQuery(uid, {
    skip: !uid,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; routineId: number; routineName: string }>({
    open: false,
    routineId: 0,
    routineName: "",
  });

  const [deleteRutina, { isLoading: isDeleting }] = useDeleteRutinaMutation();

  const filteredRoutines = useMemo(() => {
    const q = filters.searchTerm.toLowerCase();
    return routines.filter((r) => {
      const matchesSearch =
        (r.nombre ?? "").toLowerCase().includes(q) || (r.descripcion ?? "").toLowerCase().includes(q);
      const matchesLevel = filters.levelFilter === "all" || r.nivel_recomendado === filters.levelFilter;
      const matchesObjective = filters.objectiveFilter === "all" || r.objetivo === filters.objectiveFilter;
      return matchesSearch && matchesLevel && matchesObjective;
    });
  }, [routines, filters.searchTerm, filters.levelFilter, filters.objectiveFilter]);

  const handleDelete = useCallback((id: number, name: string) => {
    // deja cerrar el dropdown en este tick
    setTimeout(() => setDeleteDialog({ open: true, routineId: id, routineName: name }), 0);
  }, []);

  const confirmDelete = useCallback(async () => {
    // 1) Cerrar diálogo y limpiar antes de mutar
    const toDelete = deleteDialog.routineId;
    setDeleteDialog({ open: false, routineId: 0, routineName: "" });

    // 2) Hacer la mutación después de liberar el overlay
    try {
      await deleteRutina({ id_rutina: toDelete }).unwrap();
      toast.success("Rutina eliminada correctamente");
    } catch (e) {
      console.error("Error deleting routine:", e);
      toast.error("Error al eliminar la rutina");
    }
  }, [deleteRutina, deleteDialog.routineId]);

  if (authLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  if (!isAuthenticated) {
    requireAuth();
    return null;
  }
  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        <RoutinesSkeleton />
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold">Error al cargar rutinas</h2>
            <p className="text-muted-foreground">No se pudieron cargar las rutinas</p>
          </div>
          <button className="btn" onClick={() => location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );

  const hasAny = routines.length > 0;

  return (
    <div
      className="
      mx-auto max-w-[min(100%,theme(spacing.7xl))]
      px-4 sm:px-6 lg:px-8
      py-6 sm:py-8
      space-y-6 sm:space-y-8
    "
    >
      {/* Header independiente para no colapsar con filtros en móvil */}
      <header className="min-w-0">
        <RoutinesHeader />
      </header>

      {/* Filtros: bloque propio para mantener separación vertical en móvil */}
      <section aria-label="Filtros de rutinas" className="min-w-0">
        <RoutinesFilters searchTerm={filters.searchTerm} onSearch={filters.setSearchTerm} />
      </section>

      {/* Contenido: grid/empty responsivo sin scroll horizontal */}
      <section className="min-w-0">
        {filteredRoutines.length === 0 ? (
          <RoutinesEmptyState hasAny={hasAny} />
        ) : (
          <RoutinesGrid items={filteredRoutines} onDelete={handleDelete} />
        )}
      </section>

      {/* Dialogo de eliminación persistente al final del árbol */}
      <DeleteRoutineDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => (open ? { ...prev, open } : { open: false, routineId: 0, routineName: "" }))
        }
        onConfirm={confirmDelete}
        routineName={deleteDialog.routineName}
        isLoading={isDeleting}
      />
    </div>
  );
}
