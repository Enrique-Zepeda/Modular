// src/components/rutinas/selector-ejercicios/SelectorEjercicios.tsx
import React, { useCallback, useMemo, useState } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetEjerciciosQuery } from "@/features/routines/api/rutinasApi";
import type { Ejercicio } from "@/types/rutinas";
import type { AgregarEjercicioFormData } from "@/lib/validations/schemas/ejercicioSchema";
import { ExerciseFilters } from "./ExerciseFilters";
import { ExerciseGrid } from "./ExerciseGrid";
import { ConfigureExerciseDialog } from "./ConfigureExerciseDialog";
import { useRoutineExerciseFilters } from "@/features/routines/hooks"; // asegúrate que el index.ts lo exporte

interface SelectorEjerciciosProps {
  onEjercicioAgregado: (ejercicioData: AgregarEjercicioFormData) => void;
  ejerciciosExistentes?: number[];
}

const SelectorEjercicios: React.FC<SelectorEjerciciosProps> = ({ onEjercicioAgregado, ejerciciosExistentes = [] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<Ejercicio | null>(null);

  // ✅ usar el hook SIN argumentos; solo da filtros + búsqueda (debounced)
  const { filtros, setFiltros, searchTerm, setSearchTerm, debouncedSearch } = useRoutineExerciseFilters();

  // Query a Supabase (RTKQ) usando filtros + búsqueda
  const { data: ejercicios = [], isLoading } = useGetEjerciciosQuery({
    ...filtros,
    search: debouncedSearch,
  });

  // ✅ derivados en el componente (no en el hook)
  const gruposMusculares = useMemo(
    () =>
      Array.from(new Set(ejercicios.map((e) => e.grupo_muscular).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b)
      ),
    [ejercicios]
  );

  const dificultades = useMemo(
    () =>
      Array.from(new Set(ejercicios.map((e) => e.dificultad).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b)
      ),
    [ejercicios]
  );

  const equipamentos = useMemo(
    () =>
      Array.from(new Set(ejercicios.map((e) => e.equipamento).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b)
      ),
    [ejercicios]
  );

  const ejerciciosDisponibles = useMemo(
    () => ejercicios.filter((e) => !ejerciciosExistentes.includes(e.id)),
    [ejercicios, ejerciciosExistentes]
  );

  const handleEjercicioSelect = useCallback((ejercicio: Ejercicio) => {
    setEjercicioSeleccionado(ejercicio);
    setIsDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (data: AgregarEjercicioFormData) => {
      onEjercicioAgregado(data);
      setIsDialogOpen(false);
      setEjercicioSeleccionado(null);
    },
    [onEjercicioAgregado]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En desktop: filtros a la izquierda y lista a la derecha */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        {/* Filtros */}
        <Card className="lg:col-span-4 lg:sticky lg:top-6 self-start rounded-2xl border border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FunnelIcon className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            <ExerciseFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filtros={filtros}
              onChange={setFiltros}
              grupoMuscularOptions={gruposMusculares}
              dificultadOptions={dificultades}
              equipamentoOptions={equipamentos}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Lista de ejercicios */}
        <Card className="lg:col-span-8 rounded-2xl border border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">Ejercicios Disponibles</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Selecciona ejercicios para agregar a tu rutina
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseGrid items={ejerciciosDisponibles} isLoading={isLoading} onSelect={handleEjercicioSelect} />
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de configuración (fuera del grid para no afectar layout sticky) */}
      <ConfigureExerciseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ejercicio={ejercicioSeleccionado}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SelectorEjercicios;
export { SelectorEjercicios };
