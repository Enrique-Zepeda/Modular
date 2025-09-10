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
import type { EjercicioRutina } from "@/features/routines/api/rutinasApi";

interface RoutineBuilderExerciseListProps {
  exercises: EjercicioRutina[];
  onRemoveExercise: (exerciseId: number) => void;
  onReorderExercises?: (newExercises: EjercicioRutina[]) => void;
  onUpdateExercise?: (exerciseId: number, updates: Partial<EjercicioRutina>) => void;
  isEditMode: boolean;
}

interface ExerciseSetData {
  peso: number;
  repeticiones: number;
}

export function RoutineBuilderExerciseList({
  exercises,
  onRemoveExercise,
  onReorderExercises,
  onUpdateExercise,
  isEditMode,
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

  const [exerciseSets, setExerciseSets] = useState<Record<number, ExerciseSetData[]>>({});

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

  const handleAddSet = (exerciseId: number) => {
    const exercise = exercises.find((ex) => ex.id_ejercicio === exerciseId);
    if (!exercise) return;

    const newSeries = (exercise.series || 0) + 1;
    onUpdateExercise?.(exerciseId, { series: newSeries });

    // Actualizar el estado local de series
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: [
        ...(prev[exerciseId] || []),
        { peso: exercise.peso_sugerido || 0, repeticiones: exercise.repeticiones || 0 },
      ],
    }));
  };

  const handleSetUpdate = (exerciseId: number, setIndex: number, field: "peso" | "repeticiones", value: number) => {
    setExerciseSets((prev) => {
      const exerciseSetsData = prev[exerciseId] || [];
      const updatedSets = [...exerciseSetsData];

      if (!updatedSets[setIndex]) {
        updatedSets[setIndex] = { peso: 0, repeticiones: 0 };
      }

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value,
      };

      return {
        ...prev,
        [exerciseId]: updatedSets,
      };
    });
  };

  const getSetData = (exerciseId: number, setIndex: number, exercise: EjercicioRutina): ExerciseSetData => {
    const exerciseSetsData = exerciseSets[exerciseId];
    if (exerciseSetsData && exerciseSetsData[setIndex]) {
      return exerciseSetsData[setIndex];
    }
    return {
      peso: exercise.peso_sugerido || 0,
      repeticiones: exercise.repeticiones || 0,
    };
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((ex) => ex.id_ejercicio)} strategy={verticalListSortingStrategy}>
              {exercises.map((exercise, index) => {
                const { nombre, imagen, grupo_muscular } = normalizeExerciseData(exercise);

                return (
                  <SortableItem key={`${exercise.id_rutina}-${exercise.id_ejercicio}`} id={exercise.id_ejercicio}>
                    <div className="flex-shrink-0">
                      <ExerciseImage
                        src={imagen}
                        alt={nombre}
                        aspectRatio="1"
                        size="sm"
                        className="w-16 h-16 rounded-md"
                      />
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{nombre}</h4>
                          <p className="text-xs text-muted-foreground">{grupo_muscular}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(exercise.id_ejercicio, nombre)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Header de la tabla de series */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-muted-foreground">
                            Series: {exercise.series || 0}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSet(exercise.id_ejercicio)}
                            className="h-6 px-2 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Añadir serie
                          </Button>
                        </div>

                        {/* Tabla de series editable */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                            <span>SET</span>
                            <span>KG</span>
                            <span>REPS</span>
                          </div>

                          {Array.from({ length: exercise.series || 1 }).map((_, setIndex) => {
                            const setData = getSetData(exercise.id_ejercicio, setIndex, exercise);

                            return (
                              <div key={setIndex} className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-xs font-medium">{setIndex + 1}</span>

                                {/* Input para peso */}
                                <Input
                                  type="number"
                                  min="0"
                                  max="1000"
                                  step="0.5"
                                  value={setData.peso}
                                  onChange={(e) =>
                                    handleSetUpdate(
                                      exercise.id_ejercicio,
                                      setIndex,
                                      "peso",
                                      Number.parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="h-7 text-xs"
                                  placeholder="0"
                                />

                                {/* Input para repeticiones */}
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={setData.repeticiones}
                                  onChange={(e) =>
                                    handleSetUpdate(
                                      exercise.id_ejercicio,
                                      setIndex,
                                      "repeticiones",
                                      Number.parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="h-7 text-xs"
                                  placeholder="0"
                                />
                              </div>
                            );
                          })}
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
