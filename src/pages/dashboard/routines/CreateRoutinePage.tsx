import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react"; //Bug ---para debug temporal
import { toast } from "react-hot-toast";
import { crearRutinaSchema, type CrearRutinaFormData } from "@/lib/validations/schemas/rutinaSchema";
import { useCreateRutinaMutation } from "@/features/routines/api/rutinasApi";
import { useAuth } from "@/hooks/useAuth";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { ExitConfirmationDialog } from "@/components/ui/exit-confirmation-dialog";
// import { debugAuthStatus, debugCreateRutina, debugRLSStatus, debugUserProfile } from "@/lib/supabase/debug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreateRoutinePage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, requireAuth } = useAuth();
  const [createRutina, { isLoading }] = useCreateRutinaMutation();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const { showExitModal, handleNavigation, confirmExit, cancelExit } = useUnsavedChanges({
    hasUnsavedChanges,
    onNavigateAway: () => setHasUnsavedChanges(false),
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    requireAuth();
    return null;
  }

  const onSubmit = async (data: CrearRutinaFormData) => {
    try {
      const payload = {
        nombre: data.nombre?.trim() || null,
        descripcion: data.descripcion?.trim() || null,
        nivel_recomendado: ["principiante", "intermedio", "avanzado"].includes(data.nivel_recomendado)
          ? (data.nivel_recomendado as "principiante" | "intermedio" | "avanzado")
          : null,
        objetivo: ["fuerza", "hipertrofia", "resistencia"].includes(data.objetivo)
          ? (data.objetivo as "fuerza" | "hipertrofia" | "resistencia")
          : null,
        duracion_estimada:
          Number.isFinite(+data.duracion_estimada) && data.duracion_estimada > 0
            ? Number(data.duracion_estimada)
            : null,
      };

      const rutina = await createRutina(payload).unwrap();
      setHasUnsavedChanges(false);
      toast.success("¡Rutina creada exitosamente!");
      navigate(`/dashboard/routines/${rutina.id_rutina}`);
    } catch (err: any) {
      console.error("Error al crear rutina:", err?.message ?? err, err?.code, err?.details);
      toast.error(err?.message || "No se pudo crear la rutina");
    }
  };

  return (
    <div className="mx-auto max-w-[min(100%,theme(spacing.7xl))] px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      {/* Header: móvil en columna, desde sm en fila */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation("/dashboard/routines")}
          className="h-10 w-10 p-0 rounded-lg"
          aria-label="Volver a rutinas"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">Crear Nueva Rutina</h1>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty">
            Define los detalles de tu nueva rutina de ejercicios
          </p>
        </div>
      </div>

      {/* Contenedor del formulario centrado y fluido */}
      <div className="w-full max-w-2xl">
        <Card className="rounded-2xl border-2 border-border/60 bg-card/50 overflow-hidden">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Plus className="h-5 w-5" />
              Información de la Rutina
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Completa todos los campos para crear tu rutina personalizada
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Rutina</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Rutina de Fuerza Superior" className="h-11" {...field} />
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

                {/* Grid responsive para selects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="nivel_recomendado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel Recomendado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
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
                            <SelectTrigger className="h-11">
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
                          inputMode="numeric"
                          min="1"
                          max="300"
                          placeholder="30"
                          className="h-11"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Acciones: columna en móvil, fila desde sm */}
                <div className="pt-2 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleNavigation("/dashboard/routines")}
                    className="h-11 w-full sm:w-auto sm:flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="h-11 w-full sm:w-auto sm:flex-1">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Creando..." : "Crear Rutina"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <ExitConfirmationDialog open={showExitModal} onOpenChange={cancelExit} onConfirm={confirmExit} />
    </div>
  );
}
