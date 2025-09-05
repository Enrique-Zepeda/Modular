import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function useExerciseFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

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
    setSearchTerm("");
    setSelectedMuscleGroup("all");
    setSelectedDifficulty("all");
    setSelectedEquipment("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedEquipment,
    setSelectedEquipment,
    isFiltersExpanded,
    setIsFiltersExpanded,
    debouncedSearch,
    hasActiveFilters,
    activeFiltersCount,
    clearFilters,
  };
}
