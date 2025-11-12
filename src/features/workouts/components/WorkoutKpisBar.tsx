import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { KpiProgress } from "./KpiProgress";
import { useAppSelector } from "@/hooks";
import { presentInUserUnit } from "@/lib/weight";

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
            <span className="font-semibold tabular-nums">
              {displayVolume.toLocaleString()}
              {userUnit}
            </span>
          </div>
          <KpiProgress done={doneSets} total={totalSets} />
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
