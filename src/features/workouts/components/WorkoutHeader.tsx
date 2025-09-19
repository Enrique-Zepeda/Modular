import { ArrowLeft, Clock, Weight, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutHeaderProps {
  routineName: string;
  duration: number;
  volume: number;
  sets: number;
  onBack: () => void;
  onFinish: () => void;
  onToggleLibrary: () => void;
}

export function WorkoutHeader({
  routineName,
  duration,
  volume,
  sets,
  onBack,
  onFinish,
  onToggleLibrary,
}: WorkoutHeaderProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card border-b px-4 py-3">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{routineName}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToggleLibrary}>
            <Plus className="h-4 w-4 mr-1" />
            Library
          </Button>
          <Button onClick={onFinish} className="bg-blue-600 hover:bg-blue-700">
            Finish
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium text-blue-500">{formatDuration(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Weight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Volume</span>
          <span className="font-medium">{volume.toLocaleString()} kg</span>
        </div>

        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Sets</span>
          <span className="font-medium">{sets}</span>
        </div>
      </div>
    </div>
  );
}
