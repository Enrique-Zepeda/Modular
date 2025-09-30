import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, Clock, Activity, MessageCircle, Heart } from "lucide-react";
import { useGetWorkoutCardByIdQuery } from "@/features/profile/api/userProfileApi";

function fmtHM(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}
function fmtKg(n: number) {
  const fixed = Number.isInteger(n) ? n : Number(n.toFixed(1));
  return `${fixed.toLocaleString()} kg`;
}

export default function LastWorkoutCard({
  sessionId,
  username,
  avatarUrl,
  displayName,
}: {
  sessionId: number;
  username: string | null;
  avatarUrl: string | null;
  displayName: string | null;
}) {
  const { data, isLoading } = useGetWorkoutCardByIdQuery({ sessionId }, { skip: !sessionId });

  if (!sessionId) return null;

  const initials = (displayName || username || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="bg-muted/30 border-muted/40">
      <CardContent className="p-5">
        {isLoading || !data ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header: título rutina y meta del autor/fecha */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{data.routine_name || "Entrenamiento"}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{username ? `@${username}` : "Usuario"}</span>
                  <span>•</span>
                  <span>{new Date(data.ended_at).toLocaleString()}</span>
                </div>
              </div>
              {/* No mostramos acciones (sin botón Ver/Eliminar) */}
            </div>

            {/* Chips principales (sets, volumen, duración, dificultad) */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Activity className="mr-1 h-4 w-4" />
                {data.sets_count} sets
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Dumbbell className="mr-1 h-4 w-4" />
                {fmtKg(data.total_volume_kg)}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Clock className="mr-1 h-4 w-4" />
                {fmtHM(data.duracion_seg)}
              </Badge>
              {data.difficulty_label && <Badge className="rounded-full px-3 py-1">{data.difficulty_label}</Badge>}
            </div>

            {/* Lista de ejercicios */}
            <div className="space-y-2">
              {data.exercises.map((ex) => (
                <div
                  key={ex.id_ejercicio}
                  className="flex items-center gap-3 rounded-xl border border-muted/40 bg-background/40 px-4 py-3"
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted/50 shrink-0">
                    {ex.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ex.imagen_url} alt={ex.nombre} className="h-full w-full object-cover" />
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

            {/* Footer social: solo conteos (no interactivo) */}
            <div className="mt-2 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 rounded-full bg-pink-600/20 px-3 py-1 text-pink-400">
                <Heart className="h-4 w-4" />
                <span>{data.likes_count}</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-blue-600/20 px-3 py-1 text-blue-400">
                <MessageCircle className="h-4 w-4" />
                <span>{data.comments_count}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
