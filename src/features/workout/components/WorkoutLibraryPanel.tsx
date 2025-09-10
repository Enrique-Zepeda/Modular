import { useState } from "react";
import { X, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetExercisesQuery,
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
} from "@/features/exercises/exercisesSlice";
import { useAppDispatch } from "@/hooks/useStore";
import { addExerciseToSession } from "@/features/workout/store/workoutLogSlice";

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
    <div className="fixed right-0 top-0 h-full w-80 bg-card border-l shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Library</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4 border-b">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Muscle Group Filter */}
        <Select value={muscleGroup} onValueChange={setMuscleGroup}>
          <SelectTrigger>
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
          <SelectTrigger>
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

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">{exercise.nombre?.charAt(0).toUpperCase() || "E"}</span>
                </div>
                <div>
                  <div className="font-medium text-sm">{exercise.nombre}</div>
                  <div className="text-xs text-muted-foreground">{exercise.grupo_muscular}</div>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleAddExercise(exercise)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {exercises.length === 0 && <div className="text-center py-8 text-muted-foreground">No exercises found</div>}
        </div>
      </div>
    </div>
  );
}
