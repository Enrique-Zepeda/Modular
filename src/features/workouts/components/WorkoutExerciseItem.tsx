import { memo, useMemo, useEffect, useRef } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
  Trash2,
  ImageIcon,
  CheckCircle2,
  Circle,
  Plus,
  Medal,
  CircleHelp,
  Skull,
  Feather,
  FlameIcon,
  TriangleAlert,
  ThumbsUp,
} from "lucide-react";
import type { WorkoutExercise } from "@/features/workouts/types";

import {
  onDecimalKeyDown,
  onIntegerKeyDown,
  handlePasteDecimal,
  handlePasteInteger,
  sanitizeDecimal,
  sanitizeInteger,
} from "@/features/workouts/utils/numberInput";

import { useGetPreviousSetsForExercisesQuery } from "@/features/workouts/api/workoutsApi";
import { useAppSelector, useWeightUnit } from "@/hooks";
import { saveLiveWorkoutToStorage, clearLiveWorkoutStorage } from "@/features/workouts/store/workoutLogSlice";
import { useExercisePRs, invalidateExercisePRsCache } from "@/features/workouts/hooks/useExercisePRs";

const RPE_OPTIONS = ["Sin sensaciones", "Fácil", "Moderado", "Difícil", "Muy difícil", "Al fallo"] as const;

type Props = {
  ex: WorkoutExercise;
  ei: number;
  onAskDelete: (ei: number, name?: string) => void;
  onAddSet: (ei: number) => void;
  onUpdateSet: (ei: number, si: number, field: "kg" | "reps" | "rpe", value: string) => void;
  onToggleSet: (ei: number, si: number) => void;
  onRemoveSet: (ei: number, si: number) => void;
};

