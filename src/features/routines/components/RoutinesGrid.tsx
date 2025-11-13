import { AnimatePresence } from "framer-motion";
import type { Rutina } from "@/features/routines/api/rutinasApi";
import { RoutineCard } from "./RoutineCard";

export function RoutinesGrid({ items, onDelete }: { items: Rutina[]; onDelete: (id: number, name: string) => void }) {
  return (
    <div
      className="
      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
      gap-4 sm:gap-6 items-stretch min-w-0
    "
    >
      {/* Mobile-first; más columnas progresivas.
        items-stretch para que las cards ocupen el alto disponible sin romper layout */}
      <AnimatePresence initial={false}>
        {items.map((routine, index) => (
          <RoutineCard key={routine.id_rutina} routine={routine} index={index} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
}
