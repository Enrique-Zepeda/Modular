import { AnimatePresence, motion } from "framer-motion";
import type { Exercise } from "@/types/exercises";
import { ExercisesListCard } from "./ExercisesListCard";

export function ExerciseGrid({ items, onSelect }: { items: Exercise[]; onSelect?: (exercise: Exercise) => void }) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <AnimatePresence>
        {items.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }} /* evita re-animar al hacer scroll; mejor perf en móvil */
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="group cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation"
            onClick={() => onSelect?.(exercise)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && onSelect) {
                e.preventDefault();
                onSelect(exercise);
              }
            }}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : -1}
            aria-label={onSelect ? `Ver detalles de ${exercise?.nombre ?? exercise?.name ?? "ejercicio"}` : undefined}
          >
            <ExercisesListCard exercise={exercise} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
