import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { KpiProgress } from "./KpiProgress";
import { useAppSelector } from "@/hooks";
import { presentInUserUnit } from "@/lib/weight";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  doneSets: number;
  totalSets: number;
  totalVolume: number;
  onExit: () => void;
  onFinish: () => void;
  saving?: boolean;
};

export function WorkoutKpisBar({ doneSets, totalSets, totalVolume, onExit, onFinish, saving }: Props) {
  const userUnit = useAppSelector((s) => s.preferences?.weightUnit ?? "kg");
  const displayVolume = presentInUserUnit(totalVolume ?? 0, userUnit);

  // Estado local para el diálogo de confirmación de "Finalizar rutina"
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* KPIs */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sets completados:</span>
            <span className="font-semibold tabular-nums text-primary">{doneSets}</span>
            <span className="text-muted-foreground">/ {totalSets}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Volumen total:</span>
            <span className="font-semibold tabular-nums">
              {displayVolume.toLocaleString()}
              {userUnit}
            </span>
          </div>
          <div className="w-full md:w-auto">
            <KpiProgress done={doneSets} total={totalSets} />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button variant="secondary" onClick={onExit} className="h-10 sm:h-9 w-full sm:w-auto justify-center gap-2">
            Salir (sin guardar)
          </Button>

          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!!saving}
            className="h-10 sm:h-9 w-full sm:w-auto justify-center gap-2"
          >
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

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Estás seguro de terminar tu rutina?</DialogTitle>
            <DialogDescription>
              Se guardará tu entrenamiento y no podrás seguir editándolo. Puedes revisarlo después en tu historial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={!!saving}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                onFinish();
              }}
              disabled={!!saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizando…
                </>
              ) : (
                "Sí, finalizar rutina"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
