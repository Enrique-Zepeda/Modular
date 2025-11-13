import React, { useCallback } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FiltrosEjercicios } from "@/types/rutinas";

interface Props {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  filtros: FiltrosEjercicios;
  onChange: (next: FiltrosEjercicios) => void;
  grupoMuscularOptions: string[];
  dificultadOptions: string[];
  equipamentoOptions: string[];
  isLoading?: boolean;
}

export const ExerciseFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  filtros,
  onChange,
  grupoMuscularOptions,
  dificultadOptions,
  equipamentoOptions,
  isLoading,
}) => {
  const onGrupoChange = useCallback(
    (value: string) => onChange({ ...filtros, grupo_muscular: value === "todos" || value === "" ? undefined : value }),
    [filtros, onChange]
  );
  const onDificultadChange = useCallback(
    (value: string) => onChange({ ...filtros, dificultad: value === "todos" || value === "" ? undefined : value }),
    [filtros, onChange]
  );
  const onEquipamentoChange = useCallback(
    (value: string) => onChange({ ...filtros, equipamento: value === "todos" || value === "" ? undefined : value }),
    [filtros, onChange]
  );

  return (
    <>
      {/* Barra de búsqueda: mobile-first con alturas táctiles y simetría */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Input
          placeholder="Buscar ejercicios..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 h-11 rounded-xl border-2 border-border/60 bg-background text-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
          aria-label="Buscar ejercicios"
        />
        <Button
          variant="outline"
          size="icon"
          type="button"
          aria-label="Ejecutar búsqueda"
          disabled={!!isLoading}
          className="h-11 w-11 rounded-xl border-2 border-border/60"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtros: grid responsiva y alturas iguales */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Select value={filtros.grupo_muscular ?? ""} onValueChange={onGrupoChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-2 border-border/60 text-sm sm:min-w-[160px] md:min-w-[200px]">
            <SelectValue placeholder="Grupo muscular" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {grupoMuscularOptions.map((grupo) => (
              <SelectItem key={grupo} value={grupo}>
                {grupo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.dificultad ?? ""} onValueChange={onDificultadChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-2 border-border/60 text-sm sm:min-w-[160px] md:min-w-[200px]">
            <SelectValue placeholder="Dificultad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {dificultadOptions.map((dif) => (
              <SelectItem key={dif} value={dif}>
                {dif}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.equipamento ?? ""} onValueChange={onEquipamentoChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-2 border-border/60 text-sm sm:min-w-[160px] md:min-w-[200px]">
            <SelectValue placeholder="Equipamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {equipamentoOptions.map((eq) => (
              <SelectItem key={eq} value={eq}>
                {eq}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
