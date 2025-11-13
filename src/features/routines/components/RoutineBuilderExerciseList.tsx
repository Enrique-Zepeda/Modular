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
import { useWeightUnit } from "@/hooks";
import { presentInUserUnit, toKg } from "@/lib/weight";

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
  const { unit } = useWeightUnit();
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
    if (field === "kg") {
      // value viene en la unidad del usuario → convertimos a kg antes de subir
      const numeric = Number(value.replace(",", "."));
      const kgValue = Number.isFinite(numeric) ? toKg(numeric, unit) : 0;
      onSetChange?.(exerciseId, setIndex, "kg", kgValue.toString());
    } else {
      onSetChange?.(exerciseId, setIndex, field, value);
    }
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
        <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 ring-4 ring-primary/5">
            <Dumbbell className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">No hay ejercicios agregados</h3>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Usa la librería de ejercicios para agregar ejercicios a tu rutina
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
                      <CardContent className="p-5 sm:p-6">
                        {/* Header ejercicio */}
                        <div className="flex flex-wrap sm:flex-nowrap items-start gap-4 mb-5 min-w-0">
                          {/* Índice + imagen */}
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
                            <h4 className="font-bold text-base sm:text-lg text-foreground truncate mb-2">{nombre}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              {grupo_muscular && (
                                <Badge
                                  variant="outline"
                                  className={`text-[11px] sm:text-xs font-semibold rounded-lg border ${getMuscleGroupColor(
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
                                  className="text-[11px] sm:text-xs font-semibold rounded-lg border bg-muted/50 text-muted-foreground border-border/50"
                                >
                                  <Dumbbell className="h-3 w-3 mr-1" />
                                  {equipo}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-[11px] sm:text-xs font-semibold rounded-lg border bg-primary/10 text-primary border-primary/30"
                              >
                                <Activity className="h-3 w-3 mr-1" />
                                {sets.length} series
                              </Badge>
                            </div>
                          </div>

                          {/* Eliminar ejercicio */}
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

                        <Separator className="mb-4 sm:mb-5" />

                        {/* Encabezados (visibles también en móvil para replicar la imagen) */}
                        {/* Encabezado compacto (solo iconos/labels, no ocupa mucho) */}
                        <div className="px-1 mb-1 text-[11px] font-bold uppercase tracking-wider text-primary hidden md:block">
                          <div className="grid md:grid-cols-[70px_1fr_1fr_50px] gap-3">
                            <div className="flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5" />
                              SET
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Weight className="h-3.5 w-3.5" />
                              {unit.toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Repeat className="h-3.5 w-3.5" />
                              REPS
                            </div>
                            <div />
                          </div>
                        </div>

                        {/* Filas tipo Hevy: índice + 2 pills + borrar */}
                        <div className="space-y-2.5">
                          {sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className="
        grid grid-cols-[40px_1fr_1fr_40px]
        sm:grid-cols-[48px_1fr_1fr_48px]
        md:grid-cols-[70px_1fr_1fr_50px]
        gap-2 sm:gap-3 items-center
      "
                            >
                              {/* Índice */}
                              <div className="flex items-center justify-center">
                                <div
                                  className="w-9 h-9 sm:w-10 sm:h-10 md:w-9 md:h-9 rounded-full bg-muted/25 ring-1 ring-border/50
                        text-[12px] sm:text-[13px] md:text-sm font-bold text-foreground flex items-center justify-center"
                                >
                                  {setIndex + 1}
                                </div>
                              </div>

                              {/* KG pill */}
                              <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1 text-[10px] font-semibold tracking-wide text-muted-foreground md:hidden">
                                  {unit.toUpperCase()}
                                </span>
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  aria-label={`${unit.toUpperCase()} del set ${setIndex + 1}`}
                                  value={set.kg != null ? presentInUserUnit(set.kg, unit).toString() : ""}
                                  onChange={(e) =>
                                    handleSetChange(exercise.id_ejercicio, setIndex, "kg", e.target.value)
                                  }
                                  className="
            h-12 sm:h-[52px] rounded-full bg-muted/15 border-border/60
            text-center text-[15px] sm:text-base font-semibold tabular-nums
            focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            md:pl-0
          "
                                  placeholder={unit === "kg" ? "100" : "220"}
                                />
                              </div>

                              {/* REPS pill */}
                              <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1 text-[10px] font-semibold tracking-wide text-muted-foreground md:hidden">
                                  REPS
                                </span>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  aria-label={`Repeticiones del set ${setIndex + 1}`}
                                  value={set.reps ?? ""}
                                  onChange={(e) =>
                                    handleSetChange(exercise.id_ejercicio, setIndex, "reps", e.target.value)
                                  }
                                  className="
            h-12 sm:h-[52px] rounded-full bg-muted/15 border-border/60
            text-center text-[15px] sm:text-base font-semibold tabular-nums
            focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            md:pl-0
          "
                                  placeholder="10"
                                />
                              </div>

                              {/* Borrar (siempre visible en mobile, hover en desktop) */}
                              <div className="flex items-center justify-end md:justify-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveSet(exercise.id_ejercicio, setIndex)}
                                      className="h-10 w-10 rounded-full hover:bg-destructive/15 hover:text-destructive md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
                            </div>
                          ))}
                        </div>

                        {/* CTA Añadir serie — pill grande sticky-friendly */}
                        <div className="pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleAddSet(exercise.id_ejercicio)}
                            className="
      w-full h-12 sm:h-[48px] rounded-full border-2 border-dashed
      hover:bg-primary/5 hover:border-primary hover:text-primary font-semibold
    "
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir serie
                          </Button>
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
