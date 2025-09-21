import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Search, Filter } from "lucide-react";
import { useGetMuscleGroupsQuery } from "../api/exercisesApi";
import type { ExerciseFilters as ExerciseFiltersType } from "@/types/exercises";

const filterSchema = z.object({
  search: z.string().optional(),
  grupo_muscular: z.array(z.string()).optional(),
  dificultad: z.enum(["all", "principiante", "intermedio", "avanzado"]).optional(),
});

type FilterSchema = z.infer<typeof filterSchema>;

interface ExercisesListFiltersProps {
  onFiltersChange: (filters: ExerciseFiltersType) => void;
}

export function ExercisesListFilters({ onFiltersChange }: ExercisesListFiltersProps) {
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const { data: muscleGroupsResponse, isLoading: isLoadingMuscleGroups } = useGetMuscleGroupsQuery();
  const muscleGroups = muscleGroupsResponse?.data || [];

  const { control, watch, reset } = useForm<FilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      grupo_muscular: [],
      dificultad: "all",
    },
  });

  const watchedSearch = watch("search");
  const debouncedSearch = useDebounce(watchedSearch, 300);

  // Watch all form values for changes
  const formValues = watch();

  useEffect(() => {
    const filters: ExerciseFiltersType = {
      search: debouncedSearch || undefined,
      grupo_muscular: selectedMuscleGroups.length > 0 ? selectedMuscleGroups : undefined,
      dificultad: formValues.dificultad === "all" ? undefined : formValues.dificultad,
    };

    onFiltersChange(filters);
  }, [debouncedSearch, selectedMuscleGroups, formValues.dificultad, onFiltersChange]);

  const handleMuscleGroupToggle = (group: string) => {
    setSelectedMuscleGroups((prev) => (prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]));
  };

  const clearFilters = () => {
    reset();
    setSelectedMuscleGroups([]);
  };

  const hasActiveFilters = selectedMuscleGroups.length > 0 || formValues.dificultad || formValues.search;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtros de Ejercicios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            Buscar ejercicio
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Controller
              name="search"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="search"
                  placeholder="Buscar por nombre..."
                  className="pl-10"
                  aria-label="Buscar ejercicios por nombre"
                />
              )}
            />
          </div>
        </div>

        {/* Muscle Groups */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Grupo Muscular</label>
          {isLoadingMuscleGroups ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 w-20 animate-pulse bg-muted rounded-md" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((group) => (
                <Badge
                  key={group}
                  variant={selectedMuscleGroups.includes(group) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => handleMuscleGroupToggle(group)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleMuscleGroupToggle(group);
                    }
                  }}
                >
                  {group}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label htmlFor="difficulty" className="text-sm font-medium">
            Dificultad
          </label>
          <Controller
            name="dificultad"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="difficulty" aria-label="Seleccionar dificultad">
                  <SelectValue placeholder="Todas las dificultades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dificultades</SelectItem>
                  <SelectItem value="principiante">Principiante</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
