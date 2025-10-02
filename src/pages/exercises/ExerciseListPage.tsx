import { useMemo, useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

import type { Exercise } from "@/types/exercises";
import { usePaginatedExercises } from "../../features/exercises/hooks/usePaginatedExercises";
import { ITEMS_PER_PAGE } from "../../features/exercises/utils/constants";

import {
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
  useGetDifficultyLevelsQuery,
} from "../../features/exercises/api/exercisesApi";
import {
  ExercisesHeader,
  AdvancedFilters,
  EmptyState,
  ExerciseGrid,
  ExerciseSkeletonCard,
  FiltersToggle,
  LoadMore,
  SearchBar,
} from "../../features/exercises/components";
import { useExercisesCatalogFilters } from "../../features/exercises/hooks";
import ExerciseDetailDialog from "@/features/exercises/components/ExerciseDetailDialog";

export default function ExerciseListPage() {
  // Estado y handler del modal
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [open, setOpen] = useState(false);
  const handleSelect = useCallback((ex: Exercise) => {
    setSelected(ex);
    setOpen(true);
  }, []);

  const filters = useExercisesCatalogFilters();
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

  const argsFor = useCallback(
    (pageNum: number) => ({
      search: (filters.debouncedSearch || "").trim() || undefined,
      grupo_muscular: filters.selectedMuscleGroup === "all" ? undefined : filters.selectedMuscleGroup,
      dificultad: filters.selectedDifficulty === "all" ? undefined : filters.selectedDifficulty.toLowerCase(),
      equipamento: filters.selectedEquipment === "all" ? undefined : filters.selectedEquipment.toLowerCase(),
      limit: ITEMS_PER_PAGE,
      offset: pageNum * ITEMS_PER_PAGE,
    }),
    [filters.debouncedSearch, filters.selectedMuscleGroup, filters.selectedDifficulty, filters.selectedEquipment]
  );

  const { exercises, hasMore, loadMore, isFetching, isInitialQueryLoading, error } = usePaginatedExercises(argsFor);

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
          <ExercisesHeader total={exercises.length} groups={muscleGroups.length} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/5 to-card shadow-2xl hover:shadow-[0_20px_70px_-15px_rgba(139,92,246,0.3)] transition-all duration-300 backdrop-blur-md">
              {/* Overlays de realce, igual que el header */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.12),transparent_55%)] pointer-events-none" />

              <CardContent className="relative p-6 space-y-6">
                <SearchBar value={filters.searchTerm} onChange={filters.setSearchTerm} />

                <FiltersToggle
                  expanded={filters.isFiltersExpanded}
                  setExpanded={filters.setIsFiltersExpanded}
                  activeCount={filters.activeFiltersCount}
                  hasActive={filters.hasActiveFilters}
                  onClear={filters.clearFilters}
                />

                <AdvancedFilters
                  expanded={filters.isFiltersExpanded}
                  muscleGroups={muscleGroups}
                  difficultyLevels={difficultyLevels}
                  equipmentTypes={equipmentTypes}
                  values={{
                    selectedMuscleGroup: filters.selectedMuscleGroup,
                    selectedDifficulty: filters.selectedDifficulty,
                    selectedEquipment: filters.selectedEquipment,
                  }}
                  onChange={{
                    setSelectedMuscleGroup: filters.setSelectedMuscleGroup,
                    setSelectedDifficulty: filters.setSelectedDifficulty,
                    setSelectedEquipment: filters.setSelectedEquipment,
                  }}
                  loading={{ isLoadingMuscleGroups, isLoadingDifficulty, isLoadingEquipment }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <div className="space-y-6">
            {isInitialQueryLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ExerciseSkeletonCard key={i} />
                ))}
              </div>
            ) : exercises.length > 0 ? (
              <>
                {/* ✅ Pasamos onSelect para abrir el modal */}
                <ExerciseGrid items={exercises} onSelect={handleSelect} />
                <LoadMore visible={hasMore} disabled={isFetching} onClick={loadMore} />
              </>
            ) : (
              <EmptyState showClear={filters.hasActiveFilters} onClear={filters.clearFilters} />
            )}
          </div>
        </div>
      </div>

      {/* ✅ Modal de detalle (controlado) */}
      <ExerciseDetailDialog exercise={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
