// src/pages/dashboard/routines/RoutinesPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Calendar, Clock, User, Target, MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useGetRutinasQuery, useDeleteRutinaMutation } from "@/features/rutinas/api/rutinasApi";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";

export default function RoutinesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all");

  // 👇 estado auth desde tu hook
  const { authLoading, isAuthenticated, requireAuth } = useAuth();

  // 👇 obtenemos y mantenemos el uid actual (para keyear la query)
  const [uid, setUid] = useState<string | undefined>(undefined);
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setUid(session?.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUid(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // 👇 la query ahora depende del uid (key por usuario)
  const {
    data: routines = [],
    isLoading,
    error,
  } = useGetRutinasQuery(uid, {
    skip: !uid,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [deleteRutina] = useDeleteRutinaMutation();

  // Verificar autenticación antes de renderizar
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    requireAuth();
    return null;
  }

  const filteredRoutines = routines.filter((routine) => {
    const matchesSearch =
      (routine.nombre ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (routine.descripcion && routine.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === "all" || routine.nivel_recomendado === levelFilter;
    const matchesObjective = objectiveFilter === "all" || routine.objetivo === objectiveFilter;

    return matchesSearch && matchesLevel && matchesObjective;
  });

  const handleDeleteRoutine = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) return;

    try {
      await deleteRutina({ id_rutina: id }).unwrap();
      toast.success("Rutina eliminada correctamente");
    } catch (error) {
      console.error("Error deleting routine:", error);
      toast.error("Error al eliminar la rutina");
    }
  };

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

          {/* Filters Skeleton */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm h-48">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 bg-muted rounded-md animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                      <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-1/2 bg-muted rounded-md animate-pulse" />
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
              <p className="text-muted-foreground">No se pudieron cargar las rutinas</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Rutinas</h1>
            <p className="text-muted-foreground">Gestiona y crea tus rutinas de ejercicios personalizadas</p>
          </div>
          <Button asChild className="rounded-xl">
            <Link to="/dashboard/routines/create">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Rutina
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rutinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setLevelFilter("all");
                  setObjectiveFilter("all");
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
                <motion.div
                  key={routine.id_rutina}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-border rounded-2xl shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg">
                            {routine.nombre}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {routine.descripcion || "Sin descripción"}
                          </CardDescription>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/routines/${routine.id_rutina}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteRoutine(routine.id_rutina, routine.nombre ?? "Sin nombre")}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <Link to={`/dashboard/routines/${routine.id_rutina}`}>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {routine.nivel_recomendado && (
                            <Badge variant={getLevelBadgeVariant(routine.nivel_recomendado)} className="rounded-full">
                              <User className="h-3 w-3 mr-1" />
                              {routine.nivel_recomendado}
                            </Badge>
                          )}
                          {routine.objetivo && (
                            <Badge variant={getObjectiveBadgeVariant(routine.objetivo)} className="rounded-full">
                              <Target className="h-3 w-3 mr-1" />
                              {routine.objetivo}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          {routine.duracion_estimada && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{routine.duracion_estimada} min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>0 ejercicios</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
