import { useState, useMemo } from "react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { useGetEjerciciosQuery } from "@/features/routines/api/rutinasApi";
import { agregarEjercicioSchema, type AgregarEjercicioFormData } from "@/lib/validations/schemas/ejercicioSchema";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { normalizeExerciseData } from "@/utils/exerciseNormalization";
import type { Ejercicio } from "@/features/routines/api/rutinasApi";

interface RoutineBuilderLibraryProps {
  onAddExercise: (exerciseData: AgregarEjercicioFormData & { exerciseDetails?: Ejercicio }) => void;
  excludedExerciseIds: number[];
}

/** Mantén los valores en minúsculas para que hagan match con el backend */
const DIFFICULTY_OPTIONS = [
  { value: "all", label: "Todas las dificultades" },
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const buildExerciseDetailsForBuilder = (ex: any) => {
  const { nombre, imagen, grupo_muscular } = normalizeExerciseData(ex);
  return {
    id: ex.id, // <- ID real del ejercicio
    nombre: nombre ?? ex.nombre ?? null, // <- nombre visible
    ejemplo: imagen ?? ex.ejemplo ?? ex.gif_url ?? ex.imagen_url ?? null,
    grupo_muscular: grupo_muscular ?? ex.grupo_muscular ?? null,
  };
};

export function RoutineBuilderLibrary({ onAddExercise, excludedExerciseIds }: RoutineBuilderLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Ejercicio | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: baseExercises = [] } = useGetEjerciciosQuery({});

  const { data: exercises = [], isLoading } = useGetEjerciciosQuery({
    search: debouncedSearch || undefined,
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

  // Opciones: usa la consulta base + normalización + tokeniza equipamiento por comas
  const muscleGroups = useMemo(() => {
    const set = new Set<string>();
    baseExercises.forEach((e: any) => {
      const { grupo_muscular } = normalizeExerciseData(e);
      if (grupo_muscular) set.add(grupo_muscular);
    });
    return Array.from(set).sort();
  }, [baseExercises]);

  const equipmentTypes = useMemo(() => {
    const set = new Set<string>();
    baseExercises.forEach((e: any) => {
      const { equipamiento } = normalizeExerciseData(e);
      if (equipamiento) {
        equipamiento
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [baseExercises]);

  // Filtrado final en cliente: dificultad + equipamiento (tokens) + search extra
  const filteredList = useMemo(() => {
    const s = (debouncedSearch || "").toLowerCase();

    return exercises.filter((raw: any) => {
      const { nombre, descripcion, grupo_muscular, dificultadKey, equipamiento } = normalizeExerciseData(raw);

      const matchesSearch = !s || nombre.toLowerCase().includes(s) || descripcion.toLowerCase().includes(s);
      const matchesMuscle = selectedMuscleGroup === "all" || grupo_muscular === selectedMuscleGroup;

      const matchesDifficulty = selectedDifficulty === "all" || dificultadKey === selectedDifficulty;

      const eq = (equipamiento || "").toLowerCase();
      const eqTokens = eq
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const wantedEq = selectedEquipment.toLowerCase();
      const matchesEquipment = selectedEquipment === "all" || eqTokens.includes(wantedEq);

      return matchesSearch && matchesMuscle && matchesDifficulty && matchesEquipment;
    });
  }, [exercises, debouncedSearch, selectedMuscleGroup, selectedDifficulty, selectedEquipment]);

  // Evitar mostrar los ya agregados en el builder
  const availableExercises = useMemo(
    () => filteredList.filter((e: any) => !excludedExerciseIds.includes(e.id)),
    [filteredList, excludedExerciseIds]
  );

  const handleExerciseSelect = (exercise: Ejercicio) => {
    setSelectedExercise(exercise);
    form.setValue("id_ejercicio", exercise.id);
    setIsConfigDialogOpen(true);
  };

  const handleSubmit = (data: AgregarEjercicioFormData) => {
    const details = selectedExercise ? buildExerciseDetailsForBuilder(selectedExercise) : undefined;

    onAddExercise({
      ...data,
      exerciseDetails: details,
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
    setSelectedDifficulty("all");
    setSelectedEquipment("all");
  };

  const hasActiveFilters =
    Boolean(searchTerm) || selectedMuscleGroup !== "all" || selectedDifficulty !== "all" || selectedEquipment !== "all";

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Librería de Ejercicios</h3>
            <Badge variant="secondary">{availableExercises.length}</Badge>
          </div>

          {/* Buscar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros (3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Grupo Muscular */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Grupo Muscular</span>
              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Todos los grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grupos</SelectItem>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group!}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dificultad */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Dificultad</span>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Todas las dificultades" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipamiento */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Equipamiento</span>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Todo el equipamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el equipamiento</SelectItem>
                  {equipmentTypes.map((equipment) => (
                    <SelectItem key={equipment} value={equipment!}>
                      {equipment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Limpiar */}
          {hasActiveFilters && (
            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Lista */}
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
                const { nombre, imagen, grupo_muscular, equipamiento, dificultad } = normalizeExerciseData(exercise);

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
                          aspectRatio="1/1"
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
                            {grupo_muscular && (
                              <Badge variant="secondary" className="text-xs">
                                {grupo_muscular}
                              </Badge>
                            )}
                            {dificultad && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  dificultad === "Principiante"
                                    ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20"
                                    : dificultad === "Intermedio"
                                    ? "border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20"
                                    : "border-red-500 text-red-700 bg-red-50 dark:bg-red-900/20"
                                }`}
                              >
                                {dificultad}
                              </Badge>
                            )}
                            {equipamiento && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{equipamiento}</p>
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

      {/* Modal de configuración */}
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
