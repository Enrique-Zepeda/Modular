import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CalendarDays, Trash2 } from "lucide-react";
import { useDeleteWorkoutSessionMutation } from "@/features/workouts/api/workoutsApi";
import toast from "react-hot-toast";

type ExerciseItem = {
  id?: number | string | null;
  nombre?: string | null;
  grupo_muscular?: string | null;
  equipamento?: string | null;
  ejemplo?: string | null; // URL de imagen
  sets_done?: number | null;
  volume?: number | string | null;
};

type Props = {
  idSesion: number;
  titulo: string;
  startedAt: string;
  endedAt: string;
  totalSets: number;
  totalVolume: number;
  username?: string;
  avatarUrl?: string;
  ejercicios?: ExerciseItem[];
  className?: string;
};

/** Formatea "YYYY-MM-DD ..." a "DD/MM/YYYY" sin parsers ni cambios de zona */
const formatAsDMY = (ts?: string) => {
  if (!ts) return "";
  const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return ts;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
};

/** Extrae HH:MM del string y lo muestra en 12h con AM/PM, sin conversión de zona */
const formatHourAmPm = (ts?: string) => {
  if (!ts) return "";
  const m = ts.match(/^[\d-]+[ T](\d{2}):(\d{2})/);
  if (!m) return "";
  const hh = parseInt(m[1], 10);
  const mm = m[2];
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${mm} ${suffix}`;
};

export function WorkoutCard({
  idSesion,
  titulo,
  startedAt,
  endedAt,
  totalSets,
  totalVolume,
  username = "Usuario",
  avatarUrl,
  ejercicios = [],
  className,
}: Props) {
  const endTs = endedAt || startedAt;
  const dateLabel = formatAsDMY(endTs);
  const timeLabel = formatHourAmPm(endTs);

  const initials = (username || "U")
    .split(" ")
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteWorkout, { isLoading: deleting }] = useDeleteWorkoutSessionMutation();

  const handleDelete = async () => {
    try {
      await deleteWorkout({ id_sesion: idSesion }).unwrap();
      toast.success("Entrenamiento eliminado");
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar");
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <Card
      className={cn(
        "bg-card text-card-foreground rounded-2xl border border-border shadow-sm transition-shadow hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          {/* Usuario + fecha */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-1 ring-border">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={username} /> : <AvatarFallback>{initials}</AvatarFallback>}
            </Avatar>
            <div className="leading-tight">
              <div className="text-sm font-medium">{username}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {dateLabel}
                  {timeLabel ? ` · ${timeLabel}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Badges + botón de eliminar (sin menú de 3 puntos) */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-medium">
              Sets: {totalSets}
            </Badge>
            <Badge className="rounded-full px-2.5 py-1 text-xs font-medium">
              Volumen: {Intl.NumberFormat("es-MX").format(totalVolume)} kg
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpenConfirm(true)}
              aria-label="Eliminar entrenamiento"
              title="Eliminar entrenamiento"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
      </CardHeader>

      <CardContent className="pt-4">
        {ejercicios && ejercicios.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {ejercicios.map((ex, idx) => (
              <div
                key={(ex.id ?? idx)?.toString()}
                className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-3"
              >
                {/* Imagen del ejercicio */}
                {ex.ejemplo ? (
                  <img
                    src={ex.ejemplo}
                    alt={ex.nombre ?? "Ejercicio"}
                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-border"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-muted ring-1 ring-border" />
                )}

                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{ex.nombre ?? "Ejercicio"}</div>
                  <div className="text-xs text-muted-foreground">
                    {ex.sets_done ? `${ex.sets_done} sets` : ex.grupo_muscular || "—"}
                    {ex.volume ? ` · ${Intl.NumberFormat("es-MX").format(Number(ex.volume))} kg` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Los ejercicios se mostrarán aquí cuando estén disponibles.
          </div>
        )}
      </CardContent>

      {/* Diálogo de confirmación */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar entrenamiento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la sesión y sus sets asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
