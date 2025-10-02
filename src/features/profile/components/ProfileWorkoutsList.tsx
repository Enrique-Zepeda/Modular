import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutCard } from "@/features/workouts/components/WorkoutCard";
import { useLazyGetWorkoutsByUsernameQuery } from "@/features/workouts/api/workoutsApi";

type Props = {
  username: string; // sin @
  avatarUrl?: string | null;
  isMine?: boolean;
};

type Item = {
  id_sesion: number;
  titulo: string | null;
  started_at: string | null;
  ended_at: string | null;
  duracion_seg: number | null;
  total_sets: number;
  total_volume_kg: number;
  sensacion: string | null;
  ejercicios: Array<{
    id_ejercicio: number;
    nombre: string;
    sets: number;
    volumen_kg: number;
    ejemplo?: string | null;
  }>;
};

export default function ProfileWorkoutsList({ username, avatarUrl, isMine = false }: Props) {
  const [trigger] = useLazyGetWorkoutsByUsernameQuery();
  const [items, setItems] = React.useState<Item[]>([]);
  const [page, setPage] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadPage = React.useCallback(
    async (pageIndex: number, replace = false) => {
      if (!username) return;
      if (pageIndex > 0) setIsFetchingMore(true);
      try {
        const res = await trigger({ username, page: pageIndex, pageSize: 10 }).unwrap();
        setHasMore(res.hasMore);
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "No se pudieron cargar los entrenamientos.");
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [trigger, username]
  );

  React.useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setIsLoading(true);
    loadPage(0, true);
  }, [username, loadPage]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-destructive/40 bg-gradient-to-br from-destructive/5 to-destructive/10">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Aún no hay entrenamientos para mostrar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((w) => (
        <WorkoutCard
          key={w.id_sesion}
          idSesion={w.id_sesion}
          titulo={w.titulo ?? "Entrenamiento"}
          startedAt={w.started_at ?? ""}
          endedAt={w.ended_at ?? ""}
          totalSets={w.total_sets}
          totalVolume={w.total_volume_kg}
          username={username}
          avatarUrl={avatarUrl ?? undefined}
          ejercicios={w.ejercicios.map((e) => ({
            id: String(e.id_ejercicio),
            nombre: e.nombre,
            sets_done: e.sets,
            volume: e.volumen_kg,
            ejemplo: e.ejemplo ?? undefined,
          }))}
          sensacionFinal={w.sensacion}
          duracionSeg={w.duracion_seg}
          isMine={isMine}
          readOnly={!isMine}
          onDeleted={() => {
            setItems([]);
            setPage(0);
            setHasMore(true);
            setIsLoading(true);
            loadPage(0, true);
          }}
        />
      ))}
      {hasMore && (
        <div className="pt-4">
          <Button
            variant="secondary"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              loadPage(next);
            }}
            disabled={isFetchingMore}
            className="w-full h-12 text-base font-bold rounded-xl border-2 border-border/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02]"
          >
            {isFetchingMore ? "Cargando…" : "Cargar más entrenamientos"}
          </Button>
        </div>
      )}
    </div>
  );
}
