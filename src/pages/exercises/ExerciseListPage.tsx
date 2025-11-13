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
      <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12 sm:py-16">
        <Card className="w-full max-w-sm sm:max-w-md rounded-2xl border">
          <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5 sm:mb-6">
              <Dumbbell className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />
            </div>
            <div className="text-center space-y-1.5 sm:space-y-2 mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-destructive">Error al cargar ejercicios</h2>
              <p className="text-sm text-muted-foreground">
                No se pudieron cargar los ejercicios. Intenta de nuevo más tarde.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} aria-live="polite">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-[min(100%,theme(spacing.7xl))] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          <ExercisesHeader total={exercises.length} groups={muscleGroups.length} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/5 to-card shadow-2xl hover:shadow-[0_20px_70px_-15px_rgba(139,92,246,0.3)] transition-all duration-300 backdrop-blur-md">
              {/* Overlays de realce, suavizados en móvil */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="absolute inset-0 hidden sm:block bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.12),transparent_55%)] pointer-events-none" />

              <CardContent className="relative p-4 sm:p-6 space-y-5 sm:space-y-6">
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
                  loading={{
                    isLoadingMuscleGroups,
                    isLoadingDifficulty,
                    isLoadingEquipment,
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <div className="space-y-5 sm:space-y-6 pb-[env(safe-area-inset-bottom)]">
            {isInitialQueryLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ExerciseSkeletonCard key={i} />
                ))}
              </div>
            ) : exercises.length > 0 ? (
              <>
                {/* Mantén el grid interno del componente, aquí solo contenedor fluido */}
                <ExerciseGrid items={exercises} onSelect={handleSelect} />
                <LoadMore visible={hasMore} disabled={isFetching} onClick={loadMore} />
              </>
            ) : (
              <EmptyState showClear={filters.hasActiveFilters} onClear={filters.clearFilters} />
            )}
          </div>
        </div>
      </div>

      {/* Modal controlado */}
      <ExerciseDetailDialog exercise={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