export function WorkoutExerciseItem({ ex, ei, onAskDelete, onAddSet, onUpdateSet, onToggleSet, onRemoveSet }: Props) {
  const session = useAppSelector((s) => (s as any)?.workoutLog?.currentSession);
  const isLogging = useAppSelector((s) => (s as any)?.workoutLog?.isLogging as boolean);
  const { unit } = useWeightUnit();
  const sessionId = session?.id as string | undefined;

  const kgToUser = (kg: number | null | undefined): string => {
    if (kg == null || Number.isNaN(Number(kg))) return "";
    if (unit === "kg") return String(kg);
    const lbs = kg * 2.20462;
    return String(Math.round(lbs));
  };

  const userToKg = (val: string): string => {
    if (!val) return "";
    const num = Number(val);
    if (Number.isNaN(num)) return "";
    if (unit === "kg") return String(num);
    const kg = num / 2.20462;
    return String(kg);
  };

  const kgToUserInt = (kg: number | null | undefined): string => {
    if (kg == null || Number.isNaN(Number(kg))) return "";
    if (unit === "kg") return String(Math.round(Number(kg)));
    const lbs = Number(kg) * 2.20462;
    return String(Math.round(lbs));
  };

  const exerciseId = useMemo<number | undefined>(() => {
    return (ex as any).id_ejercicio ?? (ex as any).exerciseId ?? (ex as any).id;
  }, [ex]);

  const { isSetPR, loading: prsLoading } = useExercisePRs(
    exerciseId ? Number(exerciseId) : undefined,
    sessionId as any
  );

  useEffect(() => {
    if (!sessionId || !exerciseId) return;
    invalidateExercisePRsCache([Number(exerciseId)]);
  }, [sessionId, exerciseId]);

  const args = useMemo(() => (exerciseId ? [Number(exerciseId)] : []), [exerciseId]);
  const { data: prevBatch, refetch } = useGetPreviousSetsForExercisesQuery(args, {
    skip: !exerciseId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  useEffect(() => {
    if (!exerciseId || !sessionId) return;
    refetch();
  }, [sessionId, exerciseId, refetch]);

  const prevForExercise = exerciseId ? prevBatch?.[Number(exerciseId)] : undefined;
  const formatPrev = (rawIdx: any, visualIndex: number) => {
    if (!prevForExercise) return "—";
    const idxNum = Number(rawIdx);
    const key = Number.isFinite(idxNum) && idxNum >= 1 ? idxNum : visualIndex + 1;
    const p = prevForExercise[key];
    if (!p) return "—";
    const kg = p.kg ?? null;
    const reps = p.reps ?? null;
    const rpe = p.rpe ?? null;
    if (kg == null || reps == null) return "—";
    const displayWeight = kgToUserInt(Number(kg));
    return `${displayWeight}${unit} × ${reps}${rpe ? ` @ ${rpe}` : ""}`;
  };

  const formatPrevMobile = (rawIdx: any, visualIndex: number) => {
    if (!prevForExercise) return "—";
    const idxNum = Number(rawIdx);
    const key = Number.isFinite(idxNum) && idxNum >= 1 ? idxNum : visualIndex + 1;
    const p = prevForExercise[key];
    if (!p) return "—";
    const kg = p.kg ?? null;
    const reps = p.reps ?? null;
    if (kg == null || reps == null) return "—";
    const displayWeight = kgToUserInt(Number(kg));
    return `${displayWeight}×${reps}`;
  };

  const saveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (ei !== 0) return;
    if (!isLogging || !session) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveLiveWorkoutToStorage({ currentSession: session, isLogging: true });
    }, 800);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [ei, isLogging, session]);

  useEffect(() => {
    if (ei !== 0) return;
    const handler = () => {
      if (isLogging && session) {
        saveLiveWorkoutToStorage({ currentSession: session, isLogging: true });
      }
    };
    const onFreeze = () => handler();

    document.addEventListener("visibilitychange", handler);
    window.addEventListener("pagehide", handler);
    // @ts-ignore
    window.addEventListener("freeze", onFreeze);
    window.addEventListener("beforeunload", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("pagehide", handler);
      // @ts-ignore
      window.removeEventListener("freeze", onFreeze);
      window.removeEventListener("beforeunload", handler);
    };
  }, [ei, isLogging, session]);

  useEffect(() => {
    if (ei !== 0) return;
    if (!isLogging) clearLiveWorkoutStorage();
  }, [ei, isLogging]);

  return (
    <div className="group relative rounded-3xl p-2.5 sm:p-5 border border-border/10 bg-card/70 transition-all duration-150 hover:border-border/30 max-w-full overflow-hidden touch-pan-y select-none">
      <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-5">
        <div className="flex-shrink-0">
          {(ex as any).imagen ? (
            <img
              src={(ex as any).imagen || "/placeholder.svg"}
              alt={(ex as any).nombre ?? ex.exerciseName ?? "Ejercicio"}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-primary/20 shadow-md ring-2 ring-primary/5 hover:ring-primary/20 transition-all duration-300"
              onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = "Sin imagen"))}
            />
          ) : (
            <div className="w-10 h-10 sm:w-14 sm:h-14 grid place-items-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/30">
              <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/60" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <CardTitle className="text-base sm:text-xl font-extrabold text-foreground mb-0.5 sm:mb-1 text-balance leading-tight tracking-tight">
            {(ex as any).nombre ?? ex.exerciseName ?? `Ejercicio ${ei + 1}`}
          </CardTitle>
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground/80 tracking-wide">
            {(ex as any).sets.length} {(ex as any).sets.length === 1 ? "serie" : "series"}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAskDelete(ei, (ex as any).nombre ?? ex.exerciseName)}
          title="Eliminar ejercicio"
          aria-label="Eliminar ejercicio"
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-destructive rounded-2xl h-8 w-8 sm:h-9 sm:w-9 transition-all duration-300 hover:scale-105"
        >
          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {(ex as any).sets.map((s: any, si: number) => {
          const prInfo = prsLoading
            ? undefined
            : isSetPR({
                kg: s?.kg != null ? Number(s.kg) : null,
                reps: s?.reps != null ? Number(s.reps) : null,
                done: s?.done,
              });

          const displayKg = kgToUser(s?.kg != null ? Number(s.kg) : null);

          return (
            <SetRow
              key={`${s.idx}-${si}`}
              previousText={formatPrev(s.idx, si)}
              previousTextMobile={formatPrevMobile(s.idx, si)}
              setIndexLabel={s.idx}
              values={{
                ...s,
                kg: displayKg,
              }}
              unit={unit}
              prInfo={prInfo}
              onChange={(field, val) => {
                if (field === "kg") {
                  const kgVal = userToKg(val);
                  onUpdateSet(ei, si, "kg", kgVal);
                } else {
                  onUpdateSet(ei, si, field, val);
                }
              }}
              onToggleDone={() => onToggleSet(ei, si)}
              onRemove={() => onRemoveSet(ei, si)}
            />
          );
        })}
      </div>

      <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-border/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSet(ei)}
          className="w-full gap-2 sm:gap-2.5 rounded-2xl hover:bg-primary/10 hover:text-primary text-muted-foreground border-2 border-dashed border-border/40 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary transition-all duration-300 h-10 sm:h-11 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:scale-[1.02]"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Añadir serie
        </Button>
      </div>
    </div>
  );
}

