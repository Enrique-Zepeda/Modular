import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Clock, Trash2, Image as ImageIcon, X, Search } from "lucide-react";
import { useGetRutinaByIdQuery } from "@/features/routines/api/rutinasApi";
import { toast } from "react-hot-toast";
import { useCreateWorkoutSessionMutation } from "@/features/workout/api/workoutsApi";

// ✅ filtros que YA funcionan en tu app de ejercicios
import { useExerciseFilters } from "@/features/exercises/hooks/useExerciseFilters";
import {
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
  useGetDifficultyLevelsQuery,
  useGetExercisesQuery,
} from "@/features/exercises/exercisesSlice";
import { AdvancedFilters } from "@/features/exercises/components/AdvancedFilters";

// Tipos locales
type SetPlantilla = { idx: number; kg?: number | null; reps?: number | null };
type WorkoutSet = {
  idx: number;
  kg: string;
  reps: string;
  rpe: string; // 'Fácil' | 'Moderado' | 'Difícil' | 'Muy difícil' | 'Al fallo' | ''
  done: boolean;
  doneAt?: string;
};
type WorkoutExercise = {
  id_ejercicio: number;
  nombre?: string;
  imagen?: string | null;
  orden: number;
  sets: WorkoutSet[];
};
type WorkoutState = {
  id_rutina: number;
  nombre?: string | null;
  descripcion?: string | null;
  startedAt: string;
  exercises: WorkoutExercise[];
};

const RPE_OPCIONES = ["Fácil", "Moderado", "Difícil", "Muy difícil", "Al fallo"] as const;

