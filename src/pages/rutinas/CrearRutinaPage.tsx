import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { crearRutinaSchema, type CrearRutinaFormData } from "../../lib/validations/schemas/rutinaSchema";
import { useCrearRutinaMutation } from "../../features/rutinas/api/rutinasApi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CrearRutinaPage: React.FC = () => {
  const navigate = useNavigate();
  const [crearRutina, { isLoading }] = useCrearRutinaMutation();

  const form = useForm<CrearRutinaFormData>({
    resolver: zodResolver(crearRutinaSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      nivel_recomendado: "principiante",
      objetivo: "fuerza",
      duracion_estimada: 30,
    },
  });

  const onSubmit = async (data: CrearRutinaFormData) => {
    try {
      const rutina = await crearRutina(data).unwrap();
      toast.success("¡Rutina creada exitosamente!");
      navigate(`/rutinas/${rutina.id_rutina}`);
    } catch (error) {
      console.error("Error al crear rutina:", error);
      toast.error("Error al crear la rutina. Inténtalo de nuevo.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Crear Nueva Rutina
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Define los detalles de tu nueva rutina de ejercicios
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Información de la Rutina
          </CardTitle>
          <CardDescription>
            Completa todos los campos para crear tu rutina personalizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Rutina</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Rutina de Fuerza Superior"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe el objetivo y enfoque de esta rutina..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nivel_recomendado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel Recomendado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="principiante">Principiante</SelectItem>
                          <SelectItem value="intermedio">Intermedio</SelectItem>
                          <SelectItem value="avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objetivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el objetivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fuerza">Fuerza</SelectItem>
                          <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                          <SelectItem value="resistencia">Resistencia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="duracion_estimada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración Estimada (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="300"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Creando..." : "Crear Rutina"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CrearRutinaPage; 