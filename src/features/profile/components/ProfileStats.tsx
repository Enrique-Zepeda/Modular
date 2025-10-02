import type React from "react";

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

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
      className={`border-2 border-border/60 bg-gradient-to-br from-card via-card/98 to-card/95 shadow-md relative overflow-hidden ${
        clickable
          ? "cursor-pointer hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          : "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
      }`}
      aria-label={clickable ? label : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <CardContent className="p-6 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-primary/20 rounded-xl ring-2 ring-primary/30 shadow-lg shadow-primary/10">{icon}</div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
          <span className="text-3xl font-extrabold truncate bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfileStats({
  summary,
  loading,
  hideLastPanel = false,
  onFriendsClick,
}: {
  summary: ProfileSummary | null;
  loading?: boolean;
  hideLastPanel?: boolean;
  onFriendsClick?: () => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No se encontró información del perfil.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <Stat
          icon={<Activity className="h-6 w-6 text-primary" />}
          label="Entrenamientos"
          value={summary.workouts_count}
        />
        <Stat
          icon={<Clock className="h-6 w-6 text-primary" />}
          label="Tiempo total"
          value={formatHM(summary.total_duration_sec)}
        />
        <Stat
          icon={<Dumbbell className="h-6 w-6 text-primary" />}
          label="Volumen total"
          value={formatKg(summary.total_volume_kg)}
        />
        <Stat
          icon={<Users className="h-6 w-6 text-primary" />}
          label="Amigos"
          value={summary.friends_count}
          onClick={onFriendsClick}
        />
        <Stat
          icon={<History className="h-6 w-6 text-primary" />}
          label="Último entrenamiento"
          value={formatDate(summary.last_ended_at)}
        />
      </div>

      {!hideLastPanel && summary.last_workout_id && (
        <Card className="bg-muted/30 border-muted/40">
          <CardContent className="p-4 text-sm text-muted-foreground">ID sesión: {summary.last_workout_id}</CardContent>
        </Card>
      )}
    </div>
  );
}
