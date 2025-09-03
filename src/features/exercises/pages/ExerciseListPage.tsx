import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Dumbbell, Loader2, X, ChevronDown, Activity, Target, Zap } from "lucide-react";
import {
  useLazyGetExercisesQuery,
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
  useGetDifficultyLevelsQuery,
} from "../exercisesSlice";
import type { Exercise } from "@/types/exercises";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseImage } from "@/components/ui/exercise-image";

const ITEMS_PER_PAGE = 12;

export default function ExerciseListPage() {
  // Filtros y control UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Estado de paginación/acumulación
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Datos dinámicos para selects
  const { data: muscleGroupsResponse, isLoading: isLoadingMuscleGroups } = useGetMuscleGroupsQuery();
  const { data: equipmentResponse, isLoading: isLoadingEquipment } = useGetEquipmentTypesQuery();
  const { data: difficultyResponse, isLoading: isLoadingDifficulty } = useGetDifficultyLevelsQuery();

  const muscleGroups = useMemo(() => muscleGroupsResponse?.data || [], [muscleGroupsResponse?.data]);
  const equipmentTypes = useMemo(() => equipmentResponse?.data || [], [equipmentResponse?.data]);

  const difficultyLevels = useMemo(() => {
    const raw = difficultyResponse?.data || [];
    const norm = raw
      .map((d: string) => d?.toLowerCase?.())
      .filter((d: string) => ["principiante", "intermedio", "avanzado"].includes(d));
    return [...new Set(norm)];
  }, [difficultyResponse?.data]);

  // Query perezosa para acumular resultados
  const [fetchExercises, { isFetching, isLoading: isInitialQueryLoading, error }] = useLazyGetExercisesQuery();

  // Construye argumentos del endpoint
  const argsFor = (pageNum: number) => ({
    search: (debouncedSearch || "").trim() || undefined,
    grupo_muscular: selectedMuscleGroup === "all" ? undefined : selectedMuscleGroup,
    dificultad: selectedDifficulty === "all" ? undefined : selectedDifficulty.toLowerCase(),
    equipamento: selectedEquipment === "all" ? undefined : selectedEquipment.toLowerCase(),
    limit: ITEMS_PER_PAGE,
    offset: pageNum * ITEMS_PER_PAGE,
  });

  // Cargar página 0 al cambiar filtros (reset seguro, sin bucles)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setPage(0);
      setExercises([]);
      setHasMore(true);

      const res = await fetchExercises(argsFor(0))
        .unwrap()
        .catch(() => null);
      if (!isMounted || !res) return;

      const list = res.data ?? [];
      setExercises(list);
      setHasMore(list.length === ITEMS_PER_PAGE);
    })();

    return () => {
      isMounted = false;
    };
    // Dependencias estables (no usar objetos inline fuera de argsFor)
  }, [debouncedSearch, selectedMuscleGroup, selectedDifficulty, selectedEquipment, fetchExercises]);

  // Cargar más (append) sin depender de referencias inestables
  const handleLoadMore = async () => {
    const next = page + 1;
    const res = await fetchExercises(argsFor(next))
      .unwrap()
      .catch(() => null);
    if (!res) return;

    const list = res.data ?? [];
    // Evita duplicados si el backend repite rangos/IDs
    const nextMerged = [...exercises];
    const seen = new Set(nextMerged.map((e) => e.id));
    for (const ex of list) {
      if (!seen.has(ex.id)) {
        nextMerged.push(ex);
        seen.add(ex.id);
      }
    }

    setExercises(nextMerged);
    setHasMore(list.length === ITEMS_PER_PAGE);
    setPage(next);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMuscleGroup("all");
    setSelectedDifficulty("all");
    setSelectedEquipment("all");
    // El useEffect de filtros se encarga de resetear y recargar
  };

  // Derivados UI
  const isInitialLoading = isInitialQueryLoading && page === 0;
  const hasActiveFilters = Boolean(
    (searchTerm && searchTerm.trim() !== "") ||
      selectedMuscleGroup !== "all" ||
      selectedDifficulty !== "all" ||
      selectedEquipment !== "all"
  );
  const activeFiltersCount = [
    searchTerm.trim() !== "",
    selectedMuscleGroup !== "all",
    selectedDifficulty !== "all",
    selectedEquipment !== "all",
  ].filter(Boolean).length;

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    switch (difficulty.toLowerCase()) {
      case "principiante":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200";
      case "intermedio":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200";
      case "avanzado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200";
    }
  };

  const getDifficultyIcon = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "principiante":
        return <Activity className="h-3 w-3" />;
      case "intermedio":
        return <Target className="h-3 w-3" />;
      case "avanzado":
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Dumbbell className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-xl font-semibold text-destructive">Error al cargar ejercicios</h2>
              <p className="text-muted-foreground">No se pudieron cargar los ejercicios. Intenta de nuevo más tarde.</p>
            </div>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Biblioteca de Ejercicios
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre y explora nuestra colección completa de ejercicios para todos los niveles
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>{exercises.length} ejercicios mostrados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span>{muscleGroups.length} grupos musculares</span>
              </div>
            </div>
          </motion.div>

          {/* Search & Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ejercicios por nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base border-0 bg-muted/50 focus:bg-background transition-colors"
                    />
                  </div>

                  {/* Filters Toggle */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setIsFiltersExpanded((v) => !v)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filtros avanzados</span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isFiltersExpanded ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                        <X className="h-3 w-3 mr-1" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>

                  {/* Expandable Filters */}
                  <AnimatePresence>
                    {isFiltersExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                          {/* Muscle Group */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Grupo Muscular
                            </label>
                            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Seleccionar grupo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos los grupos</SelectItem>
                                {isLoadingMuscleGroups ? (
                                  <SelectItem value="loading" disabled>
                                    Cargando...
                                  </SelectItem>
                                ) : (
                                  muscleGroups.map((group: string) => (
                                    <SelectItem key={group} value={group}>
                                      {group}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Difficulty */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Dificultad
                            </label>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Seleccionar dificultad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todas las dificultades</SelectItem>
                                {isLoadingDifficulty ? (
                                  <SelectItem value="loading" disabled>
                                    Cargando...
                                  </SelectItem>
                                ) : (
                                  difficultyLevels.map((difficulty: string) => (
                                    <SelectItem key={difficulty} value={difficulty}>
                                      <div className="flex items-center gap-2">
                                        {getDifficultyIcon(difficulty)}
                                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Equipment */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Dumbbell className="h-4 w-4" />
                              Equipamiento
                            </label>
                            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Seleccionar equipamiento" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todo el equipamiento</SelectItem>
                                {isLoadingEquipment ? (
                                  <SelectItem value="loading" disabled>
                                    Cargando...
                                  </SelectItem>
                                ) : (
                                  equipmentTypes.map((equipment: string) => (
                                    <SelectItem key={equipment} value={equipment}>
                                      {equipment}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <div className="space-y-6">
            {isInitialLoading ? (
              // Skeletons
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="aspect-video w-full">
                          <Skeleton className="h-full w-full rounded-lg" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : exercises.length > 0 ? (
              <>
                {/* Grid */}
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatePresence>
                    {exercises.map((exercise, index) => (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="group"
                      >
                        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {exercise.nombre || "Sin nombre"}
                              </CardTitle>
                              {exercise.dificultad && (
                                <Badge
                                  className={`text-xs font-medium shrink-0 border ${getDifficultyColor(
                                    exercise.dificultad
                                  )}`}
                                >
                                  <div className="flex items-center gap-1">
                                    {getDifficultyIcon(exercise.dificultad)}
                                    {exercise.dificultad}
                                  </div>
                                </Badge>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              {exercise.grupo_muscular && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-primary/10 text-primary border-primary/20"
                                >
                                  {exercise.grupo_muscular}
                                </Badge>
                              )}
                              {exercise.equipamento && (
                                <Badge variant="outline" className="text-xs">
                                  {exercise.equipamento}
                                </Badge>
                              )}
                            </div>

                            {/* Description */}
                            {exercise.descripcion && (
                              <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                                {exercise.descripcion}
                              </CardDescription>
                            )}

                            {/* Muscles */}
                            {exercise.musculos_involucrados && (
                              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                                <span className="font-medium">Músculos:</span> {exercise.musculos_involucrados}
                              </div>
                            )}

                            {/* Image / Example */}
                            {exercise.ejemplo && (
                              <div className="mt-4">
                                <div className="aspect-video w-full overflow-hidden rounded-lg">
                                  <ExerciseImage
                                    src={exercise.ejemplo}
                                    alt={exercise.nombre || "Ejercicio"}
                                    aspectRatio="16/9"
                                    size="lg"
                                    className="w-full h-full"
                                    showFallback={true}
                                  />
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Load More */}
                {hasMore && (
                  <motion.div
                    className="flex justify-center pt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={handleLoadMore}
                      disabled={isFetching}
                      size="lg"
                      className="min-w-[200px] h-12 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Cargando ejercicios...
                        </>
                      ) : (
                        <>
                          <Dumbbell className="h-5 w-5 mr-2" />
                          Cargar más ejercicios
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
                      <Dumbbell className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center space-y-3 mb-8">
                      <h3 className="text-xl font-semibold">No se encontraron ejercicios</h3>
                      <p className="text-muted-foreground max-w-md">
                        {hasActiveFilters
                          ? "Intenta ajustar los filtros para encontrar más ejercicios que coincidan con tu búsqueda."
                          : "No hay ejercicios disponibles en este momento. Vuelve a intentarlo más tarde."}
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters} className="rounded-full">
                        <X className="h-4 w-4 mr-2" />
                        Limpiar todos los filtros
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
