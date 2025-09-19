import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Check, Badge } from "lucide-react";
import { ExerciseImage } from "@/components/ui/exercise-image";

interface Exercise {
  id: string;
  nombre: string;
  grupo_muscular: string;
  imagen_url?: string;
  gif_url?: string;
  descripcion?: string;
  equipamiento?: string;
  dificultad?: "Principiante" | "Intermedio" | "Avanzado";
}

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  exercises: Exercise[];
  selectedExercises?: string[];
  title?: string;
  description?: string;
}

const MUSCLE_GROUPS = [
  "Todos",
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Piernas",
  "Glúteos",
  "Abdomen",
  "Cardio",
];

const DIFFICULTY_LEVELS = ["Todos", "Principiante", "Intermedio", "Avanzado"];

const EQUIPMENT_TYPES = [
  "Todos",
  "Peso corporal",
  "Mancuernas",
  "Barra",
  "Máquina",
  "Cable",
  "Kettlebell",
  "Banda elástica",
];

export default function ExercisePicker({
  isOpen,
  onClose,
  onSelectExercise,
  exercises,
  selectedExercises = [],
  title = "Seleccionar Ejercicios",
  description = "Elige los ejercicios que deseas agregar",
}: ExercisePickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("Todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todos");
  const [selectedEquipment, setSelectedEquipment] = useState("Todos");

  const filteredExercises = useMemo(() => {
    const s = searchTerm.toLowerCase();

    return exercises.filter((exercise) => {
      const nombre = exercise.nombre?.toLowerCase() ?? "";
      const desc = exercise.descripcion?.toLowerCase() ?? "";
      const grupo = exercise.grupo_muscular ?? "";
      const diff = exercise.dificultad?.toLowerCase() ?? ""; // normalizado
      const equip = (exercise as any).equipamento ?? (exercise as any).equipamiento ?? "";

      const matchesSearch = !s || nombre.includes(s) || desc.includes(s);

      const matchesMuscleGroup = selectedMuscleGroup === "Todos" || grupo === selectedMuscleGroup;

      const selDiff = selectedDifficulty.toLowerCase();
      const matchesDifficulty = selDiff === "todos" || diff === selDiff;

      const selEquip = selectedEquipment.toLowerCase();
      const matchesEquipment = selEquip === "todos" || (equip?.toString().toLowerCase?.() ?? "") === selEquip;

      return matchesSearch && matchesMuscleGroup && matchesDifficulty && matchesEquipment;
    });
  }, [exercises, searchTerm, selectedMuscleGroup, selectedDifficulty, selectedEquipment]);

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.includes(exerciseId);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMuscleGroup("Todos");
    setSelectedDifficulty("Todos");
    setSelectedEquipment("Todos");
  };

  const hasActiveFilters =
    searchTerm || selectedMuscleGroup !== "Todos" || selectedDifficulty !== "Todos" || selectedEquipment !== "Todos";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex-shrink-0 space-y-4 border-b pb-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Grupo Muscular */}
            <div>
              <h5 className="text-xs font-medium mb-2 text-muted-foreground">Grupo Muscular</h5>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <Badge
                    key={group}
                    variant={selectedMuscleGroup === group ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                    onClick={() => setSelectedMuscleGroup(group)}
                  >
                    {group}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dificultad y Equipamiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground">Dificultad</h5>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <Badge
                      key={level}
                      variant={selectedDifficulty === level ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                      onClick={() => setSelectedDifficulty(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground">Equipamiento</h5>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_TYPES.map((equipment) => (
                    <Badge
                      key={equipment}
                      variant={selectedEquipment === equipment ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
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

        {/* Lista de ejercicios */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Ejercicios Disponibles ({filteredExercises.length})</h3>
              {selectedExercises.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedExercises.length} seleccionados
                </Badge>
              )}
            </div>

            {filteredExercises.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-muted-foreground mb-2">No se encontraron ejercicios</div>
                <p className="text-sm text-muted-foreground mb-4">Intenta ajustar los filtros de búsqueda</p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`group relative bg-card border rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:border-primary/30 ${
                      isExerciseSelected(exercise.id)
                        ? "ring-2 ring-primary/20 border-primary/50 bg-primary/5"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    {/* Imagen del ejercicio */}
                    <div className="mb-4 relative">
                      <ExerciseImage
                        src={exercise.gif_url || exercise.imagen_url}
                        alt={exercise.nombre}
                        aspectRatio="16/9"
                        size="lg"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Información del ejercicio */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] leading-tight">
                          {exercise.nombre}
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {exercise.grupo_muscular}
                        </Badge>
                        {exercise.dificultad && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              exercise.dificultad === "Principiante"
                                ? "border-green-500 text-green-700 bg-green-50"
                                : exercise.dificultad === "Intermedio"
                                ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                : "border-red-500 text-red-700 bg-red-50"
                            }`}
                          >
                            {exercise.dificultad}
                          </Badge>
                        )}
                      </div>

                      {exercise.equipamiento && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{exercise.equipamiento}</p>
                      )}

                      {exercise.descripcion && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {exercise.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Botón de agregar */}
                    <div className="mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleSelectExercise(exercise)}
                        disabled={isExerciseSelected(exercise.id)}
                        className="w-full transition-all"
                        variant={isExerciseSelected(exercise.id) ? "secondary" : "default"}
                      >
                        {isExerciseSelected(exercise.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Agregado
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedExercises.length > 0 && (
              <span>
                {selectedExercises.length} ejercicio{selectedExercises.length !== 1 ? "s" : ""} seleccionado
                {selectedExercises.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
