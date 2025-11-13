import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Ejercicio } from "@/types/rutinas";
import { ExerciseCard } from "./ExerciseCard";

interface Props {
  items: Ejercicio[];
  isLoading: boolean;
  onSelect: (e: Ejercicio) => void;
}

export const ExerciseGrid: React.FC<Props> = ({ items, isLoading, onSelect }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl border border-border/50 bg-muted/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No se encontraron ejercicios con los filtros aplicados
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
      <AnimatePresence mode="popLayout">
        {items.map((ejercicio) => (
          <motion.div
            key={ejercicio.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {/* Wrapper h-full para que todas las cards igualen altura dentro del grid */}
            <ExerciseCard ejercicio={ejercicio} onSelect={onSelect} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
