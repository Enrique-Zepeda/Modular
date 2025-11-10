import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Dumbbell, GripVertical, Info, Weight, Repeat, Target, Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { SortableItem } from "@/components/ui/sortable-item";
import { DeleteExerciseDialog } from "@/components/ui/delete-exercise-dialog";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { normalizeExerciseData } from "@/utils/exerciseNormalization";
import type { EjercicioRutina, SetEntry } from "@/features/routines/api/rutinasApi";

type ExtendedEjercicioRutina = EjercicioRutina & { sets?: SetEntry[] };

interface RoutineBuilderExerciseListProps {
  exercises: ExtendedEjercicioRutina[];
  onRemoveExercise: (exerciseId: number) => void;
  onReorderExercises?: (newExercises: ExtendedEjercicioRutina[]) => void;
  onUpdateExercise?: (exerciseId: number, updates: Partial<ExtendedEjercicioRutina>) => void;
  onSetChange?: (id_ejercicio: number, idx0: number, field: "kg" | "reps", value: string) => void;
  onAddSet?: (id_ejercicio: number) => void;
  onRemoveSet?: (id_ejercicio: number, idx0: number) => void;
  isEditMode: boolean;
  isLoading?: boolean;
}

const getMuscleGroupColor = (muscleGroup: string | undefined) => {
  const group = muscleGroup?.toLowerCase() || "";
  if (group.includes("pecho") || group.includes("chest")) return "bg-red-500/15 text-red-500 border-red-500/30";
  if (group.includes("espalda") || group.includes("back")) return "bg-blue-500/15 text-blue-500 border-blue-500/30";
  if (group.includes("pierna") || group.includes("leg")) return "bg-green-500/15 text-green-500 border-green-500/30";
  if (group.includes("hombro") || group.includes("shoulder"))
    return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
  if (group.includes("brazo") || group.includes("arm") || group.includes("bicep") || group.includes("tricep"))
    return "bg-purple-500/15 text-purple-500 border-purple-500/30";
  if (group.includes("core") || group.includes("abdomen"))
    return "bg-orange-500/15 text-orange-500 border-orange-500/30";
  return "bg-muted text-muted-foreground border-border/50";
};

export function RoutineBuilderExerciseList({
  exercises,
  onRemoveExercise,
  onReorderExercises,
  onSetChange,
  onAddSet,
  onRemoveSet,
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
      <Card className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-primary/5">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No hay ejercicios agregados</h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Usa la librería de ejercicios en el panel derecho para agregar ejercicios a tu rutina
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TooltipProvider>
        <div className="space-y-5">
          {isLoading && (
            <div className="text-sm text-primary font-medium text-center py-3 bg-primary/10 rounded-xl border border-primary/20">
              Reordenando ejercicios...
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((ex) => ex.id_ejercicio)} strategy={verticalListSortingStrategy}>
              {exercises.map((exercise, exerciseIndex) => {
                const { nombre, imagen, grupo_muscular, equipo } = normalizeExerciseData(exercise);
                const sets = exercise.sets || [];

                return (
                  <SortableItem key={`${exercise.id_rutina}-${exercise.id_ejercicio}`} id={exercise.id_ejercicio}>
                    <Card className="w-full rounded-2xl bg-card/60 border border-border/30 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-5">
                          {/* ÚNICO handle de arrastre (izquierda) */}

                          <div className="flex-shrink-0">
                            <div className="relative">
                              <ExerciseImage
                                src={imagen}
                                alt={nombre}
                                aspectRatio="1"
                                size="sm"
                                className="w-14 h-14 rounded-xl ring-2 ring-border/50"
                              />
                              <div className="absolute -top-2 -left-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg ring-2 ring-background">
                                {exerciseIndex + 1}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-foreground truncate mb-2">{nombre}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              {grupo_muscular && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-semibold rounded-lg border ${getMuscleGroupColor(
                                    grupo_muscular
                                  )}`}
                                >
                                  <Target className="h-3 w-3 mr-1" />
                                  {grupo_muscular}
                                </Badge>
                              )}
                              {equipo && (
                                <Badge
                                  variant="outline"
                                  className="text-xs font-semibold rounded-lg border bg-muted/50 text-muted-foreground border-border/50"
                                >
                                  <Dumbbell className="h-3 w-3 mr-1" />
                                  {equipo}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold rounded-lg border bg-primary/10 text-primary border-primary/30"
                              >
                                <Activity className="h-3 w-3 mr-1" />
                                {sets.length} series
                              </Badge>
                            </div>
                          </div>

                          {/* Botón directo para eliminar (sin DropdownMenu) */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(exercise.id_ejercicio, nombre)}
                                className="h-9 w-9 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Eliminar ejercicio"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar ejercicio</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <Separator className="mb-5" />

                        <div className="space-y-3">
                          <div className="grid grid-cols-[70px_1fr_1fr_50px] gap-4 px-2 text-xs font-bold text-primary uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5" />
                              SET
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Weight className="h-3.5 w-3.5" />
                              KG
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Repeat className="h-3.5 w-3.5" />
                              REPS
                            </div>
                            <div />
                          </div>

                          {sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-[70px_1fr_1fr_50px] gap-4 items-center group">
                              <div className="flex items-center justify-center">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-sm font-bold text-foreground group-hover:from-primary/10 group-hover:to-primary/5 group-hover:text-primary transition-all duration-300 ring-1 ring-border/50 group-hover:ring-primary/50">
                                  {setIndex + 1}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  value={set.kg ?? ""}
                                  onChange={(e) =>
                                    handleSetChange(exercise.id_ejercicio, setIndex, "kg", e.target.value)
                                  }
                                  className="h-12 bg-background/80 border-border/50 rounded-xl text-center text-base font-semibold tabular-nums focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="100"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  value={set.reps ?? ""}
                                  onChange={(e) =>
                                    handleSetChange(exercise.id_ejercicio, setIndex, "reps", e.target.value)
                                  }
                                  className="h-12 bg-background/80 border-border/50 rounded-xl text-center text-base font-semibold tabular-nums focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="10"
                                />
                              </div>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSet(exercise.id_ejercicio, setIndex)}
                                    className="h-10 w-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                    aria-label="Eliminar serie"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar serie</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ))}

                          <div className="pt-3 space-y-2">
                            <Button
                              variant="outline"
                              onClick={() => handleAddSet(exercise.id_ejercicio)}
                              className="w-full h-11 text-sm font-semibold rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary hover:text-primary transition-all"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Añadir serie
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SortableItem>
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </TooltipProvider>

      <DeleteExerciseDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        exerciseName={deleteDialog.exerciseName}
      />
    </>
  );
}
