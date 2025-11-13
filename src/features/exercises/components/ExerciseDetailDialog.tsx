import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { Dumbbell, Target } from "lucide-react";
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
      <DialogContent
        className="
          p-0 w-[95vw] sm:max-w-4xl
          h-[100svh] sm:h-auto sm:max-h-[85vh]
          overflow-hidden rounded-none sm:rounded-2xl
        "
      >
        {ex ? (
          <div className="flex h-full flex-col min-h-0">
            {/* Header fijo con safe-area */}
            <DialogHeader className="sticky top-[env(safe-area-inset-top)] z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
              <div className="flex items-start gap-4 p-4 sm:p-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent truncate">
                    {ex.nombre ?? "Ejercicio"}
                  </DialogTitle>
                  <DialogDescription className="flex flex-wrap gap-2 pt-3">
                    {ex.grupo_muscular ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                        <Target className="h-3 w-3 mr-1" />
                        {ex.grupo_muscular}
                      </Badge>
                    ) : null}
                    {ex.equipamento ? (
                      <Badge variant="outline" className="px-3 py-1">
                        {ex.equipamento}
                      </Badge>
                    ) : null}
                    {ex.dificultad ? (
                      <Badge variant="outline" className="capitalize px-3 py-1">
                        {ex.dificultad}
                      </Badge>
                    ) : null}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* ÚNICO scroll del cuerpo */}
            <ScrollArea className="flex-1 min-h-0 overscroll-contain">
              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6 items-start md:items-stretch">
                  {/* Columna izquierda */}
                  <div className="space-y-4 md:h-full">
                    {ex.ejemplo ? (
                      <div className="rounded-xl overflow-hidden border-2 border-border/60 bg-muted/30 shadow-lg">
                        <ExerciseImage
                          src={ex.ejemplo ?? undefined}
                          alt={ex.nombre ?? "Ejercicio"}
                          aspectRatio="16/9"
                          size="lg"
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">Sin imagen disponible</p>
                        </div>
                      </div>
                    )}

                    {ex.musculos_involucrados ? (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-border/60">
                        <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                          Músculos Involucrados
                        </p>
                        <p className="text-base font-medium">{ex.musculos_involucrados}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-4 md:h-full md:flex md:flex-col min-h-0">
                    <div className="min-h-0">
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-600 rounded-full" />
                        Descripción e Instrucciones
                      </h3>

                      {/* Paracaídas en mobile: si el contenido es muy largo, también puede scrollear aquí */}
                      <div className="rounded-xl border-2 border-border/60 bg-muted/20">
                        <div className="p-4 text-sm leading-relaxed max-h-[50vh] sm:max-h-none overflow-y-auto">
                          {ex.descripcion ? (
                            <p className="whitespace-pre-wrap">{ex.descripcion}</p>
                          ) : (
                            <span className="text-muted-foreground italic">Sin descripción disponible.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacer para que el footer fijo no tape el último contenido */}
                <div aria-hidden className="h-24 sm:h-10" />
              </div>
            </ScrollArea>

            {/* Footer fijo con safe-area */}
            <DialogFooter className="sticky bottom-0 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <DialogClose className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border-2 border-border/60 bg-background px-6 h-11 text-sm font-semibold hover:bg-muted transition-colors">
                Cerrar
              </DialogClose>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ExerciseDetailDialog;
