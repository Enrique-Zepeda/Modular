import { useMemo, useState } from "react";

export type Level = "principiante" | "intermedio" | "avanzado" | "all";
export type Objective = "fuerza" | "hipertrofia" | "resistencia" | "all";

export function useRoutinesFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<Level>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<Objective>("all");

  const hasActive = useMemo(
    () => Boolean(searchTerm.trim() || levelFilter !== "all" || objectiveFilter !== "all"),
    [searchTerm, levelFilter, objectiveFilter]
  );

  const activeCount = useMemo(
    () => [searchTerm.trim() !== "", levelFilter !== "all", objectiveFilter !== "all"].filter(Boolean).length,
    [searchTerm, levelFilter, objectiveFilter]
  );

  const clear = () => {
    setSearchTerm("");
    setLevelFilter("all");
    setObjectiveFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    levelFilter,
    setLevelFilter,
    objectiveFilter,
    setObjectiveFilter,
    hasActive,
    activeCount,
    clear,
  };
}
