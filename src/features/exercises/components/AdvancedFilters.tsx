import type React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dumbbell, Activity, Wrench, ChevronDown, Search, X } from "lucide-react";

type Props = {
  expanded?: boolean;
  muscleGroups: string[];
  difficultyLevels: string[];
  equipmentTypes: string[];
  values: {
    selectedMuscleGroup: string;
    selectedDifficulty: string;
    selectedEquipment: string;
  };
  onChange: {
    setSelectedMuscleGroup: (v: string) => void;
    setSelectedDifficulty: (v: string) => void;
    setSelectedEquipment: (v: string) => void;
  };
  loading?: {
    isLoadingMuscleGroups?: boolean;
    isLoadingDifficulty?: boolean;
    isLoadingEquipment?: boolean;
  };
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

function FilterBlock({
  icon,
  label,
  control,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  control: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-full rounded-lg" />
      ) : (
        <div className="relative">
          {control}
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
      )}
    </div>
  );
}

export function AdvancedFilters({
  muscleGroups,
  difficultyLevels,
  equipmentTypes,
  values,
  onChange,
  loading,
  searchValue,
  onSearchChange,
}: Props) {
  const isLoadingMG = !!loading?.isLoadingMuscleGroups;
  const isLoadingDif = !!loading?.isLoadingDifficulty;
  const isLoadingEq = !!loading?.isLoadingEquipment;

  return (
    <div className="p-3 rounded-xl bg-card border border-border/50">
      {onSearchChange && (
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar ejercicios..."
              className="h-8 pl-9 pr-8 text-xs rounded-lg border-border/50 focus:border-primary/50"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <FilterBlock
          icon={<Dumbbell className="h-3 w-3" />}
          label="Músculo"
          loading={isLoadingMG}
          control={
            <select
              className="h-8 w-full bg-background border border-border rounded-lg px-3 pr-8 text-xs text-foreground appearance-none hover:border-border/80 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              value={values.selectedMuscleGroup}
              onChange={(e) => onChange.setSelectedMuscleGroup(e.target.value)}
            >
              <option value="all" className="bg-background text-foreground">
                Todos
              </option>
              {muscleGroups.map((g) => (
                <option key={g} value={g} className="bg-background text-foreground">
                  {g}
                </option>
              ))}
            </select>
          }
        />

        <FilterBlock
          icon={<Activity className="h-3 w-3" />}
          label="Dificultad"
          loading={isLoadingDif}
          control={
            <select
              className="h-8 w-full bg-background border border-border rounded-lg px-3 pr-8 text-xs text-foreground appearance-none hover:border-border/80 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              value={values.selectedDifficulty}
              onChange={(e) => onChange.setSelectedDifficulty(e.target.value)}
            >
              <option value="all" className="bg-background text-foreground">
                Todas
              </option>
              {difficultyLevels.map((d) => (
                <option key={d} value={d} className="bg-background text-foreground">
                  {d}
                </option>
              ))}
            </select>
          }
        />

        <FilterBlock
          icon={<Wrench className="h-3 w-3" />}
          label="Equipo"
          loading={isLoadingEq}
          control={
            <select
              className="h-8 w-full bg-background border border-border rounded-lg px-3 pr-8 text-xs text-foreground appearance-none hover:border-border/80 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              value={values.selectedEquipment}
              onChange={(e) => onChange.setSelectedEquipment(e.target.value)}
            >
              <option value="all" className="bg-background text-foreground">
                Todo
              </option>
              {equipmentTypes.map((t) => (
                <option key={t} value={t} className="bg-background text-foreground">
                  {t}
                </option>
              ))}
            </select>
          }
        />
      </div>
    </div>
  );
}

export default AdvancedFilters;
