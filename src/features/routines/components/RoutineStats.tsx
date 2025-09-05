import { Card, CardContent } from "@/components/ui/card";
import { User, Target, Clock } from "lucide-react";

export function RoutineStats({
  nivel,
  objetivo,
  duracion,
}: {
  nivel?: string | null;
  objetivo?: string | null;
  duracion?: number | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nivel</p>
              <p className="text-lg font-semibold capitalize">{nivel || "No especificado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Objetivo</p>
              <p className="text-lg font-semibold capitalize">{objetivo || "No especificado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duración</p>
              <p className="text-lg font-semibold">{duracion ? `${duracion} min` : "No especificada"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
