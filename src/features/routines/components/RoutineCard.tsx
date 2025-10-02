import type React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, User, Target, Clock, Dumbbell } from "lucide-react";
import type { Rutina } from "../api/rutinasApi";

const levelVariant = (level: string | null): BadgeVariant => {
  switch (level) {
    case "principiante":
      return "default";
    case "intermedio":
      return "secondary";
    case "avanzado":
      return "destructive";
    default:
      return "outline";
  }
};

const objectiveVariant = (objective: string | null): BadgeVariant => {
  switch (objective) {
    case "fuerza":
      return "default";
    case "hipertrofia":
      return "secondary";
    case "resistencia":
      return "outline";
    default:
      return "outline";
  }
};

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function RoutineCard({
  routine,
  index,
  onDelete,
}: {
  routine: Rutina;
  index: number;
  onDelete: (id: number, name: string) => void;
}) {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-dropdown-trigger]")) {
      return;
    }
    navigate(`/dashboard/routines/${routine.id_rutina}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card
        className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-border/60 hover:border-primary/40 rounded-2xl shadow-lg bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden"
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-xl font-bold">
                {routine.nombre}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-2 text-base leading-relaxed">
                {routine.descripcion || "Sin descripción"}
              </CardDescription>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild data-dropdown-trigger>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(routine.id_rutina, routine.nombre ?? "Sin nombre");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          <div className="flex flex-wrap gap-2">
            {routine.nivel_recomendado && (
              <Badge
                variant={levelVariant(routine.nivel_recomendado)}
                className="rounded-full px-3 py-1 bg-primary/15 border border-primary/30 text-primary font-semibold"
              >
                <User className="h-3 w-3 mr-1" />
                {routine.nivel_recomendado}
              </Badge>
            )}
            {routine.objetivo && (
              <Badge
                variant={objectiveVariant(routine.objetivo)}
                className="rounded-full px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-semibold"
              >
                <Target className="h-3 w-3 mr-1" />
                {routine.objetivo}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/40">
            {routine.duracion_estimada && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{routine.duracion_estimada} min</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Dumbbell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium">{routine.ejercicios_count || 0} ejercicios</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