// Cronómetro que inicia al montar (sin pausa/reinicio)
function useAutoStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const lastTickRef = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const tick = (t: number) => {
      if (lastTickRef.current == null) lastTickRef.current = t;
      const delta = t - lastTickRef.current;
      lastTickRef.current = t;
      setElapsed((e) => e + delta);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return elapsed;
}

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function WorkoutLivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const id_rutina = Number(id);

  const [createWorkout, { isLoading: saving }] = useCreateWorkoutSessionMutation();

  // 1) Query de rutina
  const { data, isLoading, isError } = useGetRutinaByIdQuery(id_rutina, { skip: !id_rutina });

  // 2) Cronómetro
  const elapsed = useAutoStopwatch();

  // 3) Estado inicial desde la rutina
  const initialState = useMemo<WorkoutState | null>(() => {
    if (!data) return null;

    const ejercicios = data.EjerciciosRutinas ?? [];
    const exercises: WorkoutExercise[] = ejercicios
      .slice()
      .sort((a: any, b: any) => (a.orden ?? 999999) - (b.orden ?? 999999) || a.id_ejercicio - b.id_ejercicio)
      .map((ex: any) => {
        const plantilla: SetPlantilla[] = (ex.sets ?? [])
          .slice()
          .sort((s1: any, s2: any) => (s1.idx ?? 0) - (s2.idx ?? 0));
        const sets: WorkoutSet[] =
          plantilla.length > 0
            ? plantilla.map((s) => ({
                idx: s.idx,
                kg: s.kg != null ? String(s.kg) : "",
                reps: s.reps != null ? String(s.reps) : "",
                rpe: "",
                done: false,
              }))
            : [{ idx: 1, kg: "", reps: "", rpe: "", done: false }];

        return {
          id_ejercicio: ex.id_ejercicio,
          nombre: ex.Ejercicios?.nombre,
          imagen: ex.Ejercicios?.ejemplo ?? null,
          orden: ex.orden ?? 0,
          sets,
        };
      });

    return {
      id_rutina: data.id_rutina,
      nombre: data.nombre,
      descripcion: data.descripcion,
      startedAt: new Date().toISOString(),
      exercises,
    };
  }, [data]);

  // 4) Estado local de la sesión
  const [workout, setWorkout] = useState<WorkoutState | null>(null);
  useEffect(() => {
    if (initialState) setWorkout(initialState);
  }, [initialState]);

  // 5) Derivados
  const { doneSets, totalVolume, totalSets } = useMemo(() => {
    const exs = workout?.exercises ?? [];
    let done = 0;
    let volume = 0;
    let setsCount = 0;
    for (const ex of exs) {
      setsCount += ex.sets.length;
      for (const s of ex.sets) {
        if (s.done) {
          done += 1;
          const kg = parseFloat(s.kg || "0");
          const reps = parseInt(s.reps || "0", 10);
          if (!Number.isNaN(kg) && !Number.isNaN(reps)) volume += kg * reps;
        }
      }
    }
    return { doneSets: done, totalVolume: volume, totalSets: setsCount };
  }, [workout?.exercises]);

  // === Handlers sets/ejercicios ===
  const toggleSetDone = (ei: number, si: number) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;
        const sets = ex.sets.map((s, j) =>
          j === si ? { ...s, done: !s.done, doneAt: !s.done ? new Date().toISOString() : s.doneAt } : s
        );
        return { ...ex, sets };
      });
      return { ...w, exercises };
    });
  };

  const updateSetField = (ei: number, si: number, field: "kg" | "reps" | "rpe", value: string) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;
        const sets = ex.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s));
        return { ...ex, sets };
      });
      return { ...w, exercises };
    });
  };

  const addSet = (ei: number) => {
    setWorkout((w) => {
      if (!w) return w;

      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;

        const last = ex.sets[ex.sets.length - 1];
        const clonedKg = last ? last.kg : "";
        const clonedReps = last ? last.reps : "";

        const nextIdx = (ex.sets[ex.sets.length - 1]?.idx ?? ex.sets.length) + 1;

        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              idx: nextIdx,
              kg: clonedKg,
              reps: clonedReps,
              done: false,
            },
          ],
        };
      });

      return { ...w, exercises };
    });
  };

  const removeSet = (ei: number, si: number) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.map((ex, i) => {
        if (i !== ei) return ex;
        const remaining = ex.sets.filter((_, j) => j !== si);
        const reindexed = remaining.map((s, idx) => ({ ...s, idx: idx + 1 }));
        return { ...ex, sets: reindexed };
      });
      return { ...w, exercises };
    });
  };

  const removeExercise = (ei: number) => {
    setWorkout((w) => {
      if (!w) return w;
      const exercises = w.exercises.filter((_, i) => i !== ei);
      return { ...w, exercises };
    });
  };

  // === Panel de búsqueda de ejercicios extra (usando la misma lógica que tu Librería) ===
  const [showFinder, setShowFinder] = useState(false);

  // estado de filtros reutilizable y consistente
  const filters = useExerciseFilters();
  const { data: muscleGroupsResponse, isLoading: isLoadingMuscleGroups } = useGetMuscleGroupsQuery();
  const { data: equipmentResponse, isLoading: isLoadingEquipment } = useGetEquipmentTypesQuery();
  const { data: difficultyResponse, isLoading: isLoadingDifficulty } = useGetDifficultyLevelsQuery();

  const muscleGroups = useMemo(() => muscleGroupsResponse?.data || [], [muscleGroupsResponse?.data]);
  const equipmentTypes = useMemo(() => equipmentResponse?.data || [], [equipmentResponse?.data]);
  const difficultyLevels = useMemo(() => {
    const raw = difficultyResponse?.data || [];
    const norm = raw
      .map((d: string) => d?.toLowerCase?.())
      .filter((d: string) => ["principiante", "intermedio", "avanzado"].includes(d));
    return [...new Set(norm)];
  }, [difficultyResponse?.data]);

  // argumentos idénticos a ExerciseListPage
  const args = useMemo(
    () => ({
      search: (filters.debouncedSearch || "").trim() || undefined,
      grupo_muscular: filters.selectedMuscleGroup === "all" ? undefined : filters.selectedMuscleGroup,
      dificultad: filters.selectedDifficulty === "all" ? undefined : filters.selectedDifficulty.toLowerCase(),
      equipamento: filters.selectedEquipment === "all" ? undefined : filters.selectedEquipment.toLowerCase(),
      limit: 25,
      offset: 0,
    }),
    [filters.debouncedSearch, filters.selectedMuscleGroup, filters.selectedDifficulty, filters.selectedEquipment]
  );

  // consulta SOLO cuando el panel está visible
  const { data: searchResp, isLoading: searching } = useGetExercisesQuery(args, { skip: !showFinder });
  const results = searchResp?.data ?? [];

  const addExtraExerciseFromCatalog = (e: any) => {
    setWorkout((w) => {
      if (!w) return w;
      const nextOrden = Math.max(0, ...w.exercises.map((ex) => ex.orden ?? 0)) + 1;
      const newEx: WorkoutExercise = {
        id_ejercicio: Number(e.id),
        nombre: e.nombre ?? `Ejercicio ${e.id}`,
        imagen: e.ejemplo ?? null,
        orden: nextOrden,
        sets: [{ idx: 1, kg: "", reps: "", rpe: "", done: false }],
      };
      return { ...w, exercises: [...w.exercises, newEx] };
    });
    toast.success("Ejercicio agregado al final");
  };

  // === Guardado ===
  function buildPayloadFromState() {
    if (!workout) return null;

    const setsValidos = workout.exercises.flatMap(
      (ex) =>
        ex.sets
          .map((s) => {
            const kg = parseFloat(s.kg);
            const reps = parseInt(s.reps, 10);
            if (Number.isNaN(kg) || Number.isNaN(reps)) return null;
            return {
              id_ejercicio: ex.id_ejercicio,
              idx: s.idx,
              kg,
              reps,
              rpe: s.rpe || null,
              done: !!s.done,
              done_at: s.done ? s.doneAt ?? new Date().toISOString() : null,
            };
          })
          .filter(Boolean) as any[]
    );

    const total_volumen = setsValidos.filter((s) => s.done).reduce((acc, s) => acc + s.kg * s.reps, 0);
    const duracion_seg = Math.max(1, Math.round(elapsed / 1000));

    return {
      id_rutina: workout.id_rutina,
      started_at: workout.startedAt,
      ended_at: new Date().toISOString(),
      duracion_seg,
      total_volumen,
      sensacion_global: null,
      notas: null,
      sets: setsValidos,
    };
  }

  async function handleFinalizar() {
    const payload = buildPayloadFromState();
    if (!payload) return;
    if (!payload.sets.length) {
      toast.error("No hay sets válidos para guardar.");
      return;
    }
    try {
      const res = await createWorkout(payload).unwrap();
      toast.success(`Entrenamiento guardado #${res.id_sesion}`);
      navigate("/dashboard");
    } catch (e: any) {
      console.error(e);
      toast.error("No se pudo guardar el entrenamiento");
    }
  }

  // === Render ===
  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {workout?.nombre ?? (isLoading ? "Cargando..." : isError ? "Error" : "Entrenamiento")}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4" />
              <span className="tabular-nums font-medium">{formatElapsed(elapsed)}</span>
            </div>
          </div>
          {workout?.descripcion && <p className="text-sm text-muted-foreground">{workout.descripcion}</p>}
        </CardHeader>
      </Card>

      {/* Resumen fijo */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border rounded-md p-3 flex items-center justify-between">
        <div className="text-sm flex flex-wrap gap-4">
          <span>
            Sets hechos: <span className="font-medium">{doneSets}</span> / {totalSets}
          </span>
          <span>
            Volumen: <span className="font-medium">{totalVolume.toLocaleString()} kg</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Salir (sin guardar)
          </Button>
        </div>
      </div>

      {/* Estados de carga / error */}
      {isError && (
        <div className="p-4">
          <p>Ocurrió un error al cargar la rutina.</p>
          <Button onClick={() => navigate(-1)} variant="secondary">
            Volver
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando entrenamiento...
        </div>
      )}

      {/* Lista de ejercicios */}
      {!isLoading &&
        workout &&
        workout.exercises.map((ex, ei) => (
          <Card key={`${ex.id_ejercicio}-${ei}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {ex.imagen ? (
                    <img
                      src={ex.imagen}
                      alt={ex.nombre ?? "Ejercicio"}
                      className="h-10 w-10 rounded-md object-cover border"
                      onError={(e) => ((e.currentTarget.src = ""), (e.currentTarget.alt = "Sin imagen"))}
                    />
                  ) : (
                    <div className="h-10 w-10 grid place-items-center rounded-md border">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <CardTitle className="text-base">{ex.nombre ?? `Ejercicio ${ei + 1}`}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeExercise(ei)} title="Eliminar ejercicio">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {ex.sets.map((s, si) => (
                  <div key={`${s.idx}-${si}`} className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-2 text-xs text-muted-foreground">Set {s.idx}</div>

                    <div className="col-span-3 flex items-center gap-2">
                      <label className="text-xs w-10">KG</label>
                      <Input
                        inputMode="decimal"
                        value={s.kg}
                        onChange={(e) => updateSetField(ei, si, "kg", e.target.value)}
                        placeholder="kg"
                      />
                    </div>

                    <div className="col-span-3 flex items-center gap-2">
                      <label className="text-xs w-10">Reps</label>
                      <Input
                        inputMode="numeric"
                        value={s.reps}
                        onChange={(e) => updateSetField(ei, si, "reps", e.target.value)}
                        placeholder="reps"
                      />
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <label className="text-xs w-10">RPE</label>
                      <select
                        className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                        value={s.rpe}
                        onChange={(e) => updateSetField(ei, si, "rpe", e.target.value)}
                      >
                        <option value="">--</option>
                        {RPE_OPCIONES.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <label className="text-xs">Hecho</label>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={s.done}
                        onChange={() => toggleSetDone(ei, si)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeSet(ei, si)} title="Eliminar serie">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator className="my-2" />

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => addSet(ei)}>
                    <Plus className="h-4 w-4 mr-1" /> Añadir serie
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

      {/* --- Botón para abrir buscador de ejercicios extra --- */}
      <div className="flex justify-end">
        {!showFinder ? (
          <Button variant="default" onClick={() => setShowFinder(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar ejercicios extra
          </Button>
        ) : null}
      </div>

      {/* --- Panel de búsqueda con filtros (mismos que la Librería) --- */}
      {showFinder && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Buscar ejercicio para agregar</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowFinder(false)} title="Cerrar">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar ejercicios…</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.searchTerm}
                  onChange={(e) => filters.setSearchTerm(e.target.value)}
                  placeholder="Nombre o descripción"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Advanced filters reutilizados */}
            <AdvancedFilters
              expanded={true}
              muscleGroups={muscleGroups}
              difficultyLevels={difficultyLevels}
              equipmentTypes={equipmentTypes}
              values={{
                selectedMuscleGroup: filters.selectedMuscleGroup,
                selectedDifficulty: filters.selectedDifficulty,
                selectedEquipment: filters.selectedEquipment,
              }}
              onChange={{
                setSelectedMuscleGroup: filters.setSelectedMuscleGroup,
                setSelectedDifficulty: filters.setSelectedDifficulty,
                setSelectedEquipment: filters.setSelectedEquipment,
              }}
              loading={{
                isLoadingMuscleGroups,
                isLoadingDifficulty,
                isLoadingEquipment,
              }}
            />

            <Separator />

            {/* Resultados */}
            <div className="space-y-2">
              {searching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando ejercicios…
                </div>
              )}

              {!searching && results.length === 0 && (
                <div className="text-sm text-muted-foreground">No se encontraron ejercicios.</div>
              )}

              {results.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
                  <div className="flex items-center gap-3">
                    {e.ejemplo ? (
                      <img
                        src={e.ejemplo}
                        alt={e.nombre ?? "Ejercicio"}
                        className="h-10 w-10 rounded-md object-cover border"
                        onError={(ev) => ((ev.currentTarget.src = ""), (ev.currentTarget.alt = "Sin imagen"))}
                      />
                    ) : (
                      <div className="h-10 w-10 grid place-items-center rounded-md border">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-sm">
                      <div className="font-medium">{e.nombre ?? `Ejercicio #${e.id}`}</div>
                      <div className="text-muted-foreground">
                        {(e.grupo_muscular || "—") + " · " + (e.dificultad || "—") + " · " + (e.equipamento || "—")}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => addExtraExerciseFromCatalog(e)}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button disabled={saving} onClick={handleFinalizar}>
          {saving ? "Guardando..." : "Finalizar rutina"}
        </Button>
      </div>
    </div>
  );
}
