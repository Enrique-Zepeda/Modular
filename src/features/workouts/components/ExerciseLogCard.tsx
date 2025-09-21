import { useState } from "react";
import { MoreVertical, GripVertical, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/hooks/useStore";

import { WorkoutSetRow } from "./WorkoutSetRow";
import {
  addSet,
  duplicateSet,
  removeSet,
  updateExerciseNotes,
  updateRestTimer,
  type WorkoutExercise,
} from "../store/workoutLogSlice";

interface ExerciseLogCardProps {
  exercise: WorkoutExercise;
}

export function ExerciseLogCard({ exercise }: ExerciseLogCardProps) {
  const dispatch = useAppDispatch();
  const [showNotes, setShowNotes] = useState(false);

  const handleAddSet = () => {
    dispatch(addSet({ exerciseId: exercise.id }));
  };

  const handleDuplicateSet = (setId: string) => {
    dispatch(duplicateSet({ exerciseId: exercise.id, setId }));
  };

  const handleRemoveSet = (setId: string) => {
    dispatch(removeSet({ exerciseId: exercise.id, setId }));
  };

  const handleNotesChange = (notes: string) => {
    dispatch(updateExerciseNotes({ exerciseId: exercise.id, notes }));
  };

  const handleRestTimerChange = (timer: string) => {
    dispatch(updateRestTimer({ exerciseId: exercise.id, timer: Number.parseInt(timer) }));
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      {/* Exercise header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">{exercise.exerciseName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-medium">{exercise.exerciseName}</h3>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowNotes(!showNotes)}>
              {showNotes ? "Hide Notes" : "Add Notes"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notes section */}
      {showNotes && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add notes here..."
            value={exercise.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="text-xs text-muted-foreground text-right">{exercise.notes.length}/500</div>
        </div>
      )}

      {/* Rest timer */}
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-muted-foreground">Rest Timer:</span>
        <Select value={exercise.restTimer.toString()} onValueChange={handleRestTimerChange}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">OFF</SelectItem>
            <SelectItem value="30">30s</SelectItem>
            <SelectItem value="60">60s</SelectItem>
            <SelectItem value="90">90s</SelectItem>
            <SelectItem value="120">2m</SelectItem>
            <SelectItem value="180">3m</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sets table */}
      <div className="space-y-2">
        {/* Table header */}
        <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-2">
          <div>SET</div>
          <div>PREVIOUS</div>
          <div className="text-center">KG</div>
          <div className="text-center">REPS</div>
          <div className="text-center">RPE</div>
          <div className="text-center">✓</div>
          <div></div>
        </div>

        {/* Sets */}
        {exercise.sets.map((set, index) => (
          <WorkoutSetRow
            key={set.id}
            set={set}
            setNumber={index + 1}
            exerciseId={exercise.id}
            onDuplicate={() => handleDuplicateSet(set.id)}
            onRemove={() => handleRemoveSet(set.id)}
          />
        ))}

        {/* Add set button */}
        <Button variant="outline" onClick={handleAddSet} className="w-full mt-2 bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </div>
    </div>
  );
}
