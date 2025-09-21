import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, Loader2, Plus, Search } from "lucide-react";
import { AdvancedFilters } from "@/features/exercises/components/AdvancedFilters";
import { useExercisesCatalogFilters } from "@/features/exercises/hooks";
import {
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
  useGetDifficultyLevelsQuery,
  useGetExercisesQuery,
} from "@/features/exercises/api/exercisesApi";

export function ExerciseFinder({
  existingIds,
  open,
  onClose,
  onAdd,
}: {
  existingIds: number[];
  open: boolean;
  onClose: () => void;
  onAdd: (exercise: any) => void;
}) {
  const filters = useExercisesCatalogFilters();
  const { data: mgResp, isLoading: isLoadingMG } = useGetMuscleGroupsQuery();
  const { data: eqResp, isLoading: isLoadingEq } = useGetEquipmentTypesQuery();
  const { data: difResp, isLoading: isLoadingDif } = useGetDifficultyLevelsQuery();

  const muscleGroups = useMemo(() => mgResp?.data || [], [mgResp?.data]);
  const equipmentTypes = useMemo(() => eqResp?.data || [], [eqResp?.data]);
  const difficultyLevels = useMemo(() => {
    const raw = difResp?.data || [];
    const norm = raw
      .map((d: string) => d?.toLowerCase?.())
      .filter((d: string) => ["principiante", "intermedio", "avanzado"].includes(d));
    return [...new Set(norm)];
  }, [difResp?.data]);

  const args = useMemo(
    () => ({
      search: (filters.debouncedSearch || "").trim() || undefined,
      grupo_muscular: filters.selectedMuscleGroup === "all" ? undefined : filters.selectedMuscleGroup,
      dificultad: filters.selectedDifficulty === "all" ? undefined : filters.selectedDifficulty.toLowerCase(),
      equipamento: filters.selectedEquipment === "all" ? undefined : filters.selectedEquipment.toLowerCase(),
      limit: 25,
      offset: 0,
    }),
    [filters.debouncedSearch, filters.selectedMuscleGroup, filters.selectedDifficulty, filters.selectedEquipment]
  );

  const { data: searchResp, isLoading: searching } = useGetExercisesQuery(args, { skip: !open });
  const results = searchResp?.data ?? [];

  // Ocultar ejercicios ya en la rutina
  const selectedIds = useMemo(() => new Set(existingIds), [existingIds]);
  const filteredResults = useMemo(
    () => results.filter((e: any) => !selectedIds.has(Number(e.id))),
    [results, selectedIds]
  );

  if (!open) return null;

  return (
    <Card className="border-2 border-primary/20 rounded-2xl shadow-xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Buscar Ejercicios
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Buscar ejercicios</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/60" />
            <Input
              value={filters.searchTerm}
              onChange={(e) => filters.setSearchTerm(e.target.value)}
              placeholder="Nombre o descripción del ejercicio"
              className="pl-12 h-12 rounded-xl border-2 border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary/40 font-medium"
            />
          </div>
        </div>

        <AdvancedFilters
          expanded
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
            isLoadingMuscleGroups: isLoadingMG,
            isLoadingDifficulty: isLoadingDif,
            isLoadingEquipment: isLoadingEq,
          }}
        />

        <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {searching && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Buscando ejercicios…
            </div>
          )}

          {!searching && results.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 text-center rounded-xl bg-gradient-to-r from-muted/40 to-muted/20">
              No se encontraron ejercicios con los filtros aplicados.
            </div>
          )}

          {!searching && results.length > 0 && filteredResults.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 text-center rounded-xl bg-gradient-to-r from-muted/40 to-muted/20">
              Todos los resultados ya están en la rutina.
            </div>
          )}

          {filteredResults.map((e: any) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-4 rounded-xl border-2 border-border/60 p-4 bg-gradient-to-r from-background/80 to-muted/20 hover:from-primary/5 hover:to-primary/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {e.ejemplo ? (
                  <img
                    src={e.ejemplo || "/placeholder.svg"}
                    alt={e.nombre ?? "Ejercicio"}
                    className="h-14 w-14 rounded-xl object-cover border-2 border-primary/20 shadow-md"
                    onError={(ev) => ((ev.currentTarget.src = ""), (ev.currentTarget.alt = "Sin imagen"))}
                  />
                ) : (
                  <div className="h-14 w-14 grid place-items-center rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                    <ImageIcon className="h-6 w-6 text-primary/60" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm text-foreground">{e.nombre ?? `Ejercicio #${e.id}`}</div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {e.grupo_muscular || "—"} · {e.dificultad || "—"} · {e.equipamento || "—"}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => onAdd(e)}
                className="gap-2 rounded-xl border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:ring-2 focus-visible:ring-primary font-semibold"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
