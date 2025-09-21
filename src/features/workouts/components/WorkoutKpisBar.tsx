import { Button } from "@/components/ui/button";

export function WorkoutKpisBar({
  doneSets,
  totalSets,
  totalVolume,
  onExit,
}: {
  doneSets: number;
  totalSets: number;
  totalVolume: number;
  onExit: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border rounded-md p-3 flex items-center justify-between">
      <div className="text-sm flex flex-wrap gap-4">
        <span>
          Sets hechos: <span className="font-medium">{doneSets}</span> / {totalSets}
        </span>
        <span>
          Volumen: <span className="font-medium">{totalVolume.toLocaleString()} kg</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onExit}>
          Salir (sin guardar)
        </Button>
      </div>
    </div>
  );
}
