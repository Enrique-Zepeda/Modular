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
  type EjercicioRutina,
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

  // Local state for exercises
  const [exercises, setExercises] = useState<EjercicioRutina[]>([]);

  // Track changes in edit mode
  const [originalExercises, setOriginalExercises] = useState<EjercicioRutina[]>([]);
  const [exercisesToAdd, setExercisesToAdd] = useState<EjercicioRutina[]>([]);
  const [exercisesToRemove, setExercisesToRemove] = useState<number[]>([]);

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

  // Exit confirmation functionality
  const { showExitModal, handleNavigation, confirmExit, cancelExit } = useUnsavedChanges({
    hasUnsavedChanges,
    onNavigateAway: () => setHasUnsavedChanges(false),
  });

  // Memoized sorted exercises (with proper order handling)
  const sortedDetailExercises = useMemo(() => {
    if (!existingRoutine?.EjerciciosRutinas) return [];
    return existingRoutine.EjerciciosRutinas.slice().sort((a, b) => {
      const ao = (a.orden ?? 999999) - (b.orden ?? 999999);
      return ao !== 0 ? ao : a.id_ejercicio - b.id_ejercicio;
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

      // Use memoized sorted exercises
      setExercises(sortedDetailExercises);
      setOriginalExercises(JSON.parse(JSON.stringify(sortedDetailExercises)));
      setExercisesToAdd([]);
      setExercisesToRemove([]);
      setHasUnsavedChanges(false);
    }
  }, [existingRoutine, isEditMode, form, sortedDetailExercises]);

  // Reset for create mode
  useEffect(() => {
    if (!isEditMode) {
      setExercises([]);
      setOriginalExercises([]);
      setExercisesToAdd([]);
      setExercisesToRemove([]);
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

    const newExercise: EjercicioRutina = {
      id_rutina: routineId || 0,
      id_ejercicio: exerciseData.id_ejercicio,
      series: exerciseData.series,
      repeticiones: exerciseData.repeticiones,
      peso_sugerido: exerciseData.peso_sugerido,
      orden: nextOrder,
      Ejercicios: exerciseData.exerciseDetails
        ? {
            id: exerciseData.exerciseDetails.id,
            nombre: exerciseData.exerciseDetails.nombre,
            ejemplo: exerciseData.exerciseDetails.ejemplo,
            grupo_muscular: exerciseData.exerciseDetails.grupo_muscular,
          }
        : null,
    };

    // Add to local state
    setExercises((prev) => [...prev, newExercise]);

    // Track for edit mode
    if (isEditMode) {
      const isOriginal = originalExercises.some((ex) => ex.id_ejercicio === exerciseData.id_ejercicio);
      if (!isOriginal) {
        setExercisesToAdd((prev) => [...prev, newExercise]);
      }
      // If it was previously marked for removal, unmark it
      setExercisesToRemove((prev) => prev.filter((id) => id !== exerciseData.id_ejercicio));
    }

    setHasUnsavedChanges(true);
    toast.success("Ejercicio agregado");
  };

  const handleRemoveExercise = async (exerciseId: number) => {
    // Remove from local state and densify order
    setExercises((prev) => {
      const filtered = prev.filter((ex) => ex.id_ejercicio !== exerciseId);
      return filtered.map((ex, idx) => ({ ...ex, orden: idx + 1 }));
    });

    if (isEditMode) {
      // Check if it's an original exercise that needs to be removed from DB
      const isOriginal = originalExercises.some((ex) => ex.id_ejercicio === exerciseId);
      if (isOriginal) {
        setExercisesToRemove((prev) => [...prev, exerciseId]);
      }
      // Remove from exercises to add if it was there
      setExercisesToAdd((prev) => prev.filter((ex) => ex.id_ejercicio !== exerciseId));
    }

    setHasUnsavedChanges(true);
    toast.success("Ejercicio removido");
  };

  const handleReorderExercises = (newExercises: EjercicioRutina[]) => {
    const densified = newExercises.map((ex, idx) => ({ ...ex, orden: idx + 1 }));
    setExercises(densified);
    setHasUnsavedChanges(true);
  };

  const handleUpdateExercise = async (exerciseId: number, updates: Partial<EjercicioRutina>) => {
    setExercises((prev) => prev.map((ex) => (ex.id_ejercicio === exerciseId ? { ...ex, ...updates } : ex)));

    // Update in exercisesToAdd if it's there
    if (isEditMode) {
      setExercisesToAdd((prev) => prev.map((ex) => (ex.id_ejercicio === exerciseId ? { ...ex, ...updates } : ex)));
    }

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
            series: exercise.series,
            repeticiones: exercise.repeticiones,
            peso_sugerido: exercise.peso_sugerido,
            orden: exercise.orden ?? 1,
          }).unwrap();
        }

        // Update existing exercises that have been modified
        for (const exercise of exercises) {
          const isNew = toAdd.some((ex) => ex.id_ejercicio === exercise.id_ejercicio);
          const wasRemoved = toRemove.includes(exercise.id_ejercicio);

          if (!isNew && !wasRemoved) {
            const original = originalExercises.find((ex) => ex.id_ejercicio === exercise.id_ejercicio);
            if (
              original &&
              (original.series !== exercise.series ||
                original.repeticiones !== exercise.repeticiones ||
                original.peso_sugerido !== exercise.peso_sugerido)
            ) {
              // Remove and re-add with updated values
              await removeEjercicio({
                id_rutina: routineId!,
                id_ejercicio: exercise.id_ejercicio,
              }).unwrap();

              await addEjercicio({
                id_rutina: routineId!,
                id_ejercicio: exercise.id_ejercicio,
                series: exercise.series,
                repeticiones: exercise.repeticiones,
                peso_sugerido: exercise.peso_sugerido,
                orden: exercise.orden ?? 1,
              }).unwrap();
            }
          }
        }

        // Final reorder to ensure correct sequence
        const finalItems = exercises.map((ex, idx) => ({
          id_ejercicio: ex.id_ejercicio,
          orden: idx + 1,
        }));

        if (finalItems.length > 0) {
          await reorderEjercicios({ id_rutina: routineId!, items: finalItems }).unwrap();
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
            series: exercise.series,
            repeticiones: exercise.repeticiones,
            peso_sugerido: exercise.peso_sugerido,
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

        toast.success("¡Rutina creada exitosamente!");
      }

      setHasUnsavedChanges(false);
      navigate("/dashboard/routines");
    } catch (err: any) {
      console.error("Error saving routine:", err);
      toast.error(err?.message || "No se pudo guardar la rutina");
    } finally {
      setIsSaving(false);
    }
  };

  const currentExerciseIds = exercises.map((ex) => ex.id_ejercicio);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => handleNavigation("/dashboard/routines")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isEditMode ? "Editar Rutina" : "Crear Nueva Rutina"}</h1>
              <p className="text-muted-foreground">
                {isEditMode ? "Modifica tu rutina existente" : "Construye tu rutina personalizada"}
              </p>
            </div>
          </div>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving || isReordering} className="min-w-[120px]">
            {(isSaving || isReordering) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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

            {/* Exercise List with improved reordering */}
            <RoutineBuilderExerciseList
              exercises={exercises}
              onRemoveExercise={handleRemoveExercise}
              onReorderExercises={handleReorderExercises}
              onUpdateExercise={handleUpdateExercise}
              isEditMode={isEditMode}
              isLoading={isReordering}
            />

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                Tienes cambios sin guardar.
              </div>
            )}
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
