import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardKpis } from "@/features/dashboard/components";
import { FinishedWorkoutsSection } from "@/features/workouts/components";
import { motion } from "framer-motion";
import { BarChart3, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-10"
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/30 via-muted/10 to-transparent p-8 border border-border/40"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01]" />
        <div className="relative flex items-center gap-5">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
            className="relative"
          >
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-lg" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shadow-xl">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mt-2 text-lg leading-relaxed"
            >
              Bienvenido de vuelta. Aquí tienes un resumen completo de tu progreso y actividad.
            </motion.p>
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <motion.div
            animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="h-2 w-2 rounded-full bg-primary/60"
          />
        </div>
        <div className="absolute bottom-6 right-12 opacity-15">
          <motion.div
            animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
            className="h-1.5 w-1.5 rounded-full bg-primary/40"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <DashboardKpis />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl">
          <CardHeader className="relative bg-gradient-to-br from-muted/40 via-muted/20 to-transparent border-b border-border/40 p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-transparent" />
            <CardTitle className="relative flex items-center gap-4 text-2xl font-bold">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shadow-lg"
              >
                <Activity className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Entrenamientos recientes
                </span>
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  Tu historial de entrenamientos más reciente
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <FinishedWorkoutsSection />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
