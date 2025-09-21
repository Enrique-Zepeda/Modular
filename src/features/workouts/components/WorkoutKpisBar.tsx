import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  doneSets: number;
  totalSets: number;
  totalVolume: number;
  onExit: () => void;
  /** Nuevo: handler para finalizar desde la barra */
  onFinish: () => void;
  /** Nuevo: estado de guardado para deshabilitar y mostrar loader */
  saving?: boolean;
};

export function WorkoutKpisBar({ doneSets, totalSets, totalVolume, onExit, onFinish, saving }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sets completados:</span>
            <span className="font-semibold tabular-nums text-primary">{doneSets}</span>
            <span className="text-muted-foreground">/ {totalSets}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Volumen total:</span>
            <span className="font-semibold tabular-nums">{totalVolume.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onExit} className="gap-2">
            Salir (sin guardar)
          </Button>

          <Button onClick={onFinish} disabled={!!saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              "Finalizar rutina"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
