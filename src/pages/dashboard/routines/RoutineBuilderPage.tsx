import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { crearRutinaSchema, type CrearRutinaFormData } from "@/lib/validations/schemas/rutinaSchema";
import {
  useCreateRutinaMutation,
  useUpdateRutinaMutation,
  useGetRutinaByIdQuery,
  useAddEjercicioToRutinaMutation,
  useRemoveEjercicioFromRutinaMutation,
  useReorderEjerciciosMutation,
  useReplaceExerciseSetsMutation,
  type EjercicioRutina,
  type SetEntry,
} from "@/features/routines/api/rutinasApi";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RoutineBuilderExerciseList } from "@/features/routines/components/RoutineBuilderExerciseList";
import { RoutineBuilderLibrary } from "@/features/routines/components/RoutineBuilderLibrary";
import { ExitConfirmationDialog } from "@/components/ui/exit-confirmation-dialog";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import type { AgregarEjercicioFormData } from "@/types/rutinas";

// Extended type for exercises with sets
type ExtendedEjercicioRutina = EjercicioRutina & { sets?: SetEntry[] };

export default function RoutineBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading, requireAuth } = useAuth();

  const isEditMode = Boolean(id);
  const routineId = id ? Number(id) : undefined;

  // API hooks
  const { data: existingRoutine, isLoading: isLoadingRoutine } = useGetRutinaByIdQuery(routineId!, {
    skip: !isEditMode || !routineId,
  });
  const [createRutina, { isLoading: isCreating }] = useCreateRutinaMutation();
  const [updateRutina, { isLoading: isUpdating }] = useUpdateRutinaMutation();
  const [addEjercicio] = useAddEjercicioToRutinaMutation();
  const [removeEjercicio] = useRemoveEjercicioFromRutinaMutation();
  const [reorderEjercicios, { isLoading: isReordering }] = useReorderEjerciciosMutation();
  const [replaceSets] = useReplaceExerciseSetsMutation();

  // Local state for exercises with sets support
  const [exercises, setExercises] = useState<ExtendedEjercicioRutina[]>([]);

  // Track changes in edit mode
  const [originalExercises, setOriginalExercises] = useState<ExtendedEjercicioRutina[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form setup
  const form = useForm<CrearRutinaFormData>({
    resolver: zodResolver(crearRutinaSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      nivel_recomendado: "principiante",
      objetivo: "fuerza",
      duracion_estimada: 30,
    },
  });

  // Define the return path based on edit mode
  const getReturnPath = () => (isEditMode && routineId ? `/dashboard/routines/${routineId}` : "/dashboard/routines");

  // Exit confirmation functionality
  const { showExitModal, handleNavigation, confirmExit, cancelExit } = useUnsavedChanges({
    hasUnsavedChanges,
    onNavigateAway: () => setHasUnsavedChanges(false),
  });

  // Memoized sorted exercises with proper sets handling
  const sortedDetailExercises = useMemo(() => {
    if (!existingRoutine?.EjerciciosRutinas) return [];

    const arr = existingRoutine.EjerciciosRutinas.slice().sort((a, b) => {
      const ao = (a.orden ?? 999999) - (b.orden ?? 999999);
      return ao !== 0 ? ao : a.id_ejercicio - b.id_ejercicio;
    });

    // Process sets for each exercise
    return arr.map((er) => {
      const normalizedSets: SetEntry[] =
        er.sets && er.sets.length > 0
          ? er.sets.slice().sort((a, b) => a.idx - b.idx)
          : Array.from({ length: er.series ?? 0 }, (_, i) => ({
              idx: i + 1,
              kg: er.peso_sugerido ?? null,
              reps: er.repeticiones ?? null,
            }));

      return { ...er, sets: normalizedSets };
    });
  }, [existingRoutine]);

  // Load existing routine data in edit mode
  useEffect(() => {
    if (isEditMode && existingRoutine) {
      form.reset({
        nombre: existingRoutine.nombre || "",
        descripcion: existingRoutine.descripcion || "",
        nivel_recomendado: existingRoutine.nivel_recomendado || "principiante",
        objetivo: existingRoutine.objetivo || "fuerza",
        duracion_estimada: existingRoutine.duracion_estimada || 30,
      });

      setExercises(sortedDetailExercises);
      setOriginalExercises(JSON.parse(JSON.stringify(sortedDetailExercises)));
      setHasUnsavedChanges(false);
    }
  }, [existingRoutine, isEditMode, form, sortedDetailExercises]);

  // Reset for create mode
  useEffect(() => {
    if (!isEditMode) {
      setExercises([]);
      setOriginalExercises([]);
      setHasUnsavedChanges(false);
    }
  }, [isEditMode]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auth check
  if (authLoading || (isEditMode && isLoadingRoutine)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    requireAuth();
    return null;
  }

  if (isEditMode && !existingRoutine) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Rutina no encontrada</h2>
        <p className="text-muted-foreground mb-4">La rutina que buscas no existe o no tienes permisos para editarla</p>
        <Button onClick={() => navigate("/dashboard/rutinas")}>Volver a Rutinas</Button>
      </div>
    );
  }

  const handleAddExercise = async (exerciseData: AgregarEjercicioFormData) => {
    const nextOrder = Math.max(0, ...exercises.map((ex) => ex.orden || 0)) + 1;

    const newExercise: ExtendedEjercicioRutina = {
      id_rutina: routineId || 0,
      id_ejercicio: exerciseData.id_ejercicio,
      series: 0, // Will be updated when sets are added
      repeticiones: exerciseData.repeticiones,
      peso_sugerido: exerciseData.peso_sugerido,
      orden: nextOrder,
      sets: [], // Start with empty sets array
      Ejercicios: exerciseData.exerciseDetails
        ? {
            id: exerciseData.exerciseDetails.id,
            nombre: exerciseData.exerciseDetails.nombre,
            ejemplo: exerciseData.exerciseDetails.ejemplo,
            grupo_muscular: exerciseData.exerciseDetails.grupo_muscular,
          }
        : null,
    };

    setExercises((prev) => [...prev, newExercise]);
    setHasUnsavedChanges(true);
    toast.success("Ejercicio agregado");
  };

  const handleRemoveExercise = async (exerciseId: number) => {
    setExercises((prev) => {
      const filtered = prev.filter((ex) => ex.id_ejercicio !== exerciseId);
      return filtered.map((ex, idx) => ({ ...ex, orden: idx + 1 }));
    });
    setHasUnsavedChanges(true);
    toast.success("Ejercicio removido");
  };

  const handleReorderExercises = (newExercises: ExtendedEjercicioRutina[]) => {
    const densified = newExercises.map((ex, idx) => ({ ...ex, orden: idx + 1 }));
    setExercises(densified);
    setHasUnsavedChanges(true);
  };

  // Sets management functions
  const handleSetChange = (id_ejercicio: number, idx0: number, field: "kg" | "reps", value: string) => {
    setExercises((prev) =>
      prev.map((er) => {
        if (er.id_ejercicio !== id_ejercicio) return er;
        const sets = (er.sets ?? []).slice();
        const v = value === "" ? null : Number(value);
        sets[idx0] = { ...sets[idx0], [field]: v, idx: idx0 + 1 };
        return { ...er, sets, series: sets.length };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleAddSet = (id_ejercicio: number) => {
    setExercises((prev) =>
      prev.map((er) => {
        if (er.id_ejercicio !== id_ejercicio) return er;
        const sets = [...(er.sets ?? []), { idx: (er.sets?.length ?? 0) + 1, kg: null, reps: null }];
        return { ...er, sets, series: sets.length };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleRemoveSet = (id_ejercicio: number, idx0: number) => {
    setExercises((prev) =>
      prev.map((er) => {
        if (er.id_ejercicio !== id_ejercicio) return er;
        const sets = (er.sets ?? []).slice();
        sets.splice(idx0, 1);
        // Re-densify idx
        const densified = sets.map((s, i) => ({ ...s, idx: i + 1 }));
        return { ...er, sets: densified, series: densified.length };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateExercise = async (exerciseId: number, updates: Partial<ExtendedEjercicioRutina>) => {
    setExercises((prev) => prev.map((ex) => (ex.id_ejercicio === exerciseId ? { ...ex, ...updates } : ex)));
    setHasUnsavedChanges(true);
  };

  const onSubmit = async (data: CrearRutinaFormData) => {
    if (exercises.length === 0) {
      toast.error("Debes agregar al menos un ejercicio a la rutina");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nombre: data.nombre?.trim() || null,
        descripcion: data.descripcion?.trim() || null,
        nivel_recomendado: data.nivel_recomendado,
        objetivo: data.objetivo,
        duracion_estimada: data.duracion_estimada,
      };

      if (isEditMode) {
        // Update existing routine metadata
        await updateRutina({ id_rutina: routineId!, ...payload }).unwrap();

        // Calculate differences for optimized updates
        const origIds = new Set(originalExercises.map((x) => x.id_ejercicio));
        const nowIds = new Set(exercises.map((x) => x.id_ejercicio));

        // Remove exercises that are no longer in the routine
        const toRemove = [...origIds].filter((id) => !nowIds.has(id));
        for (const id_ejercicio of toRemove) {
          await removeEjercicio({
            id_rutina: routineId!,
            id_ejercicio,
          }).unwrap();
        }

        // Add new exercises
        const toAdd = exercises.filter((x) => !origIds.has(x.id_ejercicio));
        for (const exercise of toAdd) {
          await addEjercicio({
            id_rutina: routineId!,
            id_ejercicio: exercise.id_ejercicio,
            series: exercise.sets?.length ?? 0,
            repeticiones: exercise.repeticiones ?? null,
            peso_sugerido: exercise.peso_sugerido ?? null,
            orden: exercise.orden ?? 1,
          }).unwrap();
        }

        // Final reorder to ensure correct sequence
        const finalItems = exercises.map((ex, idx) => ({
          id_ejercicio: ex.id_ejercicio,
          orden: idx + 1,
        }));

        if (finalItems.length > 0) {
          await reorderEjercicios({ id_rutina: routineId!, items: finalItems }).unwrap();
        }

        // Save sets for each exercise
        for (const ex of exercises) {
          const sets = (ex.sets ?? []).map((s, i) => ({
            idx: i + 1,
            kg: s.kg ?? null,
            reps: s.reps ?? null,
          }));
          await replaceSets({
            id_rutina: routineId!,
            id_ejercicio: ex.id_ejercicio,
            sets,
          }).unwrap();
        }

        toast.success("¡Rutina actualizada exitosamente!");
      } else {
        // Create new routine
        const newRoutine = await createRutina(payload).unwrap();

        // Add exercises to the new routine with proper order
        for (let i = 0; i < exercises.length; i++) {
          const exercise = exercises[i];
          await addEjercicio({
            id_rutina: newRoutine.id_rutina,
            id_ejercicio: exercise.id_ejercicio,
            series: exercise.sets?.length ?? 0,
            repeticiones: exercise.repeticiones ?? null,
            peso_sugerido: exercise.peso_sugerido ?? null,
            orden: i + 1,
          }).unwrap();
        }

        // Ensure final order is correct
        const finalItems = exercises.map((ex, idx) => ({
          id_ejercicio: ex.id_ejercicio,
          orden: idx + 1,
        }));

        if (finalItems.length > 0) {
          await reorderEjercicios({ id_rutina: newRoutine.id_rutina, items: finalItems }).unwrap();
        }

        // Save sets for each exercise
        for (const ex of exercises) {
          const sets = (ex.sets ?? []).map((s, i) => ({
            idx: i + 1,
            kg: s.kg ?? null,
            reps: s.reps ?? null,
          }));
          await replaceSets({
            id_rutina: newRoutine.id_rutina,
            id_ejercicio: ex.id_ejercicio,
            sets,
          }).unwrap();
        }

        toast.success("¡Rutina creada exitosamente!");
      }

      setHasUnsavedChanges(false);
      navigate(getReturnPath(), { replace: true });
    } catch (err: any) {
      console.error("Error saving routine:", err);
      toast.error(err?.message || "No se pudo guardar la rutina");
    } finally {
      setIsSaving(false);
    }
  };

  const currentExerciseIds = exercises.map((ex) => ex.id_ejercicio);
  const isSavingAny = isSaving || isReordering;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (hasUnsavedChanges) {
                  handleNavigation(getReturnPath(), { replace: true });
                } else {
                  navigate(getReturnPath(), { replace: true });
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isEditMode ? "Editar Rutina" : "Crear Nueva Rutina"}</h1>
              <p className="text-muted-foreground">
                {isEditMode ? "Modifica tu rutina existente" : "Construye tu rutina personalizada"}
              </p>
            </div>
          </div>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSavingAny} className="min-w-[120px]">
            {isSavingAny && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditMode ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Routine Builder */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Routine Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Rutina</CardTitle>
                <CardDescription>Define los detalles básicos de tu rutina</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Rutina</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Rutina de Fuerza Superior" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe el objetivo y enfoque de esta rutina..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="nivel_recomendado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="principiante">Principiante</SelectItem>
                                <SelectItem value="intermedio">Intermedio</SelectItem>
                                <SelectItem value="avanzado">Avanzado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="objetivo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objetivo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fuerza">Fuerza</SelectItem>
                                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                                <SelectItem value="resistencia">Resistencia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duracion_estimada"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración (min)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="300"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>

            <Separator />

            {/* Exercise List with sets management */}
            <RoutineBuilderExerciseList
              exercises={exercises}
              onRemoveExercise={handleRemoveExercise}
              onReorderExercises={handleReorderExercises}
              onUpdateExercise={handleUpdateExercise}
              onSetChange={handleSetChange}
              onAddSet={handleAddSet}
              onRemoveSet={handleRemoveSet}
              isEditMode={isEditMode}
              isLoading={isReordering}
            />
          </div>
        </div>

        {/* Right Panel - Exercise Library */}
        <div className="w-96 border-l bg-muted/30">
          <RoutineBuilderLibrary onAddExercise={handleAddExercise} excludedExerciseIds={currentExerciseIds} />
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmationDialog open={showExitModal} onOpenChange={cancelExit} onConfirm={confirmExit} />
    </div>
  );
}
