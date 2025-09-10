import { useEffect, useState } from "react";
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

  // Local state
  const [exercises, setExercises] = useState<EjercicioRutina[]>([]);
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
      setExercises(existingRoutine.EjerciciosRutinas || []);
    }
  }, [existingRoutine, isEditMode, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (!isEditMode) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEditMode]);

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
        <Button onClick={() => navigate("/dashboard/routines")}>Volver a Rutinas</Button>
      </div>
    );
  }

  const handleAddExercise = async (exerciseData: AgregarEjercicioFormData) => {
    if (!isEditMode) {
      // In create mode, just add to local state
      const newExercise: EjercicioRutina = {
        id_rutina: 0, // Will be set when routine is created
        id_ejercicio: exerciseData.id_ejercicio,
        series: exerciseData.series,
        repeticiones: exerciseData.repeticiones,
        peso_sugerido: exerciseData.peso_sugerido,
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
      return;
    }

    // In edit mode, save immediately
    try {
      await addEjercicio({
        id_rutina: routineId!,
        id_ejercicio: exerciseData.id_ejercicio,
        series: exerciseData.series,
        repeticiones: exerciseData.repeticiones,
        peso_sugerido: exerciseData.peso_sugerido,
      }).unwrap();
      toast.success("Ejercicio agregado exitosamente");
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast.error("Error al agregar el ejercicio");
    }
  };

  const handleRemoveExercise = async (exerciseId: number) => {
    if (!isEditMode) {
      // In create mode, just remove from local state
      setExercises((prev) => prev.filter((ex) => ex.id_ejercicio !== exerciseId));
      setHasUnsavedChanges(true);
      toast.success("Ejercicio removido");
      return;
    }

    // In edit mode, remove from database
    try {
      await removeEjercicio({
        id_rutina: routineId!,
        id_ejercicio: exerciseId,
      }).unwrap();
      toast.success("Ejercicio removido exitosamente");
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.error("Error al remover el ejercicio");
    }
  };

  const handleReorderExercises = (newExercises: EjercicioRutina[]) => {
    if (!isEditMode) {
      // In create mode, just update local state
      setExercises(newExercises);
      setHasUnsavedChanges(true);
    } else {
      // In edit mode, we could implement server-side ordering if needed
      // For now, just update the UI optimistically
      console.log("[v0] Exercise reordering in edit mode - updating UI optimistically");
    }
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
        // Update existing routine
        await updateRutina({ id_rutina: routineId!, ...payload }).unwrap();
        toast.success("¡Rutina actualizada exitosamente!");
      } else {
        // Create new routine
        const newRoutine = await createRutina(payload).unwrap();

        // Add exercises to the new routine
        for (const exercise of exercises) {
          await addEjercicio({
            id_rutina: newRoutine.id_rutina,
            id_ejercicio: exercise.id_ejercicio,
            series: exercise.series,
            repeticiones: exercise.repeticiones,
            peso_sugerido: exercise.peso_sugerido,
          }).unwrap();
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

  const currentExerciseIds = isEditMode
    ? (existingRoutine?.EjerciciosRutinas || []).map((ex) => ex.id_ejercicio)
    : exercises.map((ex) => ex.id_ejercicio);

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
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving} className="min-w-[120px]">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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

            {/* Exercise List */}
            <RoutineBuilderExerciseList
              exercises={isEditMode ? existingRoutine?.EjerciciosRutinas || [] : exercises}
              onRemoveExercise={handleRemoveExercise}
              onReorderExercises={handleReorderExercises}
              isEditMode={isEditMode}
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
