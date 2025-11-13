import type React from "react";

import { SortableItem } from "@/components/ui/sortable-item";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import type { WorkoutExercise } from "../types";

export function WorkoutExerciseList({
  exercises,
  onReorder,
  renderItem,
  dndIdKey = (ex: WorkoutExercise) => ex.id_ejercicio,
}: {
  exercises: WorkoutExercise[];
  onReorder: (items: WorkoutExercise[]) => void;
  renderItem: (ex: WorkoutExercise, index: number) => React.ReactNode;
  dndIdKey?: (ex: WorkoutExercise) => string | number;
}) {
  const { sensors, handleDragEnd, DndContext, SortableContext, verticalListSortingStrategy, closestCenter } =
    useDragAndDrop(exercises, (newExercises: WorkoutExercise[]) => {
      const densified = newExercises.map((ex, i) => ({ ...ex, orden: i + 1 }));
      onReorder(densified);
    });

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 touch-pan-y">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={exercises.map(dndIdKey)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {exercises.map((ex, ei) => (
              <div
                key={`wex-${dndIdKey(ex)}`}
                role="group"
                className="
                rounded-xl sm:rounded-2xl
                -m-1 sm:-m-2 p-2
                bg-transparent
                transition-all duration-200 will-change-transform
                focus-within:ring-2 focus-within:ring-primary/30
                md:hover:bg-muted/10 md:hover:shadow-lg md:hover:scale-[1.005]
              "
              >
                <SortableItem id={dndIdKey(ex)} className="touch-pan-y select-none">
                  {renderItem(ex, ei)}
                </SortableItem>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
