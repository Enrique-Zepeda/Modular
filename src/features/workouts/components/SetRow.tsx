import { useState } from "react";
import { Copy, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppDispatch } from "@/hooks/useStore";

import { cn } from "@/lib/utils";
import { toggleSetCompleted, updateSetValue, type WorkoutSet } from "../store/workoutLogSlice";

interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
  exerciseId: string;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function SetRow({ set, setNumber, exerciseId, onDuplicate, onRemove }: SetRowProps) {
  const dispatch = useAppDispatch();
  const [showRPE, setShowRPE] = useState(false);

  const handleValueChange = (field: "weight" | "reps" | "rpe", value: string) => {
    const numValue = value === "" ? null : Number.parseFloat(value);
    dispatch(
      updateSetValue({
        exerciseId,
        setId: set.id,
        field,
        value: numValue,
      })
    );
  };

  const handleToggleCompleted = () => {
    dispatch(
      toggleSetCompleted({
        exerciseId,
        setId: set.id,
      })
    );
  };

  return (
    <div
      className={cn(
        "grid grid-cols-7 gap-2 items-center p-2 rounded-lg transition-colors",
        set.completed ? "bg-green-500/10 border border-green-500/20" : "bg-muted/30"
      )}
    >
      {/* Set number */}
      <div className="text-sm font-medium text-center">{setNumber}</div>

      {/* Previous */}
      <div className="text-xs text-muted-foreground text-center">
        {set.previous ? (
          <div>
            <div>
              {set.previous.weight}kg x {set.previous.reps}
            </div>
            <div className="text-xs">@ {Math.floor(Math.random() * 3) + 8} rpe</div>
          </div>
        ) : (
          "-"
        )}
      </div>

      {/* Weight */}
      <div>
        <Input
          type="number"
          placeholder="0"
          value={set.weight || ""}
          onChange={(e) => handleValueChange("weight", e.target.value)}
          disabled={set.completed}
          className="h-8 text-center"
        />
      </div>

      {/* Reps */}
      <div>
        <Input
          type="number"
          placeholder="0"
          value={set.reps || ""}
          onChange={(e) => handleValueChange("reps", e.target.value)}
          disabled={set.completed}
          className="h-8 text-center"
        />
      </div>

      {/* RPE */}
      <div>
        {showRPE ? (
          <Input
            type="number"
            placeholder="RPE"
            min="1"
            max="10"
            value={set.rpe || ""}
            onChange={(e) => handleValueChange("rpe", e.target.value)}
            disabled={set.completed}
            className="h-8 text-center"
            onBlur={() => setShowRPE(false)}
            autoFocus
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRPE(true)}
            disabled={set.completed}
            className="h-8 w-full text-xs"
          >
            {set.rpe ? set.rpe : "RPE"}
          </Button>
        )}
      </div>

      {/* Completed checkbox */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCompleted}
          className={cn(
            "h-8 w-8 p-0 rounded-full",
            set.completed
              ? "bg-green-500 text-white hover:bg-green-600"
              : "border-2 border-muted-foreground hover:border-green-500"
          )}
        >
          {set.completed && <Check className="h-4 w-4" />}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onDuplicate} className="h-6 w-6 p-0">
          <Copy className="h-3 w-3" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Set</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this set? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
