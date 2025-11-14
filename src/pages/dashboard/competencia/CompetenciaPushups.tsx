import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Trophy,
  Loader2,
  Crown,
  Flame,
  Dumbbell,
  Zap,
  Medal,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import UserAvatar from "@/components/ui/user-avatar";
import { useProfilesByUid } from "@/features/social/hooks/useProfilesByUid";

const attemptSchema = z.object({
  reps: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 lagartija")
    .max(300, "Máximo 300 lagartijas"),
});

type AttemptForm = z.infer<typeof attemptSchema>;

type CompetenciaEntry = {
  id_registro: number;
  participant_uid: string;
  participant_username: string | null;
  reps: number;
  is_verified: boolean;
  created_at: string;
};

export function CompetenciaPushups() {
  const [entries, setEntries] = useState<CompetenciaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttemptForm>({
    resolver: zodResolver(attemptSchema),
    defaultValues: { reps: 0 },
  });

  const uids = useMemo(() => entries.map((e) => e.participant_uid), [entries]);
  const { map: profilesMap } = useProfilesByUid(uids);

  const handleOpenProfile = (username: string | null) => {
    const finalUsername = username?.trim();
    if (!finalUsername) {
      toast.error("Este usuario aún no tiene un nombre público.");
      return;
    }
    navigate(`/u/${finalUsername}`);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      const { data: leaderboard, error } = await supabase
        .from("CompetenciaPushups")
        .select("id_registro, participant_uid, participant_username, reps, is_verified, created_at")
        .eq("is_verified", true)
        .order("reps", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!isMounted) return;

      setEntries((leaderboard ?? []) as CompetenciaEntry[]);
    };

    const init = async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id ?? null;
        if (isMounted) {
          setCurrentUid(uid);
        }

        await fetchLeaderboard();

        if (uid) {
          const { data: myAttempt, error: myError } = await supabase
            .from("CompetenciaPushups")
            .select("id_registro")
            .eq("participant_uid", uid)
            .maybeSingle();

          if (myError && myError.code !== "PGRST116") {
            throw myError;
          }

          if (isMounted && myAttempt) {
            setHasSubmitted(true);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          toast.error("No se pudo cargar la competencia");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    const channel = supabase
      .channel("competencia-pushups-leaderboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "CompetenciaPushups",
        },
        async () => {
          try {
            await fetchLeaderboard();
          } catch (err) {
            console.error("Error actualizando leaderboard en tiempo real", err);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (hasSubmitted) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("CompetenciaPushups").insert({
        reps: values.reps,
      });

      if (error) {
        if ((error as any).code === "23505") {
          setHasSubmitted(true);
          toast.error("Ya registraste tu intento.");
          return;
        }
        throw error;
      }

      toast.success("Intento registrado. Espera a que un juez lo verifique.");
      setHasSubmitted(true);
      reset({ reps: 0 });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo registrar tu intento");
    } finally {
      setSubmitting(false);
    }
  });

  const totalParticipants = entries.length;

  const userIndex = useMemo(() => {
    if (!currentUid) return -1;
    return entries.findIndex((e) => e.participant_uid === currentUid);
  }, [entries, currentUid]);

  const userRank = userIndex >= 0 ? userIndex + 1 : null;
  const isVerifiedInRanking = userRank !== null;
  const isPendingReview = hasSubmitted && !isVerifiedInRanking;

  const stats = useMemo(() => {
    if (entries.length === 0) return { average: 0, median: 0, top: 0 };

    const reps = entries.map((e) => e.reps);
    const average = Math.round(reps.reduce((a, b) => a + b, 0) / reps.length);
    const sorted = [...reps].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const top = reps[0];

    return { average, median, top };
  }, [entries]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-[100dvh] bg-background px-4 py-6 sm:px-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl md:max-w-5xl space-y-6 md:space-y-8">
          {/* HEADER PRINCIPAL */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-border/40 bg-gradient-to-br from-primary/8 via-background to-accent/5 shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/3 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />

            <div className="relative p-5 sm:p-6 md:p-8 lg:p-10 space-y-5 md:space-y-6">
              <motion.div
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 8, -8, 0],
                    y: [0, -8, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <Trophy className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-primary" />
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-2 bg-primary/20 rounded-full blur-lg"
                    />
                  </div>
                </motion.div>

                <div className="flex-1 space-y-1.5 sm:space-y-2">
                  <h1 className="text-[1.6rem] sm:text-2xl md:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                    COMPETENCIA LAGARTIJAS
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-semibold">
                    Ranking de campeones • Solo intentos verificados
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-2 md:gap-3 -mx-1 px-1 overflow-x-auto no-scrollbar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-primary/10 border-primary/30 backdrop-blur-sm cursor-help whitespace-nowrap"
                    >
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs md:text-sm font-bold">{totalParticipants} Participantes</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Total de atletas verificados</p>
                  </TooltipContent>
                </Tooltip>

                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-accent/20 border-accent/30 backdrop-blur-sm whitespace-nowrap"
                >
                  <Zap className="h-4 w-4 text-accent-foreground" />
                  <span className="text-xs md:text-sm font-bold">EN VIVO</span>
                </Badge>

                {userRank && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-chart-1/10 border-chart-1/30 backdrop-blur-sm cursor-help whitespace-nowrap"
                      >
                        <Award className="h-4 w-4 text-chart-1" />
                        <span className="text-xs md:text-sm font-bold">Tu Posición: #{userRank}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Top {Math.round((userRank / totalParticipants) * 100)}% de todos los participantes
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </motion.div>

              {hasSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  {isVerifiedInRanking && userRank && (
                    <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">✅</span>
                        Tu intento fue verificado
                      </span>
                    </div>
                  )}
                  {isPendingReview && (
                    <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">⏳</span>
                        Tu intento está en revisión
                      </span>
                      <span className="text-[0.7rem] sm:text-xs opacity-90">
                        Aparecerá en el ranking cuando sea aprobado
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* TARJETA DE STATS */}
          {!loading && entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="grid grid-cols-1 gap-3 md:gap-4"
            >
              <Card className="border-border/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs md:text-sm font-bold text-muted-foreground">PROMEDIO</p>
                      <p className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">
                        {stats.average}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-blue-500/40" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* FORMULARIO DE INTENTO */}
          {!hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="relative overflow-hidden border-border/40 bg-card shadow-sm rounded-2xl">
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                  animate={{ x: ["100%", "-100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <CardHeader className="border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.div
                      animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="flex-shrink-0"
                    >
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Dumbbell className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-foreground text-lg md:text-xl font-black">
                        Registra Tu Intento
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base font-semibold">
                        Solo puedes registrar una vez
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-5 pb-6 px-4 sm:px-5 md:px-6 md:pt-7">
                  <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
                    <div className="space-y-3">
                      <label
                        htmlFor="reps-input"
                        className="block text-sm md:text-base font-black text-foreground tracking-wide"
                      >
                        LAGARTIJAS REALIZADAS
                      </label>
                      <Input
                        id="reps-input"
                        type="number"
                        min={1}
                        max={300}
                        inputMode="numeric"
                        placeholder="Ej. 60"
                        className="h-14 md:h-16 rounded-2xl text-xl md:text-2xl font-black px-4 bg-background/70 border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        {...register("reps", { valueAsNumber: true })}
                      />
                      <AnimatePresence>
                        {errors.reps && (
                          <motion.p
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2 text-sm text-destructive font-bold"
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                            {errors.reps.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      size="lg"
                      className="relative w-full h-12 md:h-14 rounded-2xl text-base md:text-lg font-black overflow-hidden group"
                    >
                      <motion.div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ["-200%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          REGISTRANDO...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          REGISTRAR INTENTO
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* LEADERBOARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-border/40 bg-card shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.div
                      animate={{ rotateY: [0, 360], scale: [1, 1.1, 1] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      style={{ perspective: 1000 }}
                      className="flex-shrink-0"
                    >
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Medal className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                      </div>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-foreground text-lg sm:text-xl md:text-2xl font-black">
                        Ranking Oficial
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base font-semibold">
                        Todos los participantes verificados
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="space-y-3 md:space-y-4 p-4 md:p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl border border-border/40"
                      >
                        <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0" />
                        <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32 md:w-40" />
                          <Skeleton className="h-3 w-24 md:w-32" />
                        </div>
                        <Skeleton className="h-8 w-16 md:h-10 md:w-20" />
                      </div>
                    ))}
                  </div>
                ) : entries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-14 md:py-20 px-6"
                  >
                    <div className="relative">
                      <Trophy className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground/40" />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-xl"
                      />
                    </div>
                    <h3 className="mt-4 text-lg md:text-xl font-black text-foreground text-center">
                      TODAVÍA NO HAY REGISTROS
                    </h3>
                    <p className="mt-1.5 text-sm md:text-base text-muted-foreground text-center max-w-sm font-medium">
                      ¡Sé el primero en aparecer aquí y llevar la corona de campeón!
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3 md:space-y-4 p-4 md:p-6">
                    <AnimatePresence mode="popLayout">
                      {entries.map((entry, index) => {
                        const profile = profilesMap[entry.participant_uid];
                        const usernameFromProfile = profile?.username ?? entry.participant_username ?? null;
                        const displayName = usernameFromProfile ?? "Usuario";
                        const rank = entries.findIndex((e) => e.id_registro === entry.id_registro) + 1;
                        const isTop1 = rank === 1;
                        const isTop2 = rank === 2;
                        const isTop3 = rank === 3;
                        const isCurrentUser = currentUid != null && entry.participant_uid === currentUid;

                        const diffFromTop = stats.top - entry.reps;
                        const percentageOfTop = stats.top ? ((entry.reps / stats.top) * 100).toFixed(1) : "0";

                        const rowBaseClasses = isTop1
                          ? "border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent shadow-lg shadow-amber-500/10"
                          : isTop2
                          ? "border-red-500/50 bg-gradient-to-r from-red-500/15 via-red-500/8 to-transparent shadow-lg shadow-red-500/10"
                          : isTop3
                          ? "border-slate-400/50 dark:border-slate-300/50 bg-gradient-to-r from-slate-300/15 dark:from-slate-200/15 via-slate-300/8 dark:via-slate-200/8 to-transparent shadow-lg shadow-slate-300/10"
                          : "border-border/40 bg-card/60";

                        const currentUserHighlight = isCurrentUser
                          ? " ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-lg shadow-primary/20"
                          : "";

                        return (
                          <motion.div
                            key={entry.id_registro}
                            layout
                            initial={{ opacity: 0, x: -40, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 40, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: index * 0.03 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className={`relative overflow-hidden rounded-xl md:rounded-2xl border transition-all duration-300 cursor-pointer ${rowBaseClasses}${currentUserHighlight}`}
                            onClick={() => handleOpenProfile(usernameFromProfile)}
                          >
                            {(isTop1 || isTop2 || isTop3) && (
                              <motion.div
                                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                                animate={{ x: ["100%", "-100%"] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                              />
                            )}

                            {/* MOBILE-FIRST: columna en mobile, fila en sm+ */}
                            <div className="relative flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
                              <div className="flex flex-1 min-w-0 items-center gap-3 sm:gap-4">
                                {isTop1 ? (
                                  <motion.div
                                    animate={{
                                      y: [0, -10, 0],
                                      rotate: [0, 10, -10, 0],
                                      scale: [1, 1.12, 1],
                                    }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative"
                                  >
                                    <Crown className="h-9 w-9 md:h-11 md:w-11 text-amber-500" />
                                    <motion.div
                                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4], rotate: [0, 180, 360] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                      className="absolute -top-1 -right-1"
                                    >
                                      <Sparkles className="h-5 w-5 text-yellow-400" />
                                    </motion.div>
                                  </motion.div>
                                ) : isTop2 ? (
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      rotate: [0, -8, 8, 0],
                                      y: [0, -6, 0],
                                    }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative"
                                  >
                                    <Flame className="h-9 w-9 md:h-11 md:w-11 text-red-500" />
                                    <motion.div
                                      animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                      className="pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-br from-red-500/40 via-orange-500/30 to-transparent blur-xl"
                                    />
                                  </motion.div>
                                ) : isTop3 ? (
                                  <motion.div
                                    animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="relative"
                                  >
                                    <Star className="h-9 w-9 md:h-11 md:w-11 text-slate-400 dark:text-slate-200 fill-slate-400 dark:fill-slate-200" />
                                  </motion.div>
                                ) : (
                                  <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-muted/80 ring-2 ring-muted-foreground/20">
                                    <span className="text-sm md:text-base font-black text-muted-foreground">
                                      {rank}
                                    </span>
                                  </div>
                                )}

                                <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-3">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex-shrink-0">
                                        <UserAvatar
                                          url={profile?.url_avatar ?? undefined}
                                          alt={displayName}
                                          sexo={profile?.sexo ?? null}
                                          size="sm"
                                          className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-offset-2 ring-offset-background"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Click para ver perfil</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <div className="flex flex-1 flex-col min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span
                                        className={`truncate font-black text-sm md:text-base ${
                                          isTop1
                                            ? "text-amber-600 dark:text-amber-400"
                                            : isTop2
                                            ? "text-red-600 dark:text-red-400"
                                            : isTop3
                                            ? "text-slate-700 dark:text-slate-200"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {displayName}
                                      </span>
                                      {isCurrentUser && (
                                        <Badge variant="default" className="px-2 py-0 text-[0.7rem]">
                                          Tú
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                      <span className="text-[0.7rem] sm:text-xs text-muted-foreground font-medium">
                                        {new Date(entry.created_at).toLocaleDateString("es-ES", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {!isTop1 && stats.top > 0 && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge
                                              variant="outline"
                                              className="flex items-center gap-1 text-[0.7rem] sm:text-xs px-1.5 py-0 cursor-help"
                                            >
                                              <TrendingDown className="h-3 w-3" />-{diffFromTop}
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">{percentageOfTop}% del primer lugar</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* reps a la derecha / abajo en mobile */}
                              <div className="flex items-baseline gap-1.5 sm:flex-shrink-0 sm:self-center sm:pr-1">
                                <motion.div
                                  animate={
                                    isTop1
                                      ? { scale: [1, 1.15, 1] }
                                      : isTop2
                                      ? { scale: [1, 1.1, 1] }
                                      : isTop3
                                      ? { scale: [1, 1.08, 1] }
                                      : {}
                                  }
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                  className={`tabular-nums font-black leading-none ${
                                    isTop1
                                      ? "text-3xl md:text-4xl lg:text-5xl text-amber-600 dark:text-amber-400"
                                      : isTop2
                                      ? "text-2xl md:text-3xl lg:text-4xl text-red-600 dark:text-red-400"
                                      : isTop3
                                      ? "text-2xl md:text-3xl lg:text-4xl text-slate-700 dark:text-slate-200"
                                      : "text-xl md:text-2xl text-foreground/80"
                                  }`}
                                >
                                  {entry.reps}
                                </motion.div>
                                <span className="text-[0.7rem] sm:text-xs md:text-sm text-muted-foreground font-bold">
                                  reps
                                </span>
                              </div>
                            </div>

                            {(isTop1 || isTop2 || isTop3) && (
                              <div className="absolute top-2 right-2 md:top-3 md:right-3">
                                <motion.span
                                  animate={isTop1 ? { y: [-2, 2, -2], rotate: [0, 5, -5, 0] } : { scale: [1, 1.1, 1] }}
                                  transition={{ duration: isTop1 ? 1.5 : 2, repeat: Infinity, ease: "easeInOut" }}
                                  className="text-2xl md:text-3xl"
                                >
                                  {isTop1 ? "🥇" : isTop2 ? "🥈" : "🥉"}
                                </motion.span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* FOOTER */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="py-6 md:py-8 text-center space-y-2"
          >
            <p className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-muted-foreground font-bold">
              <motion.span
                animate={{ scale: [1, 1.25, 1], rotate: [0, 12, -12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-lg sm:text-xl"
              >
                💪
              </motion.span>
              <span className="text-primary font-black tracking-wide">NO PAIN NO GAIN</span>
              <span>• ¡Cada lagartija cuenta!</span>
            </p>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default CompetenciaPushups;
