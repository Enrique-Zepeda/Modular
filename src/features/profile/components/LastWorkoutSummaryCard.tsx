import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, Clock, Activity } from "lucide-react";
import {
  useGetPublicLastWorkoutByUsernameQuery,
  useGetPublicLastWorkoutExercisesByUsernameQuery,
} from "@/features/profile/api/userProfileApi";
import { formatDurationShort } from "@/lib/duration";
import { normalizeSensation } from "@/features/workouts/utils/sensation";

function fmtKg(n: number) {
  const fixed = Number.isInteger(n) ? n : Number(n.toFixed(1));
  return `${fixed.toLocaleString()} kg`;
}

export default function LastWorkoutSummaryCard({
  username,
  displayName,
  avatarUrl,
}: {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const lastQ = useGetPublicLastWorkoutByUsernameQuery({ username }, { skip: !username });
  const exQ = useGetPublicLastWorkoutExercisesByUsernameQuery({ username }, { skip: !username });

  const initials = (displayName || username || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isLoading = lastQ.isLoading || exQ.isLoading;
  const last = lastQ.data ?? null;
  const exercises = exQ.data ?? [];

  const durationLabel = last?.duracion_seg != null ? formatDurationShort(last.duracion_seg) : null;
  const sensationLabel = last?.difficulty_label ? normalizeSensation(last.difficulty_label) : null;

  return (
    <Card className="bg-muted/30 border-muted/40">
      <CardContent className="p-5">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : !last ? (
          <div className="text-sm text-muted-foreground">Este usuario aún no tiene entrenamientos finalizados.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Encabezado: autor y fecha */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="font-medium">@{username}</span>
              <span>•</span>
              <span>{new Date(last.ended_at).toLocaleString()}</span>
            </div>

            {/* Chips: sets, volumen, duración y sensación */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Activity className="mr-1 h-4 w-4" /> {last.sets_count} sets
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Dumbbell className="mr-1 h-4 w-4" /> {fmtKg(last.total_volume_kg)}
              </Badge>
              {durationLabel && (
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <Clock className="mr-1 h-4 w-4" /> {durationLabel}
                </Badge>
              )}
              {sensationLabel && <Badge className="rounded-full px-3 py-1">{sensationLabel}</Badge>}
            </div>

            {/* Lista de ejercicios del último entrenamiento */}
            {exercises.length > 0 && (
              <div className="space-y-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.id_ejercicio}
                    className="flex items-center gap-3 rounded-xl border border-muted/40 bg-background/40 px-4 py-3"
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted/50 shrink-0">
                      {ex.imagen_url ? (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <img src={ex.imagen_url} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{ex.nombre}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {ex.sets_count} sets
                      </Badge>
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {fmtKg(ex.volume_kg)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
