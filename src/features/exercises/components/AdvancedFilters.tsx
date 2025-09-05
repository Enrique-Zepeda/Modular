import { AnimatePresence, motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Activity, Dumbbell } from "lucide-react";

export function AdvancedFilters({
  expanded,
  muscleGroups,
  difficultyLevels,
  equipmentTypes,
  values: { selectedMuscleGroup, selectedDifficulty, selectedEquipment },
  onChange: { setSelectedMuscleGroup, setSelectedDifficulty, setSelectedEquipment },
  loading: { isLoadingMuscleGroups, isLoadingDifficulty, isLoadingEquipment },
}: any) {
  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" /> Grupo Muscular
              </label>
              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grupos</SelectItem>
                  {isLoadingMuscleGroups ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    muscleGroups.map((g: string) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" /> Dificultad
              </label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dificultades</SelectItem>
                  {isLoadingDifficulty ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    difficultyLevels.map((d: string) => (
                      <SelectItem key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-4 w-4" /> Equipamiento
              </label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar equipamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el equipamiento</SelectItem>
                  {isLoadingEquipment ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    equipmentTypes.map((e: string) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
