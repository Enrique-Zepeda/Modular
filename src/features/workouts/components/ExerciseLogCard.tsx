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
    <div className="bg-card rounded-xl sm:rounded-lg border p-3 sm:p-4 space-y-4">
      {/* Header: apilado en móvil, acciones a la derecha en sm+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0 touch-pan-y">
          <GripVertical
            className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
            aria-hidden="true"
          />
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-muted rounded-full grid place-items-center shrink-0">
            <span className="text-[11px] sm:text-xs font-medium">{exercise.exerciseName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate">{exercise.exerciseName}</h3>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="self-end sm:self-auto h-9">
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

      {/* Notes */}
      {showNotes && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add notes here..."
            value={exercise.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[80px] rounded-xl"
          />
          <div className="text-[11px] sm:text-xs text-muted-foreground text-right">{exercise.notes.length}/500</div>
        </div>
      )}

      {/* Rest timer: compacto en móvil */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-muted-foreground">Rest Timer:</span>
        </div>
        <Select value={exercise.restTimer.toString()} onValueChange={handleRestTimerChange}>
          <SelectTrigger className="h-9 sm:h-8 w-24 rounded-xl">
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

      {/* Sets */}
      <div className="space-y-2">
        {/* Header de tabla: oculto en móvil para evitar “dientes” */}
        <div className="hidden md:grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-2">
          <div>SET</div>
          <div>PREVIOUS</div>
          <div className="text-center">KG</div>
          <div className="text-center">REPS</div>
          <div className="text-center">RPE</div>
          <div className="text-center">✓</div>
          <div></div>
        </div>

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

        {/* Add set */}
        <Button variant="outline" onClick={handleAddSet} className="w-full mt-2 h-10 rounded-xl bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </div>
    </div>
  );
}
