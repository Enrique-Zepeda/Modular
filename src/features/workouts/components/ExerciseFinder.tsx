import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Image as ImageIcon, Loader2, Plus, Search, X } from "lucide-react";
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
      equipamento: filters.selectedEquipment === "all" ? undefined : filters.selectedEquipment.toLowerCase(), // ⚠️ asegúrate que tu API acepte esta prop
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
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Buscar ejercicio para agregar</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} title="Cerrar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar ejercicios…</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.searchTerm}
              onChange={(e) => filters.setSearchTerm(e.target.value)}
              placeholder="Nombre o descripción"
              className="pl-10"
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

        <Separator />

        <div className="space-y-2">
          {searching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando ejercicios…
            </div>
          )}

          {!searching && results.length === 0 && (
            <div className="text-sm text-muted-foreground">No se encontraron ejercicios.</div>
          )}

          {!searching && results.length > 0 && filteredResults.length === 0 && (
            <div className="text-sm text-muted-foreground">Todos los resultados ya están en la rutina.</div>
          )}

          {filteredResults.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
              <div className="flex items-center gap-3">
                {e.ejemplo ? (
                  <img
                    src={e.ejemplo}
                    alt={e.nombre ?? "Ejercicio"}
                    className="h-10 w-10 rounded-md object-cover border"
                    onError={(ev) => ((ev.currentTarget.src = ""), (ev.currentTarget.alt = "Sin imagen"))}
                  />
                ) : (
                  <div className="h-10 w-10 grid place-items-center rounded-md border">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="text-sm">
                  <div className="font-medium">{e.nombre ?? `Ejercicio #${e.id}`}</div>
                  <div className="text-muted-foreground">
                    {(e.grupo_muscular || "—") + " · " + (e.dificultad || "—") + " · " + (e.equipamento || "—")}
                  </div>
                </div>
              </div>

              <Button variant="outline" onClick={() => onAdd(e)}>
                <Plus className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
