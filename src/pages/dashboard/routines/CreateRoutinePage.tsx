import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { crearRutinaSchema, type CrearRutinaFormData } from "@/lib/validations/schemas/rutinaSchema";
import { useCrearRutinaUsuarioMutation } from "@/features/rutinas/api/rutinasApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CreateRoutinePage() {
  const navigate = useNavigate();
  const [crearRutina, { isLoading }] = useCrearRutinaUsuarioMutation();

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
      console.log("Creando rutina con datos:", data);
      
      const rutina = await crearRutina(data).unwrap();
      console.log("Rutina creada exitosamente:", rutina);
      
      toast.success("¡Rutina creada exitosamente! Por defecto es privada e inactiva.");
      
      // Redirigir después de un breve delay para que se vea el toast
      setTimeout(() => {
        navigate(`/dashboard/routines/${rutina.id_rutina}`);
      }, 1000);
      
    } catch (error) {
      console.error("Error al crear rutina:", error);
      
      // Mostrar mensaje de error más específico
      let errorMessage = "Error al crear la rutina. Inténtalo de nuevo.";
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data) {
        errorMessage = `Error: ${error.data}`;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Rutina</h1>
          <p className="text-muted-foreground">Define los detalles de tu nueva rutina de ejercicios</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Información de la Rutina
            </CardTitle>
            <CardDescription>Completa todos los campos para crear tu rutina personalizada</CardDescription>
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
                        <Input placeholder="Ej: Rutina de Fuerza Superior" {...field} />
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
                        <Textarea
                          placeholder="Describe el objetivo y enfoque de esta rutina..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isLoading ? "Creando..." : "Crear Rutina"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
