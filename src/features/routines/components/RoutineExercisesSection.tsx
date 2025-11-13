import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { RoutineExerciseCard } from "./RoutineExerciseCard";

export function RoutineExercisesSection({
  count,
  items,

  setIsSelectorOpen,

  removing,
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
    <Card className="rounded-2xl border-2 border-border/60 bg-card/50 shadow-sm overflow-hidden">
      <CardHeader className="p-5 sm:p-6">
        {/* Layout responsive: título en columna en móvil, fila en desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl font-bold text-balance">Ejercicios ({count})</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        {count === 0 ? (
          <div className="flex flex-col items-center text-center py-10">
            <Plus className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No hay ejercicios en esta rutina</h3>
            <p className="mb-6 max-w-prose text-sm sm:text-base text-muted-foreground text-pretty">
              Agrega ejercicios para completar tu rutina
            </p>
            <Button onClick={() => setIsSelectorOpen(true)} className="h-11 w-full sm:w-auto rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Ejercicio
            </Button>
          </div>
        ) : (
          <div
            className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
            gap-4 sm:gap-6 items-stretch min-w-0
          "
          >
            <AnimatePresence initial={false}>
              {items.map((it, index) => (
                <motion.div
                  key={it.key}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="min-w-0"
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
