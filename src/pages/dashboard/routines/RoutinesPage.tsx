import { useMemo, useCallback } from "react";
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

export default function RoutinesPage() {
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

  const [deleteRutina] = useDeleteRutinaMutation();

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

  const handleDelete = useCallback(
    async (id: number, name: string) => {
      if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) return;
      try {
        await deleteRutina({ id_rutina: id }).unwrap();
        toast.success("Rutina eliminada correctamente");
      } catch (e) {
        console.error("Error deleting routine:", e);
        toast.error("Error al eliminar la rutina");
      }
    },
    [deleteRutina]
  );

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
    <div className="container mx-auto px-4 py-8 max-w-screen-xl space-y-8">
      <RoutinesHeader />
      <RoutinesFilters searchTerm={filters.searchTerm} onSearch={filters.setSearchTerm} onClear={filters.clear} />
      {filteredRoutines.length === 0 ? (
        <RoutinesEmptyState hasAny={hasAny} />
      ) : (
        <RoutinesGrid items={filteredRoutines} onDelete={handleDelete} />
      )}
    </div>
  );
}
