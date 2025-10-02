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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        {ex ? (
          <div className="space-y-6">
            <DialogHeader className="space-y-4 pb-4 border-b border-border/40">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
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

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Image */}
              <div className="space-y-4">
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

              {/* Right Column - Description */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <div className="h-6 w-1 bg-gradient-to-b from-primary to-purple-600 rounded-full" />
                    Descripción e Instrucciones
                  </h3>
                  <ScrollArea className="h-[300px] rounded-xl border-2 border-border/60 bg-muted/20">
                    <div className="p-4 text-sm leading-relaxed">
                      {ex.descripcion ? (
                        <p className="whitespace-pre-wrap">{ex.descripcion}</p>
                      ) : (
                        <span className="text-muted-foreground italic">Sin descripción disponible.</span>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/40">
              <DialogClose className="inline-flex items-center justify-center rounded-xl border-2 border-border/60 bg-background px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
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
