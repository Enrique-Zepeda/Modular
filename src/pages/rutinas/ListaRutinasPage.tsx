import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  TagIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useGetRutinasQuery, useEliminarRutinaMutation } from "../../features/rutinas/api/rutinasApi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ListaRutinasPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [filtroObjetivo, setFiltroObjetivo] = useState<string>("todos");

  const { data: rutinas = [], isLoading, error } = useGetRutinasQuery();
  const [eliminarRutina, { isLoading: isDeleting }] = useEliminarRutinaMutation();

  const rutinasFiltradas = rutinas.filter((rutina) => {
    const matchesSearch = rutina.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rutina.descripcion && rutina.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesNivel = filtroNivel === "todos" || rutina.nivel_recomendado === filtroNivel;
    const matchesObjetivo = filtroObjetivo === "todos" || rutina.objetivo === filtroObjetivo;

    return matchesSearch && matchesNivel && matchesObjetivo;
  });

  const handleEliminarRutina = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la rutina "${nombre}"?`)) return;

    try {
      await eliminarRutina(id).unwrap();
      toast.success("Rutina eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
      toast.error("Error al eliminar la rutina");
    }
  };

  const getNivelColor = (nivel: string | null) => {
    switch (nivel) {
      case "principiante":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermedio":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "avanzado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getObjetivoColor = (objetivo: string | null) => {
    switch (objetivo) {
      case "fuerza":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "hipertrofia":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "resistencia":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error al cargar las rutinas</h1>
          <p className="text-gray-600 mt-2">No se pudieron cargar las rutinas</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mis Rutinas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestiona y crea tus rutinas de ejercicios personalizadas
            </p>
          </div>

          <Button onClick={() => navigate("/rutinas/crear")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Crear Rutina
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar rutinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroNivel} onValueChange={setFiltroNivel}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los niveles</SelectItem>
                  <SelectItem value="principiante">Principiante</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroObjetivo} onValueChange={setFiltroObjetivo}>
                <SelectTrigger>
                  <SelectValue placeholder="Objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los objetivos</SelectItem>
                  <SelectItem value="fuerza">Fuerza</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                  <SelectItem value="resistencia">Resistencia</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFiltroNivel("");
                  setFiltroObjetivo("");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de rutinas */}
      {rutinasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <PlusIcon className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {rutinas.length === 0 ? "No tienes rutinas creadas" : "No se encontraron rutinas"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {rutinas.length === 0 
                ? "Crea tu primera rutina para comenzar a entrenar"
                : "Intenta ajustar los filtros de búsqueda"
              }
            </p>
            {rutinas.length === 0 && (
              <Button onClick={() => navigate("/rutinas/crear")}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Crear Primera Rutina
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {rutinasFiltradas.map((rutina, index) => (
              <motion.div
                key={rutina.id_rutina}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 mb-2">
                          {rutina.nombre}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {rutina.descripcion || "Sin descripción"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/rutinas/${rutina.id_rutina}`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEliminarRutina(rutina.id_rutina, rutina.nombre)}
                          disabled={isDeleting}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {rutina.nivel_recomendado && (
                        <Badge className={getNivelColor(rutina.nivel_recomendado)}>
                          <UserIcon className="h-3 w-3 mr-1" />
                          {rutina.nivel_recomendado}
                        </Badge>
                      )}
                      {rutina.objetivo && (
                        <Badge className={getObjetivoColor(rutina.objetivo)}>
                          <TagIcon className="h-3 w-3 mr-1" />
                          {rutina.objetivo}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {rutina.duracion_estimada ? `${rutina.duracion_estimada} min` : "Duración no especificada"}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => navigate(`/rutinas/${rutina.id_rutina}`)}
                    >
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ListaRutinasPage; 