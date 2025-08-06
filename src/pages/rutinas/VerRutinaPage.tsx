import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useGetRutinaByIdQuery, useAgregarEjercicioARutinaMutation, useRemoverEjercicioDeRutinaMutation, useEliminarRutinaMutation } from "../../features/rutinas/api/rutinasApi";
import type { AgregarEjercicioFormData } from "../../types/rutinas";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import SelectorEjercicios from "../../components/rutinas/SelectorEjercicios";

const VerRutinaPage: React.FC = () => {
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
      navigate("/rutinas");
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
      toast.error("Error al eliminar la rutina");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !rutina) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error al cargar la rutina</h1>
          <p className="text-gray-600 mt-2">No se pudo cargar la rutina solicitada</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const ejerciciosExistentes = rutina.ejercicios.map(e => e.id_ejercicio);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {rutina.nombre}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              {rutina.descripcion}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEliminarRutina}
              disabled={isDeleting}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>

        {/* Información de la rutina */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Nivel</p>
                  <p className="text-lg font-semibold capitalize">
                    {rutina.nivel_recomendado || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Objetivo</p>
                  <p className="text-lg font-semibold capitalize">
                    {rutina.objetivo || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-lg font-semibold">
                    {rutina.duracion_estimada ? `${rutina.duracion_estimada} min` : "No especificada"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ejercicios */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ejercicios ({rutina.ejercicios.length})
          </h2>

          <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Ejercicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Ejercicios a la Rutina</DialogTitle>
                <DialogDescription>
                  Selecciona ejercicios para agregar a "{rutina.nombre}"
                </DialogDescription>
              </DialogHeader>
              <SelectorEjercicios
                onEjercicioAgregado={handleEjercicioAgregado}
                ejerciciosExistentes={ejerciciosExistentes}
              />
            </DialogContent>
          </Dialog>
        </div>

        {rutina.ejercicios.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">No hay ejercicios en esta rutina</p>
              <Button onClick={() => setIsSelectorOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Primer Ejercicio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {rutina.ejercicios.map((ejercicioRutina, index) => (
                <motion.div
                  key={`${ejercicioRutina.id_rutina}-${ejercicioRutina.id_ejercicio}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">
                          {ejercicioRutina.ejercicio.nombre}
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoverEjercicio(ejercicioRutina.id_ejercicio)}
                          disabled={isRemoving}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ejercicioRutina.ejercicio.grupo_muscular && (
                        <Badge variant="secondary">
                          {ejercicioRutina.ejercicio.grupo_muscular}
                        </Badge>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{ejercicioRutina.series}</p>
                          <p className="text-gray-500">Series</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{ejercicioRutina.repeticiones}</p>
                          <p className="text-gray-500">Reps</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{ejercicioRutina.peso_sugerido}kg</p>
                          <p className="text-gray-500">Peso</p>
                        </div>
                      </div>

                      {ejercicioRutina.ejercicio.descripcion && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {ejercicioRutina.ejercicio.descripcion}
                        </p>
                      )}

                      {ejercicioRutina.ejercicio.ejemplo && (
                        <div className="mt-2">
                          <img
                            src={ejercicioRutina.ejercicio.ejemplo}
                            alt={ejercicioRutina.ejercicio.nombre || "Ejercicio"}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerRutinaPage; 