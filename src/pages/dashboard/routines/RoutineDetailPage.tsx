import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Clock, User, Target, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetRutinaByIdQuery,
  useAgregarEjercicioARutinaMutation,
  useRemoverEjercicioDeRutinaMutation,
  useEliminarRutinaMutation,
} from "@/features/rutinas/api/rutinasApi";
import type { AgregarEjercicioFormData } from "@/types/rutinas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SelectorEjercicios from "@/components/rutinas/SelectorEjercicios";
import { ExerciseImage } from "@/components/ui/exercise-image";

export default function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const { data: rutina, isLoading, error } = useGetRutinaByIdQuery(parseInt(id!));
  const [agregarEjercicio] = useAgregarEjercicioARutinaMutation();
  const [removerEjercicio, { isLoading: isRemoving }] = useRemoverEjercicioDeRutinaMutation();
  const [eliminarRutina, { isLoading: isDeleting }] = useEliminarRutinaMutation();

  const handleEjercicioAgregado = async (ejercicioData: AgregarEjercicioFormData) => {
    try {
      await agregarEjercicio({
        id_rutina: parseInt(id!),
        ejercicioData,
      }).unwrap();
      toast.success("Ejercicio agregado exitosamente");
      setIsSelectorOpen(false);
    } catch (error) {
      console.error("Error al agregar ejercicio:", error);
      toast.error("Error al agregar el ejercicio");
    }
  };

  const handleRemoverEjercicio = async (id_ejercicio: number) => {
    try {
      await removerEjercicio({
        id_rutina: parseInt(id!),
        id_ejercicio,
      }).unwrap();
      toast.success("Ejercicio removido exitosamente");
    } catch (error) {
      console.error("Error al remover ejercicio:", error);
      toast.error("Error al remover el ejercicio");
    }
  };

  const handleEliminarRutina = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta rutina?")) return;

    try {
      await eliminarRutina(parseInt(id!)).unwrap();
      toast.success("Rutina eliminada exitosamente");
      navigate("/dashboard/routines");
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
      toast.error("Error al eliminar la rutina");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !rutina) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error al cargar la rutina</h2>
          <p className="text-muted-foreground mb-4">No se pudo cargar la rutina solicitada</p>
          <Button onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </div>
    );
  }

  const ejerciciosExistentes = rutina.ejercicios.map((e) => e.id_ejercicio);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{rutina.nombre}</h1>
            <p className="text-muted-foreground mt-1">{rutina.descripcion || "Sin descripción"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={handleEliminarRutina} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>

      {/* Información de la rutina */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nivel</p>
                <p className="text-lg font-semibold capitalize">{rutina.nivel_recomendado || "No especificado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objetivo</p>
                <p className="text-lg font-semibold capitalize">{rutina.objetivo || "No especificado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duración</p>
                <p className="text-lg font-semibold">
                  {rutina.duracion_estimada ? `${rutina.duracion_estimada} min` : "No especificada"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ejercicios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ejercicios ({rutina.ejercicios.length})</CardTitle>

            <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ejercicio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar Ejercicios a la Rutina</DialogTitle>
                  <DialogDescription>Selecciona ejercicios para agregar a "{rutina.nombre}"</DialogDescription>
                </DialogHeader>
                <SelectorEjercicios
                  onEjercicioAgregado={handleEjercicioAgregado}
                  ejerciciosExistentes={ejerciciosExistentes}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {rutina.ejercicios.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay ejercicios en esta rutina</h3>
              <p className="text-muted-foreground mb-6">Agrega ejercicios para completar tu rutina de entrenamiento</p>
              <Button onClick={() => setIsSelectorOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Ejercicio
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {rutina.ejercicios.map((ejercicioRutina, index) => (
                  <motion.div
                    key={`${ejercicioRutina.id_rutina}-${ejercicioRutina.id_ejercicio}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2">{ejercicioRutina.ejercicio.nombre}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoverEjercicio(ejercicioRutina.id_ejercicio)}
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {ejercicioRutina.ejercicio.grupo_muscular && (
                          <Badge variant="secondary">{ejercicioRutina.ejercicio.grupo_muscular}</Badge>
                        )}

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">{ejercicioRutina.series}</p>
                            <p className="text-muted-foreground">Series</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{ejercicioRutina.repeticiones}</p>
                            <p className="text-muted-foreground">Reps</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{ejercicioRutina.peso_sugerido}kg</p>
                            <p className="text-muted-foreground">Peso</p>
                          </div>
                        </div>

                        {ejercicioRutina.ejercicio.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ejercicioRutina.ejercicio.descripcion}
                          </p>
                        )}

                        <div className="mt-4">
                          <ExerciseImage
                            src={ejercicioRutina.ejercicio.ejemplo}
                            alt={ejercicioRutina.ejercicio.nombre || "Ejercicio"}
                            aspectRatio="16/9"
                            size="lg"
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
