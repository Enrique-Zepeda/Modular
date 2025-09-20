// src/features/exercises/hooks/useExercisesCatalogFilters.ts
import { useMemo, useState } from "react";
import { useSearchFilters } from "@/hooks/useSearchFilters";

export function useExercisesCatalogFilters() {
  const { searchTerm, setSearchTerm, debouncedSearch, clearSearch } = useSearchFilters("", 300);

  // filtros propios del catálogo
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedMuscleGroup !== "all" || selectedDifficulty !== "all" || selectedEquipment !== "all"
  );

  const activeFiltersCount = useMemo(
    () =>
      [
        searchTerm.trim() !== "",
        selectedMuscleGroup !== "all",
        selectedDifficulty !== "all",
        selectedEquipment !== "all",
      ].filter(Boolean).length,
    [searchTerm, selectedMuscleGroup, selectedDifficulty, selectedEquipment]
  );

  const clearFilters = () => {
    clearSearch();
    setSelectedMuscleGroup("all");
    setSelectedDifficulty("all");
    setSelectedEquipment("all");
  };

  return {
    // búsqueda
    searchTerm,
    setSearchTerm,
    debouncedSearch,

    // filtros de catálogo
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedEquipment,
    setSelectedEquipment,
    isFiltersExpanded,
    setIsFiltersExpanded,

    // estado derivado
    hasActiveFilters,
    activeFiltersCount,

    // acciones
    clearFilters,
  };
}
