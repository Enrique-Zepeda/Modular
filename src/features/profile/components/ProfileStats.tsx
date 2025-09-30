import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, Users, History, Dumbbell } from "lucide-react";
import type { ProfileSummary } from "../types";

function formatHM(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
function formatKg(n: number) {
  const fixed = Number.isInteger(n) ? n : Number(n.toFixed(1));
  return `${fixed.toLocaleString()} kg`;
}

type StatProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onClick?: () => void; // 👈 hace el stat clickeable cuando se pasa
};
function Stat({ icon, label, value, onClick }: StatProps) {
  const clickable = !!onClick;

  return (
    <Card
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`bg-muted/30 border-muted/40 ${
        clickable
          ? "cursor-pointer hover:bg-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          : ""
      }`}
      aria-label={clickable ? label : undefined}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-lg font-semibold truncate">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfileStats({
  summary,
  loading,
  hideLastPanel = false, // permite ocultar el panel simple del último entrenamiento
  onFriendsClick, // 👈 NUEVO: handler para abrir el modal
}: {
  summary: ProfileSummary | null;
  loading?: boolean;
  hideLastPanel?: boolean;
  onFriendsClick?: () => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="bg-muted/30 border-muted/40">
        <CardContent className="p-6 text-sm text-muted-foreground">No encontramos este perfil.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat icon={<Activity className="h-5 w-5" />} label="Entrenamientos" value={summary.workouts_count} />
        <Stat icon={<Clock className="h-5 w-5" />} label="Tiempo total" value={formatHM(summary.total_duration_sec)} />
        <Stat icon={<Dumbbell className="h-5 w-5" />} label="Volumen total" value={formatKg(summary.total_volume_kg)} />
        {/* 👇 Esta es la tarjeta clickeable */}
        <Stat
          icon={<Users className="h-5 w-5" />}
          label="Amigos"
          value={summary.friends_count}
          onClick={onFriendsClick}
        />
        <Stat
          icon={<History className="h-5 w-5" />}
          label="Último entrenamiento"
          value={summary.last_ended_at ? new Date(summary.last_ended_at).toLocaleString() : "—"}
        />
      </div>

      {!hideLastPanel && summary.last_workout_id && (
        <Card className="bg-muted/30 border-muted/40">
          <CardContent className="p-4 text-sm text-muted-foreground">
            {/* Panel simple antiguo; ahora lo solemos ocultar y usar LastWorkoutCard */}
            ID sesión: {summary.last_workout_id}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
