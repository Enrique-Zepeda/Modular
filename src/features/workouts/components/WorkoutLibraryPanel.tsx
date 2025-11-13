import { useState } from "react";
import { X, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetExercisesQuery,
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
} from "@/features/exercises/api/exercisesApi";
import { useAppDispatch } from "@/hooks/useStore";
import { addExerciseToSession } from "../store/workoutLogSlice";

interface WorkoutLibraryPanelProps {
  onClose: () => void;
}

export function WorkoutLibraryPanel({ onClose }: WorkoutLibraryPanelProps) {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("all");
  const [equipment, setEquipment] = useState("all");

  const { data: exercisesData } = useGetExercisesQuery({
    search: search || undefined,
    grupo_muscular: muscleGroup !== "all" ? muscleGroup : undefined,
    equipamento: equipment !== "all" ? equipment : undefined,
    limit: 50,
  });

  const { data: muscleGroupsData } = useGetMuscleGroupsQuery();
  const { data: equipmentData } = useGetEquipmentTypesQuery();

  const exercises = exercisesData?.data || [];
  const muscleGroups = muscleGroupsData?.data || [];
  const equipmentTypes = equipmentData?.data || [];

  const handleAddExercise = (exercise: any) => {
    dispatch(addExerciseToSession({ exercise }));
  };

  return (
    /* Wrapper full-screen en móvil para comportamiento tipo Drawer */
    <div className="fixed inset-0 z-50">
      {/* Backdrop solo en móvil para enfoque visual */}
      <div className="sm:hidden absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Panel lateral: full-width en móvil, 20rem en desktop */}
      <div className="absolute right-0 top-0 h-[100dvh] w-full sm:w-80 bg-card border-l shadow-lg flex flex-col">
        {/* Header sticky con safe-area; botón cerrar siempre visible */}
        <div className="sticky top-[env(safe-area-inset-top)] z-10 flex items-center justify-between p-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <h2 className="font-semibold text-base">Library</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close library">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtros: grid simétrico; alturas consistentes */}
        <div className="p-4 space-y-4 border-b">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Exercises"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>

          {/* Selects en grid para evitar “dientes” en móvil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Muscle Group Filter */}
            <Select value={muscleGroup} onValueChange={setMuscleGroup}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="All Muscles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Muscles</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Equipment Filter */}
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="All Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {equipmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exercise List: área scrollable con padding para teclado/safe-area */}
        <div className="flex-1 overflow-y-auto p-4 pb-[env(safe-area-inset-bottom)]">
          <div className="space-y-2">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 sm:p-3 rounded-lg border hover:bg-accent/60 cursor-pointer group h-14"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-muted rounded-full grid place-items-center flex-shrink-0">
                    <span className="text-xs font-medium">{exercise.nombre?.charAt(0).toUpperCase() || "E"}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{exercise.nombre}</div>
                    <div className="text-xs text-muted-foreground truncate">{exercise.grupo_muscular}</div>
                  </div>
                </div>

                {/* En móvil el botón siempre visible; en desktop aparece al hover */}
                <Button
                  size="sm"
                  onClick={() => handleAddExercise(exercise)}
                  className="w-10 h-9 sm:w-auto sm:h-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label="Add exercise"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {exercises.length === 0 && <div className="text-center py-8 text-muted-foreground">No exercises found</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
