import { AnimatePresence, motion } from "framer-motion";
import type { Exercise } from "@/types/exercises";
import { ExerciseCard } from "./ExerciseCard";

export function ExerciseGrid({ items }: { items: Exercise[] }) {
  return (
    <motion.div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <AnimatePresence>
        {items.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <ExerciseCard exercise={exercise} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
