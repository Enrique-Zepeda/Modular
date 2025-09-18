import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import type { WorkoutListItem } from "@/features/workout/api/workoutsApi";

// ⬇️ shadcn AlertDialog (reutilizado de tu proyecto)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  workout: WorkoutListItem;
  onDelete?: (id_sesion: number) => Promise<void> | void;
};

function fmtDate(dt: string | null | undefined) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString();
}

export function WorkoutCard({ workout, onDelete }: Props) {
  const totalSets = workout.sets?.length ?? 0;
  const doneSets = workout.sets?.filter((s) => s.done).length ?? 0;

  // Agrupar sets HECHOS por ejercicio (para imagen única + series en vertical)
  const groups = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        nombre: string | null | undefined;
        imagen: string | null | undefined;
        sets: { idx: number; kg: number; reps: number }[];
      }
    >();

    (workout.sets ?? [])
      .filter((s) => s.done)
      .forEach((s) => {
        const exId = s.id_ejercicio;
        const g = map.get(exId) ?? {
          id: exId,
          nombre: s.Ejercicios?.nombre,
          imagen: s.Ejercicios?.ejemplo,
          sets: [],
        };
        g.sets.push({ idx: s.idx, kg: s.kg, reps: s.reps });
        map.set(exId, g);
      });

    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const an = (a.nombre || "").toLowerCase();
      const bn = (b.nombre || "").toLowerCase();
      if (an && bn && an !== bn) return an < bn ? -1 : 1;
      return a.id - b.id;
    });
    arr.forEach((g) => g.sets.sort((s1, s2) => s1.idx - s2.idx));
    return arr;
  }, [workout.sets]);

  // Estado del diálogo y loading del borrado
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!onDelete) return;
    try {
      setDeleting(true);
      await onDelete(workout.id_sesion);
      setConfirmOpen(false);
      toast.success("Entrenamiento eliminado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar el entrenamiento");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">{workout.Rutinas?.nombre ?? "Entrenamiento"}</CardTitle>
          <div className="text-xs text-muted-foreground">
            {fmtDate(workout.ended_at)} • {Math.max(0, workout.duracion_seg ?? 0)} s
          </div>
        </div>

        {/* Botón que abre el diálogo de confirmación */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Eliminar entrenamiento">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este entrenamiento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se borrarán la sesión y sus sets asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            Volumen: <strong>{(workout.total_volumen ?? 0).toLocaleString()} kg</strong>
          </span>
          <span>
            Sets:{" "}
            <strong>
              {doneSets}/{totalSets}
            </strong>
          </span>
          {workout.sensacion_global && <span>🤔 {workout.sensacion_global}</span>}
        </div>

        <Separator />

        {/* Resumen por ejercicio (imagen única + series enumeradas en vertical) */}
        <div className="space-y-3">
          {groups.length === 0 && <div className="text-sm text-muted-foreground">No hay sets completados.</div>}

          {groups.map((g) => (
            <div key={g.id} className="rounded-md border p-3">
              <div className="flex items-center gap-3 mb-2">
                {g.imagen ? (
                  <img
                    src={g.imagen}
                    alt={g.nombre ?? `Ejercicio #${g.id}`}
                    className="h-10 w-10 rounded-md object-cover border"
                    onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = "Sin imagen"))}
                  />
                ) : (
                  <div className="h-10 w-10 grid place-items-center rounded-md border">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="text-sm font-medium">{g.nombre ?? `Ejercicio #${g.id}`}</div>
              </div>

              <ul className="space-y-1 pl-1">
                {g.sets.map((s) => (
                  <li key={s.idx} className="text-sm tabular-nums">
                    <span className="text-muted-foreground mr-1">Serie {s.idx}:</span>
                    {s.kg} kg × {s.reps} reps
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
