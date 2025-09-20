import React from "react";
import type { Ejercicio } from "@/types/rutinas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ExerciseImage } from "@/components/ui/exercise-image";

interface Props {
  ejercicio: Ejercicio;
  onSelect: (e: Ejercicio) => void;
}

export const ExerciseCard: React.FC<Props> = ({ ejercicio, onSelect }) => {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="line-clamp-2 text-sm font-semibold">{ejercicio.nombre ?? "Sin nombre"}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelect(ejercicio)}
            aria-label={`Agregar ${ejercicio.nombre ?? "ejercicio"}`}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          {ejercicio.grupo_muscular && (
            <Badge variant="secondary" className="text-xs">
              {ejercicio.grupo_muscular}
            </Badge>
          )}
          {ejercicio.dificultad && (
            <Badge variant="outline" className="text-xs">
              {ejercicio.dificultad}
            </Badge>
          )}
          {ejercicio.equipamento && (
            <Badge variant="outline" className="text-xs">
              {ejercicio.equipamento}
            </Badge>
          )}
        </div>

        <div className="mt-3">
          <ExerciseImage
            src={ejercicio.ejemplo ?? undefined}
            alt={`Ejemplo de ${ejercicio.nombre ?? "ejercicio"}`}
            aspectRatio="4/3"
            size="md"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
