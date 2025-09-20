// src/features/routines/hooks/useRoutineExerciseFilters.ts
import { useState } from "react";
import type { FiltrosEjercicios } from "@/types/rutinas";
import { useSearchFilters } from "@/hooks/useSearchFilters";

export function useRoutineExerciseFilters() {
  // 🔽 centralizado
  const { searchTerm, setSearchTerm, debouncedSearch, clearSearch } = useSearchFilters("", 350);

  // filtros del dominio rutinas (objeto que ya consume tu RTKQ)
  const [filtros, setFiltros] = useState<FiltrosEjercicios>({});

  const clearFilters = () => {
    setFiltros({});
    clearSearch();
  };

  return {
    filtros,
    setFiltros,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    clearFilters,
  };
}