type RowProps = {
  setIndexLabel: number;
  values: { idx: number; kg: string; reps: string; rpe: string; done: boolean; doneAt?: string };
  unit?: "kg" | "lbs";
  onChange: (field: "kg" | "reps" | "rpe", val: string) => void;
  onToggleDone: () => void;
  onRemove: () => void;
  previousText?: string;
  previousTextMobile?: string;
  prInfo?: { type: "1RM" | "WEIGHT" | null; value: number | null };
};

const getRPEStyles = (rpeValue: string) => {
  switch (rpeValue) {
    case "Sin sensaciones":
      return {
        bgClass: "from-muted/30 to-muted/20",
        borderClass: "border-border/50",
        textClass: "text-muted-foreground",
        iconColor: "text-muted-foreground/60",
        icon: CircleHelp,
        shadowClass: "shadow-muted/20",
      };
    case "Fácil":
      return {
        bgClass: "from-emerald-50 to-emerald-100/70 dark:from-emerald-950/20 dark:to-emerald-900/10",
        borderClass: "border-emerald-300/70 dark:border-emerald-700/40",
        textClass: "text-emerald-700 dark:text-emerald-400",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        icon: Feather,
        shadowClass: "shadow-emerald-200/30 dark:shadow-emerald-950/20",
      };
    case "Moderado":
      return {
        bgClass: "from-blue-50 to-blue-100/70 dark:from-blue-950/20 dark:to-blue-900/10",
        borderClass: "border-blue-300/70 dark:border-blue-700/40",
        textClass: "text-blue-700 dark:text-blue-400",
        iconColor: "text-blue-600 dark:text-blue-400",
        icon: ThumbsUp,
        shadowClass: "shadow-blue-200/30 dark:shadow-blue-950/20",
      };
    case "Difícil":
      return {
        bgClass: "from-orange-50 to-orange-100/70 dark:from-orange-950/20 dark:to-orange-900/10",
        borderClass: "border-orange-300/70 dark:border-orange-700/40",
        textClass: "text-orange-700 dark:text-orange-400",
        iconColor: "text-orange-600 dark:text-orange-400",
        icon: FlameIcon,
        shadowClass: "shadow-orange-200/30 dark:shadow-orange-950/30",
      };
    case "Muy difícil":
      return {
        bgClass: "from-red-50 to-red-100/70 dark:from-red-950/20 dark:to-red-900/10",
        borderClass: "border-red-300/70 dark:border-red-700/40",
        textClass: "text-red-700 dark:text-red-400",
        iconColor: "text-red-600 dark:text-red-400",
        icon: TriangleAlert,
        shadowClass: "shadow-red-200/30 dark:shadow-red-950/30",
      };
    case "Al fallo":
      return {
        bgClass: "from-purple-50 to-purple-100/70 dark:from-purple-950/20 dark:to-purple-900/10",
        borderClass: "border-purple-400/80 dark:border-purple-600/50",
        textClass: "text-purple-800 dark:text-purple-300 font-black",
        iconColor: "text-purple-700 dark:text-purple-400",
        icon: Skull,
        shadowClass: "shadow-purple-300/40 dark:shadow-purple-950/30",
      };
    default:
      return {
        bgClass: "from-muted/30 to-muted/20",
        borderClass: "border-border/50",
        textClass: "text-muted-foreground",
        iconColor: "text-muted-foreground/60",
        icon: CircleHelp,
        shadowClass: "shadow-muted/20",
      };
  }
};

