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
    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-background border-2 border-border/60 shadow-lg">
      {onSearchChange && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar ejercicios..."
              className="h-10 pl-10 pr-10 text-sm rounded-xl border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <FilterBlock
          icon={<Dumbbell className="h-4 w-4" />}
          label="Músculo"
          loading={isLoadingMG}
          control={
            <select
              className="h-10 w-full bg-background border-2 border-border/60 hover:border-primary/50 focus:border-primary rounded-xl px-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
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
          icon={<Activity className="h-4 w-4" />}
          label="Dificultad"
          loading={isLoadingDif}
          control={
            <select
              className="h-10 w-full bg-background border-2 border-border/60 hover:border-primary/50 focus:border-primary rounded-xl px-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
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
          icon={<Wrench className="h-4 w-4" />}
          label="Equipo"
          loading={isLoadingEq}
          control={
            <select
              className="h-10 w-full bg-background border-2 border-border/60 hover:border-primary/50 focus:border-primary rounded-xl px-3 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
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
