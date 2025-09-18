import { CompletedWorkoutsSection } from "@/features/dashboard/components/CompletedWorkoutsSection";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-lg border">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Rutinas Activas</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">0</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Rutinas creadas</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-lg border">
          <h3 className="font-semibold text-green-900 dark:text-green-100">Sesiones Este Mes</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">0</p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">Entrenamientos completados</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-lg border">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Días Consecutivos</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">0</p>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Racha actual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay actividad reciente</p>
            <p className="text-sm mt-1">Comienza creando tu primera rutina</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Próximos Entrenamientos</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay entrenamientos programados</p>
            <p className="text-sm mt-1">Programa tu próxima sesión</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <CompletedWorkoutsSection />
      </div>
    </div>
  );
}
