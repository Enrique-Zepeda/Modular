import { Dumbbell, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

export function ExercisesHeader({ total, groups }: { total: number; groups: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/15 via-purple-500/10 to-background p-10 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)] pointer-events-none" />

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center space-y-5"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <Dumbbell className="h-12 w-12 text-primary animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 text-purple-500 animate-ping opacity-20">
              <Dumbbell className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Biblioteca de Ejercicios
          </h1>
        </div>

        <p className="text-lg text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
          Descubre y explora nuestra colección completa de ejercicios para todos los niveles y objetivos
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{total} ejercicios disponibles</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-foreground">{groups} grupos musculares</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
