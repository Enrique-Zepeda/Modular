import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon } from "@heroicons/react/24/outline";
import { agregarEjercicioSchema, type AgregarEjercicioFormData } from "../../lib/validations/schemas/ejercicioSchema";
import { useGetEjerciciosQuery } from "../../features/rutinas/api/rutinasApi";
import type { Ejercicio, FiltrosEjercicios } from "../../types/rutinas";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExerciseImage } from "@/components/ui/exercise-image";

interface SelectorEjerciciosProps {
  onEjercicioAgregado: (ejercicioData: AgregarEjercicioFormData) => void;
  ejerciciosExistentes?: number[];
}

const SelectorEjercicios: React.FC<SelectorEjerciciosProps> = ({ onEjercicioAgregado, ejerciciosExistentes = [] }) => {
  const [filtros, setFiltros] = useState<FiltrosEjercicios>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<Ejercicio | null>(null);

  const { data: ejercicios = [], isLoading } = useGetEjerciciosQuery({
    ...filtros,
    search: searchTerm,
  });

  const form = useForm<AgregarEjercicioFormData>({
    resolver: zodResolver(agregarEjercicioSchema),
    defaultValues: {
      id_ejercicio: 0,
      series: 3,
      repeticiones: 10,
      peso_sugerido: 0,
    },
  });

  const handleEjercicioSelect = (ejercicio: Ejercicio) => {
    setEjercicioSeleccionado(ejercicio);
    form.setValue("id_ejercicio", ejercicio.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: AgregarEjercicioFormData) => {
    onEjercicioAgregado(data);
    setIsDialogOpen(false);
    setEjercicioSeleccionado(null);
    form.reset();
  };

  const ejerciciosDisponibles = ejercicios.filter((ejercicio) => !ejerciciosExistentes.includes(ejercicio.id));

  const gruposMusculares = Array.from(new Set(ejercicios.map((e) => e.grupo_muscular).filter(Boolean))).sort();

  const dificultades = Array.from(new Set(ejercicios.map((e) => e.dificultad).filter(Boolean))).sort();

  const equipamentos = Array.from(new Set(ejercicios.map((e) => e.equipamento).filter(Boolean))).sort();

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar ejercicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <MagnifyingGlassIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filtros.grupo_muscular || ""}
              onValueChange={(value) =>
                setFiltros((prev) => ({
                  ...prev,
                  grupo_muscular: value === "todos" ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {gruposMusculares.map((grupo) => (
                  <SelectItem key={grupo} value={grupo || ""}>
                    {grupo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filtros.dificultad || ""}
              onValueChange={(value) =>
                setFiltros((prev) => ({
                  ...prev,
                  dificultad: value === "todos" ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {dificultades.map((dificultad) => (
                  <SelectItem key={dificultad} value={dificultad || ""}>
                    {dificultad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filtros.equipamento || ""}
              onValueChange={(value) =>
                setFiltros((prev) => ({
                  ...prev,
                  equipamento: value === "todos" ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {equipamentos.map((equipamento) => (
                  <SelectItem key={equipamento} value={equipamento || ""}>
                    {equipamento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de ejercicios */}
      <Card>
        <CardHeader>
          <CardTitle>Ejercicios Disponibles</CardTitle>
          <CardDescription>Selecciona ejercicios para agregar a tu rutina</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ejerciciosDisponibles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No se encontraron ejercicios con los filtros aplicados</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {ejerciciosDisponibles.map((ejercicio) => (
                  <motion.div
                    key={ejercicio.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm line-clamp-2">{ejercicio.nombre}</h3>
                          <Button size="sm" variant="ghost" onClick={() => handleEjercicioSelect(ejercicio)}>
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {ejercicio.grupo_muscular && (
                            <Badge variant="secondary" className="text-xs">
                              {ejercicio.grupo_muscular}
                            </Badge>
                          )}

                          {ejercicio.dificultad && (
                            <Badge variant="outline" className="text-xs">
                              {ejercicio.dificultad}
                            </Badge>
                          )}

                          {ejercicio.equipamento && (
                            <Badge variant="outline" className="text-xs">
                              {ejercicio.equipamento}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3">
                          <ExerciseImage
                            src={ejercicio.ejemplo}
                            alt={`Ejemplo de ${ejercicio.nombre}`}
                            aspectRatio="4/3"
                            size="md"
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

      {/* Dialog para configurar ejercicio */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Ejercicio</DialogTitle>
            <DialogDescription>
              Configura las series, repeticiones y peso sugerido para{" "}
              <span className="font-semibold">{ejercicioSeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repeticiones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeticiones</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="peso_sugerido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Agregar Ejercicio
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectorEjercicios;
