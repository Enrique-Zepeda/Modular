import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  // búsqueda
  searchTerm: string;
  setSearchTerm: (v: string) => void;

  // opciones
  muscleGroupOptions: string[];
  difficultyOptions: string[];
  equipmentOptions: string[];

  // selección actual
  selectedMuscleGroup: string;
  setSelectedMuscleGroup: (v: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (v: string) => void;
  selectedEquipment: string;
  setSelectedEquipment: (v: string) => void;

  // estado/acciones
  hasActiveFilters: boolean;
  onClear: () => void;
}

export const ExercisePickerFilters: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  muscleGroupOptions,
  difficultyOptions,
  equipmentOptions,
  selectedMuscleGroup,
  setSelectedMuscleGroup,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedEquipment,
  setSelectedEquipment,
  hasActiveFilters,
  onClear,
}) => {
  return (
    <div className="flex-shrink-0 space-y-4 border-b pb-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filtros por categoría */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filtros
          </h4>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Grupo Muscular */}
        <div>
          <h5 className="mb-2 text-xs font-medium text-muted-foreground">Grupo Muscular</h5>
          <div className="flex flex-wrap gap-2">
            {muscleGroupOptions.map((group) => (
              <Badge
                key={group}
                variant={selectedMuscleGroup === group ? "default" : "outline"}
                className="cursor-pointer text-xs transition-colors hover:bg-primary/10"
                onClick={() => setSelectedMuscleGroup(group)}
              >
                {group}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dificultad y Equipamiento */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h5 className="mb-2 text-xs font-medium text-muted-foreground">Dificultad</h5>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((level) => (
                <Badge
                  key={level}
                  variant={selectedDifficulty === level ? "default" : "outline"}
                  className="cursor-pointer text-xs transition-colors hover:bg-primary/10"
                  onClick={() => setSelectedDifficulty(level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h5 className="mb-2 text-xs font-medium text-muted-foreground">Equipamiento</h5>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((equipment) => (
                <Badge
                  key={equipment}
                  variant={selectedEquipment === equipment ? "default" : "outline"}
                  className="cursor-pointer text-xs transition-colors hover:bg-primary/10"
                  onClick={() => setSelectedEquipment(equipment)}
                >
                  {equipment}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