const SetRow = memo(function SetRow({
  setIndexLabel,
  values,
  unit = "kg",
  onChange,
  onToggleDone,
  onRemove,
  previousText,
  previousTextMobile,
  prInfo,
}: RowProps) {
  const formatPRValue = (kg: number | null) => {
    if (kg == null) return "";
    if (unit === "kg") {
      const round05 = (x: number) => Math.round(x * 2) / 2;
      return `${round05(kg)} kg`;
    }
    const lbs = kg * 2.20462;
    return `${Math.round(lbs)} lbs`;
  };

  const prTitle =
    prInfo?.type && prInfo.value != null
      ? `🏅 PR ${prInfo.type === "1RM" ? "1RM estimada" : "Peso"}: ${formatPRValue(prInfo.value)}`
      : "";

  const rpeStyles = getRPEStyles(values.rpe);
  const RPEIcon = rpeStyles.icon;

  return (
    <div
      className={`group/set rounded-2xl p-2 sm:p-4 transition-all duration-500 touch-manipulation ${
        values.done
          ? "bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-300/60 dark:border-emerald-700/40 shadow-lg"
          : "bg-gradient-to-br from-background to-muted/20 border-2 border-border/20 shadow-md"
      }`}
    >
      {/* En mobile: 1 | 3 | 5 | 3  — En sm+: 1 | 3 | 6 | 2 */}
      <div className="grid grid-cols-12 gap-1 sm:gap-4 items-center">
        {/* # de set */}
        <div className="col-span-1 flex justify-center">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-sm">
            <span className="text-xs sm:text-lg font-black text-primary tabular-nums">{setIndexLabel}</span>
          </div>
        </div>

        {/* Anterior: +1 col en mobile, título visible y sin RPE */}
        <div className="col-span-3 sm:col-span-3 min-w-0">
          <div className="flex flex-col gap-0 sm:gap-1 p-1.5 sm:p-3 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/30 shadow-sm">
            {/* Título visible en mobile como 'Ant.' */}
            <span className="text-[10px] sm:text-[9px] font-black text-primary/70 uppercase tracking-widest">
              <span className="sm:hidden">Ant.</span>
              <span className="hidden sm:inline">Anterior</span>
            </span>

            {/* Contenido: mobile = peso×reps (sin RPE), no truncar; desktop = texto completo */}
            <span className="sm:hidden text-xs text-foreground font-bold tabular-nums leading-snug whitespace-nowrap">
              {previousTextMobile ?? "—"}
            </span>
            <span className="hidden sm:block text-sm text-foreground font-bold tabular-nums leading-snug truncate">
              {previousText ?? "—"}
            </span>
          </div>
        </div>

        {/* Inputs: -1 col en mobile para ceder espacio a 'Anterior' (mantiene 3 campos) */}
        <div className="col-span-5 sm:col-span-6 grid grid-cols-3 gap-0.5 sm:gap-3">
          {/* KG/LBS */}
          <div className="space-y-0 sm:space-y-1.5">
            <label className="text-[7px] sm:text-[10px] font-black text-primary/80 uppercase tracking-widest block text-center sm:text-left">
              {unit.toUpperCase()}
            </label>
            <Input
              inputMode="decimal"
              value={values.kg}
              onChange={(e) => onChange("kg", sanitizeDecimal(e.target.value))}
              onKeyDown={onDecimalKeyDown}
              onPaste={(e) => handlePasteDecimal(e, (v) => onChange("kg", v))}
              placeholder="0"
              className="h-8 sm:h-12 tabular-nums rounded-lg sm:rounded-xl font-black text-xs sm:text-lg border-2 border-border/70 bg-background shadow-md px-1 sm:px-3 text-center focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* REPS */}
          <div className="space-y-0 sm:space-y-1.5">
            <label className="text-[7px] sm:text-[10px] font-black text-primary/80 uppercase tracking-widest block text-center sm:text-left">
              Reps
            </label>
            <Input
              inputMode="numeric"
              value={values.reps}
              onChange={(e) => onChange("reps", sanitizeInteger(e.target.value))}
              onKeyDown={onIntegerKeyDown}
              onPaste={(e) => handlePasteInteger(e, (v) => onChange("reps", v))}
              placeholder="0"
              className="h-8 sm:h-12 tabular-nums rounded-lg sm:rounded-xl font-black text-xs sm:text-lg border-2 border-border/70 bg-background shadow-md px-1 sm:px-3 text-center focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* RPE selector (se mantiene, no ocupa más espacio) */}
          <div className="space-y-0 sm:space-y-1.5">
            <label className="text-[7px] sm:text-[10px] font-black text-primary/80 uppercase tracking-widest block text-center sm:text-left">
              RPE
            </label>
            <Select value={values.rpe || "Sin sensaciones"} onValueChange={(val) => onChange("rpe", val)}>
              <SelectTrigger className="relative h-8 sm:h-12 rounded-lg sm:rounded-xl border-2 shadow-md p-0 overflow-hidden [&>svg]:hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${rpeStyles.bgClass} ${rpeStyles.shadowClass} opacity-70 pointer-events-none`}
                />
                <div
                  className={`absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none border-2 ${rpeStyles.borderClass}`}
                />
                <div className="relative flex items-center justify-center w-full h-full">
                  <RPEIcon
                    className={`h-3.5 w-3.5 sm:h-6 sm:w-6 ${rpeStyles.iconColor} ${
                      values.rpe === "Al fallo" ? "animate-pulse" : ""
                    }`}
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-border">
                {RPE_OPTIONS.map((opt) => {
                  const optStyles = getRPEStyles(opt);
                  return (
                    <SelectItem key={opt} value={opt} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        {React.createElement(optStyles.icon, {
                          className: `h-4 w-4 ${optStyles.iconColor}`,
                          strokeWidth: 2.5,
                        })}
                        <span className={optStyles.textClass}>{opt}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Acciones: en mobile quitamos la medalla PR para ganar ancho */}
        <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1 sm:gap-3">
          {/* PR medal: oculto en mobile */}
          <div className="hidden sm:flex w-5 h-5 sm:w-8 sm:h-8 items-center justify-center" title={prTitle}>
            {prInfo?.type ? (
              <div className="relative w-6 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-md animate-pulse" />
                <Medal
                  className="relative h-6 w-6 text-amber-500 dark:text-amber-400 drop-shadow-lg translate-y-[2px]"
                  strokeWidth={2.5}
                />
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onToggleDone}
            className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              values.done
                ? "text-emerald-600 bg-gradient-to-br from-emerald-100 to-emerald-200/80 dark:text-emerald-400 dark:from-emerald-950/50 dark:to-emerald-900/40"
                : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30"
            }`}
            title={values.done ? "Marcar como no completado" : "Marcar como completado"}
          >
            {values.done ? (
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Circle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            title="Eliminar serie"
            className="hover:bg-destructive/15 hover:text-destructive text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-destructive rounded-lg sm:rounded-xl h-7 w-7 sm:h-9 sm:w-9 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});
