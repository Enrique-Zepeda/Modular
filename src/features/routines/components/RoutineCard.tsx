import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Trash2, User, Target, Clock, Calendar as CalendarIcon } from "lucide-react";
import type { Rutina } from "../api/rutinasApi";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

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

export function RoutineCard({
  routine,
  index,
  onDelete,
}: {
  routine: Rutina;
  index: number;
  onDelete: (id: number, name: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-border rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg">
                {routine.nombre}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {routine.descripcion || "Sin descripción"}
              </CardDescription>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/routines/${routine.id_rutina}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(routine.id_rutina, routine.nombre ?? "Sin nombre")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <Link to={`/dashboard/routines/${routine.id_rutina}`}>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {routine.nivel_recomendado && (
                <Badge variant={levelVariant(routine.nivel_recomendado)} className="rounded-full">
                  <User className="h-3 w-3 mr-1" />
                  {routine.nivel_recomendado}
                </Badge>
              )}
              {routine.objetivo && (
                <Badge variant={objectiveVariant(routine.objetivo)} className="rounded-full">
                  <Target className="h-3 w-3 mr-1" />
                  {routine.objetivo}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {routine.duracion_estimada && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{routine.duracion_estimada} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>0 ejercicios</span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}
