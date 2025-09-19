import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { SortableItem } from "@/components/ui/sortable-item";
import { DeleteExerciseDialog } from "@/components/ui/delete-exercise-dialog";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { normalizeExerciseData } from "@/utils/exerciseNormalization";
import type { EjercicioRutina, SetEntry } from "@/features/routines/api/rutinasApi";

// Extended type to include sets
type ExtendedEjercicioRutina = EjercicioRutina & { sets?: SetEntry[] };

interface RoutineBuilderExerciseListProps {
  exercises: ExtendedEjercicioRutina[];
  onRemoveExercise: (exerciseId: number) => void;
  onReorderExercises?: (newExercises: ExtendedEjercicioRutina[]) => void;
  onUpdateExercise?: (exerciseId: number, updates: Partial<ExtendedEjercicioRutina>) => void;
  // New props for individual sets management
  onSetChange?: (id_ejercicio: number, idx0: number, field: "kg" | "reps", value: string) => void;
  onAddSet?: (id_ejercicio: number) => void;
  onRemoveSet?: (id_ejercicio: number, idx0: number) => void;
  isEditMode: boolean;
  isLoading?: boolean;
}

export function RoutineBuilderExerciseList({
  exercises,
  onRemoveExercise,
  onReorderExercises,
  onUpdateExercise,
  onSetChange,
  onAddSet,
  onRemoveSet,
  isEditMode,
  isLoading,
}: RoutineBuilderExerciseListProps) {
  const { sensors, handleDragEnd, DndContext, SortableContext, verticalListSortingStrategy, closestCenter } =
    useDragAndDrop(exercises, onReorderExercises || (() => {}));

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    exerciseId: number;
    exerciseName: string;
  }>({
    open: false,
    exerciseId: 0,
    exerciseName: "",
  });

  const handleDeleteClick = (exerciseId: number, exerciseName: string) => {
    setDeleteDialog({
      open: true,
      exerciseId,
      exerciseName,
    });
  };

  const confirmDelete = () => {
    onRemoveExercise(deleteDialog.exerciseId);
    setDeleteDialog({ open: false, exerciseId: 0, exerciseName: "" });
  };

  const handleSetChange = (exerciseId: number, setIndex: number, field: "kg" | "reps", value: string) => {
    onSetChange?.(exerciseId, setIndex, field, value);
  };

  const handleAddSet = (exerciseId: number) => {
    onAddSet?.(exerciseId);
  };

  const handleRemoveSet = (exerciseId: number, setIndex: number) => {
    onRemoveSet?.(exerciseId, setIndex);
  };

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay ejercicios agregados</h3>
          <p className="text-muted-foreground mb-4">
            Usa la librería de ejercicios para agregar ejercicios a tu rutina
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ejercicios de la Rutina</span>
            <Badge variant="secondary">{exercises.length} ejercicios</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="text-sm text-muted-foreground text-center py-4">Reordenando ejercicios...</div>}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((ex) => ex.id_ejercicio)} strategy={verticalListSortingStrategy}>
              {exercises.map((exercise) => {
                const { nombre, imagen, grupo_muscular } = normalizeExerciseData(exercise);
                const sets = exercise.sets || [];

                return (
                  <SortableItem key={`${exercise.id_rutina}-${exercise.id_ejercicio}`} id={exercise.id_ejercicio}>
                    {/* NOTA: SortableItem ya pinta su propio handle de arrastre.
                             Por eso NO renderizamos aquí otro <GripVertical /> para evitar duplicado. */}

                    {/* Imagen del ejercicio */}
                    <div className="flex-shrink-0 flex items-start gap-2">
                      <ExerciseImage
                        src={imagen}
                        alt={nombre}
                        aspectRatio="1"
                        size="sm"
                        className="w-16 h-16 rounded-md"
                      />
                    </div>

                    {/* Info + series */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{nombre}</h4>
                          <p className="text-xs text-muted-foreground">{grupo_muscular}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(exercise.id_ejercicio, nombre)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Header de series */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-muted-foreground">Series: {sets.length}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSet(exercise.id_ejercicio)}
                            className="h-7 px-3 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Añadir serie
                          </Button>
                        </div>

                        {/* Tabla de series */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                            <span>SET</span>
                            <span>KG</span>
                            <span>REPS</span>
                            <span></span>
                          </div>

                          {sets.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-4">
                              No hay series añadidas. Haz clic en "Añadir serie" para comenzar.
                            </div>
                          ) : (
                            sets.map((set, setIndex) => (
                              <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                                <span className="text-xs font-medium">{setIndex + 1}</span>

                                <Input
                                  type="number"
                                  min="0"
                                  max="1000"
                                  step="0.5"
                                  value={set.kg ?? ""}
                                  onChange={(e) =>
                                    handleSetChange(exercise.id_ejercicio, setIndex, "kg", e.target.value)
                                  }
                                  className="h-7 text-xs"
                                  placeholder="0"
                                />

                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={set.reps ?? ""}
                                  onChange={(e) =>
                                    handleSetChange(exercise.id_ejercicio, setIndex, "reps", e.target.value)
                                  }
                                  className="h-7 text-xs"
                                  placeholder="0"
                                />

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveSet(exercise.id_ejercicio, setIndex)}
                                  disabled={sets.length <= 1}
                                  className="h-7 w-7 p-0 disabled:opacity-30"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                );
              })}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <DeleteExerciseDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        exerciseName={deleteDialog.exerciseName}
      />
    </>
  );
}
