import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, CheckCircle, AlertCircle, PlusCircle } from "lucide-react";
import { useGetProgramByNameQuery, useCloneProgramForUserMutation } from "@/features/routines/api/rutinasApi";
import toast from "react-hot-toast";

export default function RecomendacionPage() {
  const [objetivo, setObjetivo] = useState<string>("Ganar_Musculo");
  const [nivel, setNivel] = useState<string>("Principiante");
  const [dias, setDias] = useState<string>("3");
  const [tiempo, setTiempo] = useState<string>("60");
  const [equipo, setEquipo] = useState<string>("Gym_Completo");
  const [edad, setEdad] = useState<string>("25");
  const [sexo, setSexo] = useState<string>("Masculino");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const {
    data: programa,
    isLoading: loadingPrograma,
    isError: errorPrograma,
  } = useGetProgramByNameQuery(resultado ?? "", { skip: !resultado });

  const [cloneProgram, { isLoading: isCloning }] = useCloneProgramForUserMutation();

  const validateForm = () => {
    const edadNum = Number.parseInt(edad);
    if (isNaN(edadNum) || edadNum < 16 || edadNum > 90) {
      setError("La edad debe estar entre 16 y 90 años");
      return false;
    }
    return true;
  };

  const handleCopyProgram = async () => {
    if (!programa) return;

    toast.promise(cloneProgram(programa.id).unwrap(), {
      loading: 'Copiando programa a "Mis Rutinas"...',
      success: <b>¡Programa copiado con éxito! Ahora puedes verlo en tu lista de rutinas.</b>,
      error: <b>No se pudo copiar el programa. Inténtalo de nuevo.</b>,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    const payload = {
      objetivo,
      nivel,
      dias,
      tiempo,
      equipo,
      edad: Number.parseInt(edad),
      sexo,
    };

    try {
      const res = await fetch("https://apirecomendador.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al obtener recomendación");
      }
      setResultado(data.rutina_recomendada);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Recomendación de Rutina</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Completa el formulario para obtener una rutina personalizada basada en tus objetivos y características
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card border border-border/40 shadow-xl premium-hover">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                <Sparkles className="h-6 w-6 text-primary" />
                Información Personal
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Proporciona tus datos para generar una recomendación precisa
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">¿Cuál es tu objetivo principal?</Label>
                    <Select value={objetivo} onValueChange={setObjetivo}>
                      <SelectTrigger className="h-12 glass-input border-0 bg-muted/20">
                        <SelectValue placeholder="Selecciona tu objetivo" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        <SelectItem value="Ganar_Musculo" className="premium-hover">
                          Ganar Músculo
                        </SelectItem>
                        <SelectItem value="Perder_Grasa" className="premium-hover">
                          Perder Grasa
                        </SelectItem>
                        <SelectItem value="Mantenerse" className="premium-hover">
                          Mantenerse
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">¿Cuál es tu nivel de experiencia?</Label>
                    <Select value={nivel} onValueChange={setNivel}>
                      <SelectTrigger className="h-12 glass-input border-0 bg-muted/20">
                        <SelectValue placeholder="Selecciona tu nivel" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        <SelectItem value="Principiante" className="premium-hover">
                          Principiante
                        </SelectItem>
                        <SelectItem value="Intermedio" className="premium-hover">
                          Intermedio
                        </SelectItem>
                        <SelectItem value="Avanzado" className="premium-hover">
                          Avanzado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">
                      ¿Cuántos días a la semana planeas entrenar?
                    </Label>
                    <Select value={dias} onValueChange={setDias}>
                      <SelectTrigger className="h-12 glass-input border-0 bg-muted/20">
                        <SelectValue placeholder="Selecciona los días" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        <SelectItem value="2" className="premium-hover">
                          2
                        </SelectItem>
                        <SelectItem value="3" className="premium-hover">
                          3
                        </SelectItem>
                        <SelectItem value="4" className="premium-hover">
                          4
                        </SelectItem>
                        <SelectItem value="5" className="premium-hover">
                          5
                        </SelectItem>
                        <SelectItem value="6" className="premium-hover">
                          6
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">
                      ¿Cuánto tiempo tienes por sesión? (minutos)
                    </Label>
                    <Select value={tiempo} onValueChange={setTiempo}>
                      <SelectTrigger className="h-12 glass-input border-0 bg-muted/20">
                        <SelectValue placeholder="Selecciona el tiempo" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        <SelectItem value="30" className="premium-hover">
                          30 min
                        </SelectItem>
                        <SelectItem value="45" className="premium-hover">
                          45 min
                        </SelectItem>
                        <SelectItem value="60" className="premium-hover">
                          60 min
                        </SelectItem>
                        <SelectItem value="75" className="premium-hover">
                          75 min
                        </SelectItem>
                        <SelectItem value="90" className="premium-hover">
                          90+ min
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">¿Qué equipo tienes disponible?</Label>
                    <Select value={equipo} onValueChange={setEquipo}>
                      <SelectTrigger className="h-12 glass-input border-0 bg-muted/20">
                        <SelectValue placeholder="Selecciona el equipo" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        <SelectItem value="Solo_Cuerpo" className="premium-hover">
                          Solo Cuerpo
                        </SelectItem>
                        <SelectItem value="Mancuernas" className="premium-hover">
                          Mancuernas
                        </SelectItem>
                        <SelectItem value="Gym_Completo" className="premium-hover">
                          Gym Completo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">¿Cuál es tu sexo?</Label>
                    <Select value={sexo} onValueChange={setSexo}>
                      <SelectTrigger className="h-12 glass-input border-0 bg-muted/20">
                        <SelectValue placeholder="Selecciona tu sexo" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        <SelectItem value="Masculino" className="premium-hover">
                          Masculino
                        </SelectItem>
                        <SelectItem value="Femenino" className="premium-hover">
                          Femenino
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-sm font-semibold text-foreground">¿Cuál es tu edad?</Label>
                    <Input
                      type="number"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      placeholder="Ingresa tu edad"
                      min="16"
                      max="90"
                      className="h-12 glass-input border-0 bg-muted/20"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Generando recomendación...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-5 w-5" />
                        Obtener Recomendación
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="p-4 glass-effect border border-destructive/20 rounded-xl flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-sm text-destructive leading-relaxed">{error}</span>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {loading && (
              <Card className="glass-card border border-border/40 shadow-xl">
                <CardContent className="p-10 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">Analizando tus datos...</h3>
                      <p className="text-muted-foreground leading-relaxed max-w-sm">
                        Nuestro algoritmo está procesando tu información para generar la mejor recomendación.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {resultado && (
              <Card className="glass-card border border-border/40 shadow-xl premium-hover">
                <CardHeader className="space-y-2 pb-6 border-b border-border/40">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                    <CheckCircle className="h-7 w-7 text-primary" />
                    Tu Programa Recomendado
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingPrograma && (
                    <div className="text-center py-10 space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">{resultado.replace(/_/g, " ")}</h3>
                      <div className="flex items-center justify-center gap-3 text-primary">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-base">Cargando detalles y rutinas...</span>
                      </div>
                    </div>
                  )}

                  {errorPrograma && (
                    <div className="flex items-center justify-center gap-3 text-destructive py-10">
                      <AlertCircle className="h-7 w-7" />
                      <span className="text-base">No fue posible cargar los detalles del programa.</span>
                    </div>
                  )}

                  {programa && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <h2 className="text-3xl font-bold text-foreground leading-tight">
                              {programa.nombre?.replace(/_/g, " ")}
                            </h2>
                            <p className="text-base text-muted-foreground leading-relaxed">{programa.descripcion}</p>
                          </div>
                          <Button
                            onClick={handleCopyProgram}
                            disabled={isCloning}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2 shadow-lg shrink-0"
                            title="Copiar programa a 'Mis Rutinas'"
                          >
                            {isCloning ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <PlusCircle className="h-5 w-5" />
                            )}
                            Copiar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground border-b border-border/40 pb-3">
                          Rutinas del Programa
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {(programa.ProgramasRutinas ?? []).map((item: any, idx: number) => (
                            <Card
                              key={idx}
                              className="glass-effect border border-border/40 premium-hover transition-all duration-300 hover:shadow-lg"
                            >
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-foreground">
                                  {item?.Rutinas?.nombre?.replace(/_/g, " ") || "Rutina"}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {item?.Rutinas?.descripcion}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!loadingPrograma && !errorPrograma && !programa && (
                    <div className="text-center py-12 space-y-4">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="font-bold text-lg text-foreground">No se encontró el programa recomendado</p>
                        <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Es posible que el programa ya no exista o haya sido modificado. Por favor, intenta generar una
                          nueva recomendación.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
