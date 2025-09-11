import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { RoutineExerciseCard } from "./RoutineExerciseCard";

export function RoutineExercisesSection({
  count,
  items,
  isSelectorOpen,
  setIsSelectorOpen,
  ejerciciosExistentes,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd,
  removing,
  routineName,
}: {
  count: number;
  items: Array<{
    key: string;
    title?: string | null;
    group?: string | null;
    description?: string | null;
    series: number;
    reps: number;
    weight: number;
    image?: string | null;
    onRemove: () => void;
  }>;
  isSelectorOpen: boolean;
  setIsSelectorOpen: (v: boolean) => void;
  ejerciciosExistentes: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (data: any) => void;
  removing: boolean;
  routineName: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Ejercicios ({count})</CardTitle>
          <div className="text-sm text-muted-foreground">Usa "Editar Rutina" para modificar ejercicios</div>
        </div>
      </CardHeader>

      <CardContent>
        {count === 0 ? (
          <div className="text-center py-12">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay ejercicios en esta rutina</h3>
            <p className="text-muted-foreground mb-6">Agrega ejercicios para completar tu rutina</p>
            <Button onClick={() => setIsSelectorOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Ejercicio
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {items.map((it, index) => (
                <motion.div
                  key={it.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <RoutineExerciseCard
                    title={it.title}
                    group={it.group}
                    description={it.description}
                    series={it.series}
                    reps={it.reps}
                    weight={it.weight}
                    image={it.image ?? undefined}
                    onRemove={it.onRemove}
                    removing={removing}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
