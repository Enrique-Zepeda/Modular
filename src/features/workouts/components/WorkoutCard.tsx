import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarDays, Trash2, TrendingUp, Dumbbell, Heart, MessageCircle, Send } from "lucide-react";
import { useDeleteWorkoutSessionMutation } from "@/features/workouts/api/workoutsApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  /** Encabezado opcional de agrupación por día: "Hoy" | "Ayer" | "19 Sep 2025" */
  dayHeader?: string | null;
  sensacionFinal?: string | null;
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
  const hh = Number.parseInt(m[1], 10);
  const mm = m[2];
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${mm} ${suffix}`;
};

/** Clave YYYY-MM-DD en zona horaria dada (para comparar días sin libs externas) */
const ymdKey = (d: Date, timeZone = "America/Mexico_City") =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

/** Devuelve "Hoy" | "Ayer" | "DD/MM/YYYY" (para la línea con el icono de calendario) */
const labelForDay = (ts: string, timeZone = "America/Mexico_City") => {
  const d = new Date(ts);
  const now = new Date();

  const today = ymdKey(now, timeZone);
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yesterday = ymdKey(y, timeZone);
  const key = ymdKey(d, timeZone);

  if (key === today) return "Hoy";
  if (key === yesterday) return "Ayer";
  return formatAsDMY(ts); // > 2 días → fecha
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
  dayHeader,
  sensacionFinal,
}: Props) {
  const endTs = endedAt || startedAt;

  // ⬇️ Nuevo: etiqueta de día según la regla pedida
  const dayLabel = labelForDay(endTs, "America/Mexico_City");
  const timeLabel = formatHourAmPm(endTs);

  const initials = (username || "U")
    .split(" ")
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteWorkout, { isLoading: deleting }] = useDeleteWorkoutSessionMutation();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 15) + 1); // Datos simulados
  const [commentsCount, setCommentsCount] = useState(Math.floor(Math.random() * 8)); // Datos simulados
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleDelete = async () => {
    try {
      await deleteWorkout({ id_sesion: idSesion }).unwrap();
      toast.success("Entrenamiento eliminado");
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar la sesión");
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    toast.success(isLiked ? "Like removido" : "¡Te gusta este entrenamiento!");
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      toast.success("Comentario enviado (simulado)");
      setCommentText("");
      setCommentsCount((prev) => prev + 1);
    }
  };

  return (
    <>
      {dayHeader ? <div className="px-1 mb-2 mt-6 text-sm font-medium text-muted-foreground">{dayHeader}</div> : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card
          className={cn(
            "group relative overflow-hidden bg-card text-card-foreground rounded-3xl border border-border/40 shadow-sm transition-all duration-500",
            "hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/[0.02] before:via-transparent before:to-primary/[0.01] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
            "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-background/5 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300",
            className
          )}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

          <CardHeader className="relative pb-5 z-10">
            <div className="flex items-start justify-between gap-4">
              {/* Usuario + fecha */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Avatar className="h-12 w-12 ring-2 ring-border/30 transition-all duration-300 group-hover:ring-primary/30 group-hover:ring-4">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary font-bold text-sm">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-r from-green-400 to-green-500 ring-2 ring-background shadow-sm"
                  />
                </div>
                <div className="leading-tight min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground truncate">{username}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {dayLabel}
                      {timeLabel ? ` · ${timeLabel}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0.6, scale: 0.9 }}
                animate={{ opacity: 0.7, scale: 0.95 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="transition-all duration-300"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-xl hover:bg-destructive/15 hover:text-destructive transition-all duration-200 hover:scale-110 text-muted-foreground/60 hover:shadow-lg"
                  onClick={() => setOpenConfirm(true)}
                  aria-label="Eliminar entrenamiento"
                  title="Eliminar entrenamiento"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            <div className="mt-5 space-y-4">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold leading-tight line-clamp-2 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent"
              >
                {titulo}
              </motion.h3>

              <div className="flex flex-wrap items-center gap-2.5">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge
                    variant="secondary"
                    className="rounded-2xl px-4 py-2 text-xs font-semibold bg-gradient-to-r from-muted/80 to-muted/60 hover:from-muted to-muted/80 transition-all duration-200 shadow-sm"
                  >
                    <Dumbbell className="h-3.5 w-3.5 mr-2" />
                    {totalSets} sets
                  </Badge>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge className="rounded-2xl px-4 py-2 text-xs font-semibold bg-gradient-to-r from-primary/15 to-primary/10 text-primary hover:from-primary/20 hover:to-primary/15 transition-all duration-200 shadow-sm border-primary/20">
                    <TrendingUp className="h-3.5 w-3.5 mr-2" />
                    {Intl.NumberFormat("es-MX").format(totalVolume)} kg
                  </Badge>
                </motion.div>
                {sensacionFinal && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Badge
                      variant="outline"
                      className="rounded-2xl px-4 py-2 text-xs font-semibold border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/20 transition-all duration-200"
                    >
                      {sensacionFinal}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative pt-0 z-10">
            {ejercicios && ejercicios.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence>
                  {ejercicios.map((ex, idx) => (
                    <motion.div
                      key={(ex.id ?? idx)?.toString()}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ delay: idx * 0.08, duration: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group/exercise relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-muted/40 to-muted/20 p-4 transition-all duration-300 hover:bg-gradient-to-br hover:from-muted/60 hover:to-muted/40 hover:border-border/50 hover:shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-transparent opacity-0 group-hover/exercise:opacity-100 transition-opacity duration-300" />

                      <div className="relative flex items-start gap-3">
                        <div className="relative shrink-0">
                          {ex.ejemplo ? (
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              src={ex.ejemplo || "/placeholder.svg"}
                              alt={ex.nombre ?? "Ejercicio"}
                              className="h-14 w-14 rounded-2xl object-cover ring-1 ring-border/40 transition-all duration-300 group-hover/exercise:ring-border/60 group-hover/exercise:shadow-md"
                            />
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/60 ring-1 ring-border/40 flex items-center justify-center transition-all duration-300 group-hover/exercise:ring-border/60"
                            >
                              <Dumbbell className="h-6 w-6 text-muted-foreground/70" />
                            </motion.div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-foreground leading-tight mb-1">
                            {ex.nombre ?? "Ejercicio"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {ex.sets_done && (
                              <span className="font-semibold text-foreground/80">{ex.sets_done} sets</span>
                            )}
                            {ex.sets_done && (ex.grupo_muscular || ex.volume) && (
                              <span className="text-muted-foreground/40">·</span>
                            )}
                            {ex.grupo_muscular && !ex.volume && (
                              <span className="truncate text-muted-foreground/80">{ex.grupo_muscular}</span>
                            )}
                            {ex.volume && (
                              <span className="font-semibold text-primary/90">
                                {Intl.NumberFormat("es-MX").format(Number(ex.volume))} kg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl border border-dashed border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-transparent" />
                <div className="relative flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/80 to-muted/60"
                  >
                    <Dumbbell className="h-6 w-6 text-muted-foreground/60" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-muted-foreground">Sin ejercicios registrados</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Los ejercicios aparecerán cuando estén disponibles
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={cn(
                        "h-9 px-3 rounded-2xl transition-all duration-300 hover:scale-105",
                        isLiked
                          ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      )}
                    >
                      <motion.div animate={isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                        <Heart className={cn("h-4 w-4 mr-2 transition-all duration-200", isLiked && "fill-current")} />
                      </motion.div>
                      <span className="text-sm font-medium">{likesCount}</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleComment}
                      className={cn(
                        "h-9 px-3 rounded-2xl transition-all duration-300 hover:scale-105",
                        showComments
                          ? "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      )}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{commentsCount}</span>
                    </Button>
                  </motion.div>
                </div>

                <div className="text-xs text-muted-foreground/60">
                  {likesCount > 0 && (
                    <span>
                      {likesCount === 1 ? "1 like" : `${likesCount} likes`}
                      {commentsCount > 0 && " · "}
                    </span>
                  )}
                  {commentsCount > 0 && (
                    <span>{commentsCount === 1 ? "1 comentario" : `${commentsCount} comentarios`}</span>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-4 pt-4 border-t border-border/20"
                  >
                    <div className="space-y-3">
                      {/* Comentarios simulados */}
                      <div className="space-y-3 max-h-32 overflow-y-auto">
                        {Array.from({ length: Math.min(commentsCount, 3) }, (_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <Avatar className="h-7 w-7 ring-1 ring-border/30">
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-xs">
                                U{i + 1}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-muted/50 rounded-2xl px-3 py-2">
                                <div className="text-xs font-medium text-foreground mb-1">Usuario{i + 1}</div>
                                <div className="text-xs text-muted-foreground">
                                  {i === 0 && "¡Excelente entrenamiento! 💪"}
                                  {i === 1 && "Me inspira a entrenar más duro"}
                                  {i === 2 && "¿Cuánto tiempo te tomó?"}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground/60 mt-1 ml-3">hace {i + 1}h</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Input para nuevo comentario */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 pt-2"
                      >
                        <Avatar className="h-8 w-8 ring-1 ring-border/30">
                          {avatarUrl ? (
                            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Tu avatar" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-xs">
                              {initials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            placeholder="Escribe un comentario..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendComment();
                              }
                            }}
                            className="h-9 rounded-2xl border-border/40 bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-background/80"
                          />
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              onClick={handleSendComment}
                              disabled={!commentText.trim()}
                              className="h-9 w-9 p-0 rounded-2xl bg-primary/90 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
      </motion.div>
    </>
  );
}
