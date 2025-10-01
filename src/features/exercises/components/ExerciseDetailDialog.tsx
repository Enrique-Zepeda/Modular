import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExerciseImage } from "@/components/ui/exercise-image";
import type { Exercise } from "@/types/exercises";

type Props = {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function ExerciseDetailDialog({ exercise, open, onOpenChange }: Props) {
  const ex = exercise;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {ex ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{ex.nombre ?? "Ejercicio"}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2 pt-2">
                {ex.grupo_muscular ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {ex.grupo_muscular}
                  </Badge>
                ) : null}
                {ex.equipamento ? <Badge variant="outline">{ex.equipamento}</Badge> : null}
                {ex.dificultad ? (
                  <Badge variant="outline" className="capitalize">
                    {ex.dificultad}
                  </Badge>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            {ex.ejemplo ? (
              <div className="rounded-lg overflow-hidden border bg-muted/30">
                <ExerciseImage
                  src={ex.ejemplo ?? undefined}
                  alt={ex.nombre ?? "Ejercicio"}
                  aspectRatio="16/9"
                  size="lg"
                />
              </div>
            ) : null}

            <div className="grid gap-4">
              {ex.musculos_involucrados ? (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Músculos:</span>{" "}
                  <span>{ex.musculos_involucrados}</span>
                </div>
              ) : null}

              <ScrollArea className="max-h-64 rounded-md border">
                <div className="p-4 text-sm leading-relaxed">
                  {ex.descripcion ? ex.descripcion : <span className="text-muted-foreground">Sin descripción.</span>}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end">
              <DialogClose className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">
                Cerrar
              </DialogClose>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ExerciseDetailDialog;
