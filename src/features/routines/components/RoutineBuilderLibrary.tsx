import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetEjerciciosQuery } from "@/features/routines/api/rutinasApi";
import { agregarEjercicioSchema, type AgregarEjercicioFormData } from "@/lib/validations/schemas/ejercicioSchema";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { normalizeExerciseData } from "@/utils/exerciseNormalization";
import type { Ejercicio } from "@/features/routines/api/rutinasApi";

interface RoutineBuilderLibraryProps {
  onAddExercise: (exerciseData: AgregarEjercicioFormData & { exerciseDetails?: Ejercicio }) => void;
  excludedExerciseIds: number[];
}

export function RoutineBuilderLibrary({ onAddExercise, excludedExerciseIds }: RoutineBuilderLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Ejercicio | null>(null);

  const { data: exercises = [], isLoading } = useGetEjerciciosQuery({
    search: searchTerm,
    grupo_muscular: selectedMuscleGroup === "all" ? undefined : selectedMuscleGroup,
    equipamento: selectedEquipment === "all" ? undefined : selectedEquipment,
  });

  const form = useForm<AgregarEjercicioFormData>({
    resolver: zodResolver(agregarEjercicioSchema),
    defaultValues: {
      id_ejercicio: 0,
      series: 3,
      repeticiones: 10,
      peso_sugerido: 0,
    },
  });

  const availableExercises = exercises.filter((exercise) => !excludedExerciseIds.includes(exercise.id));

  const muscleGroups = Array.from(new Set(exercises.map((e) => e.grupo_muscular).filter(Boolean))).sort();

  const equipmentTypes = Array.from(new Set(exercises.map((e) => e.equipamento).filter(Boolean))).sort();

  const handleExerciseSelect = (exercise: Ejercicio) => {
    setSelectedExercise(exercise);
    form.setValue("id_ejercicio", exercise.id);
    setIsConfigDialogOpen(true);
  };

  const handleSubmit = (data: AgregarEjercicioFormData) => {
    onAddExercise({
      ...data,
      exerciseDetails: selectedExercise || undefined,
    });
    setIsConfigDialogOpen(false);
    setSelectedExercise(null);
    form.reset({
      id_ejercicio: 0,
      series: 3,
      repeticiones: 10,
      peso_sugerido: 0,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
  };

  const hasActiveFilters = searchTerm || selectedMuscleGroup !== "all" || selectedEquipment !== "all";

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Library Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Librería de Ejercicios</h3>
            <Badge variant="secondary">{availableExercises.length}</Badge>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filtros</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                  Limpiar
                </Button>
              )}
            </div>

            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los músculos</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group!}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Equipamiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el equipo</SelectItem>
                {equipmentTypes.map((equipment) => (
                  <SelectItem key={equipment} value={equipment!}>
                    {equipment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : availableExercises.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {excludedExerciseIds.length > 0 && exercises.length > 0
                ? "Todos los ejercicios ya están agregados"
                : "No se encontraron ejercicios"}
            </div>
          ) : (
            <div className="space-y-3">
              {availableExercises.map((exercise) => {
                const { nombre, imagen } = normalizeExerciseData(exercise);

                return (
                  <Card
                    key={exercise.id}
                    className="cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <ExerciseImage
                          src={imagen}
                          alt={nombre}
                          aspectRatio="1"
                          size="sm"
                          className="w-12 h-12 rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-sm line-clamp-2 leading-tight">{nombre}</h4>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 flex-shrink-0">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {exercise.grupo_muscular && (
                              <Badge variant="secondary" className="text-xs">
                                {exercise.grupo_muscular}
                              </Badge>
                            )}
                            {exercise.equipamento && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{exercise.equipamento}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Ejercicio</DialogTitle>
            <DialogDescription>
              Configura las series, repeticiones y peso para{" "}
              <span className="font-semibold">{selectedExercise?.nombre}</span>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repeticiones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeticiones</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="peso_sugerido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Agregar Ejercicio
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
