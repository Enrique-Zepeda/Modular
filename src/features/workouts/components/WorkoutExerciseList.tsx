import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="space-y-4 p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={exercises.map(dndIdKey)} strategy={verticalListSortingStrategy}>
            {exercises.map((ex, ei) => (
              <SortableItem key={`wex-${dndIdKey(ex)}`} id={dndIdKey(ex)}>
                {renderItem(ex, ei)}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
