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
    <Card
      className="
      cursor-pointer transition-all hover:shadow-lg
      rounded-2xl border-2 border-border/60 hover:border-primary/40
      bg-card/60 focus-within:ring-2 focus-within:ring-primary/30
    "
    >
      <CardContent className="p-4 sm:p-5">
        {/* Header: título + botón, mobile-first con buen área táctil */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="min-w-0 line-clamp-2 text-sm sm:text-base font-semibold">
            {ejercicio.nombre ?? "Sin nombre"}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelect(ejercicio)}
            aria-label={`Agregar ${ejercicio.nombre ?? "ejercicio"}`}
            className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Badges: flex-wrap para evitar scroll horizontal y alturas consistentes */}
        <div className="mt-1 flex flex-wrap gap-2">
          {ejercicio.grupo_muscular && (
            <Badge variant="secondary" className="h-6 rounded-full px-2.5 py-0 text-[11px]">
              {ejercicio.grupo_muscular}
            </Badge>
          )}
          {ejercicio.dificultad && (
            <Badge variant="outline" className="h-6 rounded-full px-2.5 py-0 text-[11px]">
              {ejercicio.dificultad}
            </Badge>
          )}
          {ejercicio.equipamento && (
            <Badge variant="outline" className="h-6 rounded-full px-2.5 py-0 text-[11px]">
              {ejercicio.equipamento}
            </Badge>
          )}
        </div>

        {/* Imagen: contenedor con borde y radios para consistencia visual */}
        <div className="mt-3">
          <div className="overflow-hidden rounded-xl border-2 border-border/40">
            <ExerciseImage
              src={ejercicio.ejemplo ?? undefined}
              alt={`Ejemplo de ${ejercicio.nombre ?? "ejercicio"}`}
              aspectRatio="4/3"
              size="md"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
