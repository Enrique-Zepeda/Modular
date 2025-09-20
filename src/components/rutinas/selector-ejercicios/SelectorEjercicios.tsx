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
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExerciseFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filtros={filtros}
            onChange={setFiltros}
            // ✅ ahora pasamos arrays, no factories
            grupoMuscularOptions={gruposMusculares}
            dificultadOptions={dificultades}
            equipamentoOptions={equipamentos}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Lista de ejercicios */}
      <Card>
        <CardHeader>
          <CardTitle>Ejercicios Disponibles</CardTitle>
          <CardDescription>Selecciona ejercicios para agregar a tu rutina</CardDescription>
        </CardHeader>
        <CardContent>
          <ExerciseGrid items={ejerciciosDisponibles} isLoading={isLoading} onSelect={handleEjercicioSelect} />
        </CardContent>
      </Card>

      {/* Diálogo de configuración */}
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
