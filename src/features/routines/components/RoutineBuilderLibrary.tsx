import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, Plus, Dumbbell, X, Filter, TrendingUp } from "lucide-react";
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

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "Todas las dificultades" },
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  principiante: "bg-green-500/10 text-green-600 border-green-500/20",
  intermedio: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  avanzado: "bg-red-500/10 text-red-600 border-red-500/20",
};

const buildExerciseDetailsForBuilder = (ex: any) => {
  const { nombre, imagen, grupo_muscular } = normalizeExerciseData(ex);
  return {
    id: ex.id,
    nombre: nombre ?? ex.nombre ?? null,
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
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      id_ejercicio: 0,
      series: 3,
      repeticiones: 10,
      peso_sugerido: undefined as unknown as number,
    },
  });

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
      const { equipamento } = normalizeExerciseData(e);
      if (equipamento) {
        equipamento
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [baseExercises]);

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
      peso_sugerido: undefined as unknown as number,
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
      <div className="h-full flex flex-col bg-background">
        <div className="flex-shrink-0 sticky top-0 z-10 bg-background border-b border-border/50 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-lg text-primary">Agregar Ejercicios</h3>
            <Badge variant="secondary" className="rounded-md px-3 py-1 text-xs font-medium">
              {availableExercises.length} encontrados
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar ejercicios</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nombre o descripción del ejercicio"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-background border-border/60"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
                  <Dumbbell className="h-3 w-3" />
                  <span>MÚSCULO</span>
                </div>
                <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group!}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
                  <TrendingUp className="h-3 w-3" />
                  <span>DIFICULTAD</span>
                </div>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todo" />
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

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
                  <Filter className="h-3 w-3" />
                  <span>EQUIPO</span>
                </div>
                <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo</SelectItem>
                    {equipmentTypes.map((equipment) => (
                      <SelectItem key={equipment} value={equipment!}>
                        {equipment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-primary border-t-primary/30 border-l-primary/30 border-r-primary/30 mb-2" />
              <p className="text-sm text-muted-foreground">Cargando ejercicios...</p>
            </div>
          ) : availableExercises.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground/80 font-medium mb-1">
                {excludedExerciseIds.length > 0 && exercises.length > 0
                  ? "Todos los ejercicios ya están agregados"
                  : "No se encontraron ejercicios"}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? "Intenta ajustar los filtros" : "Agrega algunos ejercicios a la biblioteca"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableExercises.map((exercise) => {
                const { nombre, imagen, grupo_muscular, equipamiento, dificultadKey } = normalizeExerciseData(exercise);

                return (
                  <Card
                    key={exercise.id}
                    className="group cursor-pointer hover:bg-accent/50 transition-colors border border-border/50 rounded-lg"
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3 items-center">
                        <ExerciseImage
                          src={imagen}
                          alt={nombre}
                          aspectRatio="1/1"
                          size="sm"
                          className="w-12 h-12 rounded-lg flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1 mb-1">{nombre}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            {grupo_muscular && <span>{grupo_muscular}</span>}
                            {grupo_muscular && equipamiento && <span>•</span>}
                            {equipamiento && <span className="line-clamp-1">{equipamiento}</span>}
                            {dificultadKey && dificultadKey !== "all" && (
                              <>
                                <span>•</span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 h-4 rounded-sm capitalize ${
                                    DIFFICULTY_COLORS[dificultadKey] || "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {dificultadKey}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="rounded-2xl border-2 border-border/50 shadow-2xl max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/30 shadow-sm">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <span>Configurar Ejercicio</span>
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Configura las series, repeticiones y peso para{" "}
              <span className="font-extrabold text-foreground bg-primary/10 px-2 py-0.5 rounded">
                {selectedExercise?.nombre}
              </span>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-2">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">Series</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? "" : Number.parseInt(v, 10));
                          }}
                          className="h-12 border-2 border-border/60 rounded-xl text-base font-semibold focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      {form.formState.submitCount > 0 && <FormMessage />}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repeticiones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">Repeticiones</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? "" : Number.parseInt(v, 10));
                          }}
                          className="h-12 border-2 border-border/60 rounded-xl text-base font-semibold focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      {form.formState.submitCount > 0 && <FormMessage />}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="peso_sugerido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="1000"
                          step="any"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              field.onChange(undefined as unknown as number);
                              return;
                            }
                            const num = Number.parseFloat(v);
                            field.onChange(Number.isNaN(num) ? (undefined as unknown as number) : num);
                          }}
                          className="h-12 border-2 border-border/60 rounded-xl text-base font-semibold focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      {form.formState.submitCount > 0 && <FormMessage />}
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfigDialogOpen(false)}
                  className="flex-1 h-12 border-2 border-border/60 rounded-xl font-bold hover:bg-muted/80"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl font-bold transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
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
