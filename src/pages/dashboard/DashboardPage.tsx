import { Link } from "react-router-dom";
import { Plus, Calendar, Clock, Target } from "lucide-react";
import { useGetRutinasActivasQuery } from "@/features/rutinas/api/rutinasApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RutinaCard from "@/components/rutinas/RutinaCard";
import { useDebugRutinas } from "@/hooks/useDebugRutinas";

export default function DashboardPage() {
  const { data: rutinasActivas = [], isLoading } = useGetRutinasActivasQuery();
  
  // Debug hook
  useDebugRutinas();

  const getLevelBadgeVariant = (level: string | null) => {
    switch (level) {
      case "principiante":
        return "default";
      case "intermedio":
        return "secondary";
      case "avanzado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getObjectiveBadgeVariant = (objective: string | null) => {
    switch (objective) {
      case "fuerza":
        return "default";
      case "hipertrofia":
        return "secondary";
      case "resistencia":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-lg border">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Rutinas Activas</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{rutinasActivas.length}</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Rutinas activas</p>
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

      {/* Rutinas Activas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rutinas Activas</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log("=== MANUAL DEBUG ===");
                console.log("Estado actual:", { rutinasActivas, isLoading });
                console.log("===================");
              }}
            >
              Debug
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/routines/my">
                Ver todas mis rutinas
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm h-64">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 bg-muted rounded-md animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                      <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-1/2 bg-muted rounded-md animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
                      <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rutinasActivas.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-semibold">No tienes rutinas activas</h3>
                <p className="text-muted-foreground max-w-sm">
                  Activa algunas rutinas para verlas aquí y comenzar a entrenar
                </p>
              </div>
              <Button asChild className="rounded-xl">
                <Link to="/dashboard/routines/my">
                  <Plus className="h-4 w-4 mr-2" />
                  Gestionar Rutinas
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rutinasActivas.map((rutina) => (
              <RutinaCard
                key={rutina.id_rutina}
                rutina={rutina}
                showActions={false}
              />
            ))}
          </div>
        )}
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
    </div>
  );
}
