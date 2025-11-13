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
    <div className="flex-shrink-0 space-y-3 sm:space-y-4 border-b pb-4">
      {/* Buscador (altura táctil + icono alineado) */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 pl-10 pr-4 rounded-xl"
        />
      </div>

      {/* Filtros */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filtros
          </h4>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-xs h-9">
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Grupo Muscular */}
        <div>
          <h5 className="mb-2 text-xs font-medium text-muted-foreground">Grupo Muscular</h5>
          {/* En móvil: fila scrollable para evitar columnas altas; en ≥sm: wrap */}
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible -mx-1 px-1">
            {muscleGroupOptions.map((group) => (
              <Badge
                key={group}
                variant={selectedMuscleGroup === group ? "default" : "outline"}
                className="cursor-pointer h-8 rounded-full px-3 text-[11px] sm:text-xs whitespace-nowrap transition-colors hover:bg-primary/10"
                onClick={() => setSelectedMuscleGroup(group)}
                aria-pressed={selectedMuscleGroup === group}
              >
                {group}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dificultad y Equipamiento */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h5 className="mb-2 text-xs font-medium text-muted-foreground">Dificultad</h5>
            <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible -mx-1 px-1">
              {difficultyOptions.map((level) => (
                <Badge
                  key={level}
                  variant={selectedDifficulty === level ? "default" : "outline"}
                  className="cursor-pointer h-8 rounded-full px-3 text-[11px] sm:text-xs whitespace-nowrap transition-colors hover:bg-primary/10"
                  onClick={() => setSelectedDifficulty(level)}
                  aria-pressed={selectedDifficulty === level}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h5 className="mb-2 text-xs font-medium text-muted-foreground">Equipamiento</h5>
            <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible -mx-1 px-1">
              {equipmentOptions.map((equipment) => (
                <Badge
                  key={equipment}
                  variant={selectedEquipment === equipment ? "default" : "outline"}
                  className="cursor-pointer h-8 rounded-full px-3 text-[11px] sm:text-xs whitespace-nowrap transition-colors hover:bg-primary/10"
                  onClick={() => setSelectedEquipment(equipment)}
                  aria-pressed={selectedEquipment === equipment}
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
