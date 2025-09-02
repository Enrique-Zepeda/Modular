import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Calendar, Clock, User, Target, MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useGetRutinasUsuarioQuery, useEliminarRutinaMutation } from "@/features/rutinas/api/rutinasApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RutinaCard from "@/components/rutinas/RutinaCard";
import RutinasStats from "@/components/rutinas/RutinasStats";
import type { RutinaConUsuario } from "@/types/rutinas";

export default function MyRoutinesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all");
  const [privacyFilter, setPrivacyFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const { data: routines = [], isLoading, error } = useGetRutinasUsuarioQuery();
  const [eliminarRutina] = useEliminarRutinaMutation();

  // Debug logging
  console.log("MyRoutinesPage - isLoading:", isLoading);
  console.log("MyRoutinesPage - error:", error);
  console.log("MyRoutinesPage - routines:", routines);

  const filteredRoutines = routines.filter((routine) => {
    const matchesSearch =
      routine.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (routine.descripcion && routine.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === "all" || routine.nivel_recomendado === levelFilter;
    const matchesObjective = objectiveFilter === "all" || routine.objetivo === objectiveFilter;
    const matchesPrivacy = privacyFilter === "all" || 
      (privacyFilter === "private" && routine.usuarioRutina?.privada) ||
      (privacyFilter === "public" && !routine.usuarioRutina?.privada);
    const matchesActivity = activityFilter === "all" || 
      (activityFilter === "active" && routine.usuarioRutina?.activa) ||
      (activityFilter === "inactive" && !routine.usuarioRutina?.activa);

    return matchesSearch && matchesLevel && matchesObjective && matchesPrivacy && matchesActivity;
  });

  console.log("MyRoutinesPage - filteredRoutines:", filteredRoutines);

  const handleDeleteRoutine = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) return;

    try {
      await eliminarRutina(id).unwrap();
      toast.success("Rutina eliminada correctamente");
    } catch (error) {
      console.error("Error deleting routine:", error);
      toast.error("Error al eliminar la rutina");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-96 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-md animate-pulse" />
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Error al cargar rutinas</h2>
              <p className="text-muted-foreground">No se pudieron cargar tus rutinas</p>
            </div>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Mis Rutinas</h1>
            <p className="text-muted-foreground">Gestiona tus rutinas personales y controla su privacidad y actividad</p>
          </div>
          <Button asChild className="rounded-xl">
            <Link to="/dashboard/routines/create">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Rutina
            </Link>
          </Button>
        </div>

        {/* Estadísticas */}
        <RutinasStats />

        {/* Filters */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rutinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="principiante">Principiante</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todos los objetivos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los objetivos</SelectItem>
                  <SelectItem value="fuerza">Fuerza</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                  <SelectItem value="resistencia">Resistencia</SelectItem>
                </SelectContent>
              </Select>

              <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todas las rutinas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las rutinas</SelectItem>
                  <SelectItem value="private">Solo privadas</SelectItem>
                  <SelectItem value="public">Solo públicas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todas las rutinas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las rutinas</SelectItem>
                  <SelectItem value="active">Solo activas</SelectItem>
                  <SelectItem value="inactive">Solo inactivas</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setLevelFilter("all");
                  setObjectiveFilter("all");
                  setPrivacyFilter("all");
                  setActivityFilter("all");
                }}
                className="rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Routines Grid */}
        {filteredRoutines.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-semibold">
                  {routines.length === 0 ? "No tienes rutinas creadas" : "No se encontraron rutinas"}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {routines.length === 0
                    ? "Crea tu primera rutina para comenzar a entrenar"
                    : "Intenta ajustar los filtros de búsqueda"}
                </p>
              </div>
              {routines.length === 0 && (
                <Button asChild className="rounded-xl">
                  <Link to="/dashboard/routines/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Rutina
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRoutines.map((routine, index) => (
                <RutinaCard
                  key={routine.id_rutina}
                  rutina={routine}
                  onDelete={handleDeleteRoutine}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
