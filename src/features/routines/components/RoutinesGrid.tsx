import { AnimatePresence } from "framer-motion";
import type { Rutina } from "@/features/routines/api/rutinasApi";
import { RoutineCard } from "./RoutineCard";

export function RoutinesGrid({ items, onDelete }: { items: Rutina[]; onDelete: (id: number, name: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {items.map((routine, index) => (
          <RoutineCard key={routine.id_rutina} routine={routine} index={index} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
}
