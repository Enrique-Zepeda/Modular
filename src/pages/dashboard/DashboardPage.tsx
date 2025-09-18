import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompletedWorkoutsSection } from "@/features/dashboard/components/CompletedWorkoutsSection";
import { DashboardKpis } from "@/features/dashboard/components/DashboardKpis";
import { FinishedWorkoutsSection } from "@/features/workout/components/FinishedWorkoutsSection";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.</p>
      </div>
      <DashboardKpis />

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
      <Card>
        <CardHeader>
          <CardTitle>Entrenamientos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <FinishedWorkoutsSection />
        </CardContent>
      </Card>
    </div>
  );
}
