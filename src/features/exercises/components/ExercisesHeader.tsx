import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export function ExercisesHeader({ total, groups }: { total: number; groups: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
        <Dumbbell className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
        Biblioteca de Ejercicios
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Descubre y explora nuestra colección completa de ejercicios para todos los niveles
      </p>
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
          <span>{total} ejercicios mostrados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span>{groups} grupos musculares</span>
        </div>
      </div>
    </motion.div>
  );
}
