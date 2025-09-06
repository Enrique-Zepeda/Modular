"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { ExerciseImage } from "@/components/ui/exercise-image";
import type { EjercicioRutina } from "@/features/routines/api/rutinasApi";

interface RoutineBuilderExerciseListProps {
  exercises: EjercicioRutina[];
  onRemoveExercise: (exerciseId: number) => void;
  isEditMode: boolean;
}

export function RoutineBuilderExerciseList({
  exercises,
  onRemoveExercise,
  isEditMode,
}: RoutineBuilderExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay ejercicios agregados</h3>
          <p className="text-muted-foreground mb-4">
            Usa la librería de ejercicios para agregar ejercicios a tu rutina
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ejercicios de la Rutina</span>
          <Badge variant="secondary">{exercises.length} ejercicios</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercises.map((exercise, index) => (
          <div
            key={`${exercise.id_rutina}-${exercise.id_ejercicio}`}
            className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
          >
            {/* Drag Handle */}
            <div className="flex-shrink-0 mt-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            </div>

            {/* Exercise Image */}
            <div className="flex-shrink-0">
              <ExerciseImage
                src={exercise.Ejercicios?.ejemplo}
                alt={exercise.Ejercicios?.nombre || "Ejercicio"}
                aspectRatio="1"
                size="sm"
                className="w-16 h-16 rounded-md"
              />
            </div>

            {/* Exercise Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm line-clamp-1">
                    {exercise.Ejercicios?.nombre || "Ejercicio sin nombre"}
                  </h4>
                  <p className="text-xs text-muted-foreground">{exercise.Ejercicios?.grupo_muscular}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveExercise(exercise.id_ejercicio)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Sets Configuration */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Series:</span>
                    <span>{exercise.series || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Reps:</span>
                    <span>{exercise.repeticiones || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Peso:</span>
                    <span>{exercise.peso_sugerido || 0} kg</span>
                  </div>
                </div>

                {/* Sets Table Preview */}
                <div className="bg-muted/50 rounded p-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-1">
                    <span>SET</span>
                    <span>KG</span>
                    <span>REPS</span>
                    <span></span>
                  </div>
                  {Array.from({ length: exercise.series || 1 }).map((_, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-4 gap-2 text-xs py-1">
                      <span>{setIndex + 1}</span>
                      <span>{exercise.peso_sugerido || 0}</span>
                      <span>{exercise.repeticiones || 0}</span>
                      <span className="text-muted-foreground">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
