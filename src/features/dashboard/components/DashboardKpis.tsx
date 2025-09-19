import { useGetDashboardKpisQuery } from "@/features/dashboard/api/dashboardApi";
import { Loader2 } from "lucide-react";

export function DashboardKpis() {
  const { data, isLoading, isError } = useGetDashboardKpisQuery();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando KPIs...
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-sm text-red-500">No se pudieron cargar los KPIs.</div>;
  }

  const { routineCount, workoutsThisMonth, totalVolumeThisMonth } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tarjeta de Rutinas */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-lg border">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Rutinas creadas</h3>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{routineCount}</p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Rutinas creadas</p>
      </div>

      {/* Tarjeta de Entrenamientos */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-lg border">
        <h3 className="font-semibold text-green-900 dark:text-green-100">Entrenamientos este mes</h3>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{workoutsThisMonth}</p>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">Entrenamientos completados</p>
      </div>

      {/* Tarjeta de Volumen */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-lg border">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100">Volumen este mes</h3>
        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
          {totalVolumeThisMonth.toLocaleString()} kg
        </p>
        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Total levantado</p>
      </div>
    </div>
  );
}
