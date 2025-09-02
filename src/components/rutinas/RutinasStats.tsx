import { useGetRutinasUsuarioQuery } from "@/features/rutinas/api/rutinasApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock, Unlock, Play, Pause } from "lucide-react";

export default function RutinasStats() {
  const { data: rutinas = [], isLoading, error } = useGetRutinasUsuarioQuery();

  // Debug logging
  console.log("RutinasStats - isLoading:", isLoading);
  console.log("RutinasStats - error:", error);
  console.log("RutinasStats - rutinas:", rutinas);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 w-24 bg-muted rounded-md animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Error en RutinasStats:", error);
    return (
      <Card className="rounded-2xl shadow-sm border-destructive">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error al cargar estadísticas</p>
            <p className="text-sm">{error?.data?.message || error?.data || 'Error desconocido'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRutinas = rutinas.length;
  const rutinasPrivadas = rutinas.filter(r => r.usuarioRutina?.privada).length;
  const rutinasPublicas = rutinas.filter(r => !r.usuarioRutina?.privada).length;
  const rutinasActivas = rutinas.filter(r => r.usuarioRutina?.activa).length;
  const rutinasInactivas = rutinas.filter(r => !r.usuarioRutina?.activa).length;

  console.log("RutinasStats - cálculos:", {
    totalRutinas,
    rutinasPrivadas,
    rutinasPublicas,
    rutinasActivas,
    rutinasInactivas
  });

  const stats = [
    {
      title: "Total de Rutinas",
      value: totalRutinas,
      description: "Rutinas creadas",
      icon: Calendar,
      color: "bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Rutinas Privadas",
      value: rutinasPrivadas,
      description: "Solo tú puedes ver",
      icon: Lock,
      color: "bg-orange-50 dark:bg-orange-950",
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800"
    },
    {
      title: "Rutinas Públicas",
      value: rutinasPublicas,
      description: "Visibles para todos",
      icon: Unlock,
      color: "bg-green-50 dark:bg-green-950",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      title: "Rutinas Activas",
      value: rutinasActivas,
      description: "En uso actualmente",
      icon: Play,
      color: "bg-purple-50 dark:bg-purple-950",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`rounded-2xl shadow-sm ${stat.borderColor}`}>
          <CardContent className={`p-6 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} ${stat.borderColor} border`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
