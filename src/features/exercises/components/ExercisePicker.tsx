import { useMemo, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ExercisePickerCard } from "./ExercisePickerCard";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { ExercisePickerFilters } from "./ExercisePickerFilters";

export interface Exercise {
  id: string;
  nombre: string;
  grupo_muscular: string;
  imagen_url?: string;
  gif_url?: string;
  descripcion?: string;
  equipamiento?: string;
  equipamento?: string;
  dificultad?: "Principiante" | "Intermedio" | "Avanzado" | string;
}

export interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  exercises: Exercise[];
  selectedExercises?: string[];
  title?: string;
  description?: string;
}

export function ExercisePicker({
  isOpen,
  onClose,
  onSelectExercise,
  exercises,
  selectedExercises = [],
  title = "Seleccionar Ejercicios",
  description = "Elige los ejercicios que deseas agregar",
}: ExercisePickerProps) {
  // Búsqueda con debounce
  const { searchTerm, setSearchTerm, debouncedSearch, clearSearch } = useSearchFilters("", 300);

  // Filtros
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("Todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Todos");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("Todos");

  // Opciones derivadas dinámicamente (evitamos listas hardcodeadas)
  const muscleGroupOptions = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((e) => e.grupo_muscular && set.add(e.grupo_muscular));
    return ["Todos", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [exercises]);

  const difficultyOptions = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((e) => {
      const d = (e.dificultad ?? "").toString().trim();
      if (d) set.add(d);
    });
    return ["Todos", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [exercises]);

  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((e) => {
      const eq = (e.equipamento ?? e.equipamiento ?? "").toString().trim();
      if (eq) set.add(eq);
    });
    return ["Todos", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [exercises]);

  // Filtro principal
  const filteredExercises = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return exercises.filter((exercise) => {
      const nombre = exercise.nombre?.toLowerCase() ?? "";
      const desc = exercise.descripcion?.toLowerCase() ?? "";
      const grupo = exercise.grupo_muscular ?? "";
      const diff = (exercise.dificultad ?? "").toString().toLowerCase();
      const equip = (exercise.equipamento ?? exercise.equipamiento ?? "").toString().toLowerCase();

      const matchesSearch = !s || nombre.includes(s) || desc.includes(s);
      const matchesMuscleGroup = selectedMuscleGroup === "Todos" || grupo === selectedMuscleGroup;

      const selDiff = selectedDifficulty.toLowerCase();
      const matchesDifficulty = selDiff === "todos" || diff === selDiff;

      const selEquip = selectedEquipment.toLowerCase();
      const matchesEquipment = selEquip === "todos" || equip === selEquip;

      return matchesSearch && matchesMuscleGroup && matchesDifficulty && matchesEquipment;
    });
  }, [exercises, debouncedSearch, selectedMuscleGroup, selectedDifficulty, selectedEquipment]);

  const isExerciseSelected = useCallback(
    (exerciseId: string) => selectedExercises.includes(exerciseId),
    [selectedExercises]
  );

  const handleSelectExercise = useCallback((exercise: Exercise) => onSelectExercise(exercise), [onSelectExercise]);

  const clearFilters = useCallback(() => {
    clearSearch();
    setSelectedMuscleGroup("Todos");
    setSelectedDifficulty("Todos");
    setSelectedEquipment("Todos");
  }, [clearSearch]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedMuscleGroup !== "Todos" ||
    selectedDifficulty !== "Todos" ||
    selectedEquipment !== "Todos";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent
        className="
        p-0 w-full max-w-7xl
        h-[100dvh] sm:h-auto sm:max-h-[90vh]
        overflow-hidden flex flex-col
        rounded-none sm:rounded-2xl
      "
      >
        {/* Header fijo con safe-area; título/desc truncan en móvil */}
        <DialogHeader className="sticky top-[env(safe-area-inset-top)] z-20 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <DialogTitle className="text-lg sm:text-xl font-semibold truncate">{title}</DialogTitle>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>
        </DialogHeader>

        {/* Scroll interno para TODO el contenido variable (filtros + lista) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-10 space-y-6">
            {/* Filtros */}
            <ExercisePickerFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              muscleGroupOptions={muscleGroupOptions}
              difficultyOptions={difficultyOptions}
              equipmentOptions={equipmentOptions}
              selectedMuscleGroup={selectedMuscleGroup}
              setSelectedMuscleGroup={setSelectedMuscleGroup}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              selectedEquipment={selectedEquipment}
              setSelectedEquipment={setSelectedEquipment}
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
            />

            {/* Lista de ejercicios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Ejercicios Disponibles ({filteredExercises.length})</h3>
                {selectedExercises.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedExercises.length} seleccionado{selectedExercises.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {filteredExercises.length === 0 ? (
                <div className="py-14 sm:py-16 text-center">
                  <div className="mb-2 text-muted-foreground">No se encontraron ejercicios</div>
                  <p className="mb-4 text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="h-10 px-4">
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredExercises.map((exercise) => (
                    <ExercisePickerCard
                      key={exercise.id}
                      exercise={exercise}
                      selected={isExerciseSelected(exercise.id)}
                      onSelect={handleSelectExercise}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer fijo con safe-area; botones accesibles en móvil */}
        <div className="sticky bottom-0 z-20 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="text-sm text-muted-foreground truncate">
              {selectedExercises.length > 0 && (
                <span>
                  {selectedExercises.length} ejercicio{selectedExercises.length !== 1 ? "s" : ""} seleccionado
                  {selectedExercises.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="h-11 px-5">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
