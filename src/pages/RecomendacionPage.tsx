import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Zap,
  Target,
  Calendar,
  Clock,
  Dumbbell,
  User,
  TrendingUp,
} from "lucide-react";
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
    <div className="space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/15 via-purple-500/10 to-background p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)] pointer-events-none" />

        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-500/15 to-primary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 text-purple-500 animate-ping opacity-20">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              Recomendación de Rutina
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium max-w-3xl leading-relaxed">
            Completa el formulario para obtener una rutina personalizada basada en tus objetivos y características.
            Nuestro algoritmo inteligente analizará tus datos para recomendarte la mejor rutina.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Recomendación Instantánea</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-foreground">Personalizado</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Basado en sistema experto</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 border-border/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-primary/30 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
          <CardHeader className="space-y-3 pb-6 pt-8 px-6 border-b border-border/40 bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              Información Personal
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Proporciona tus datos para generar una recomendación precisa y personalizada
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    ¿Cuál es tu objetivo principal?
                  </Label>
                  <Select value={objetivo} onValueChange={setObjetivo}>
                    <SelectTrigger className="h-12 border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 group-hover:shadow-md">
                      <SelectValue placeholder="Selecciona tu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ganar_Musculo">💪 Ganar Músculo</SelectItem>
                      <SelectItem value="Perder_Grasa">🔥 Perder Grasa</SelectItem>
                      <SelectItem value="Mantenerse">⚖️ Mantenerse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    ¿Cuál es tu nivel de experiencia?
                  </Label>
                  <Select value={nivel} onValueChange={setNivel}>
                    <SelectTrigger className="h-12 border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 group-hover:shadow-md">
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principiante">🌱 Principiante</SelectItem>
                      <SelectItem value="Intermedio">📈 Intermedio</SelectItem>
                      <SelectItem value="Avanzado">🏆 Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    ¿Cuántos días a la semana planeas entrenar?
                  </Label>
                  <Select value={dias} onValueChange={setDias}>
                    <SelectTrigger className="h-12 border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 group-hover:shadow-md">
                      <SelectValue placeholder="Selecciona los días" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 días</SelectItem>
                      <SelectItem value="3">3 días</SelectItem>
                      <SelectItem value="4">4 días</SelectItem>
                      <SelectItem value="5">5 días</SelectItem>
                      <SelectItem value="6">6 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    ¿Cuánto tiempo tienes por sesión?
                  </Label>
                  <Select value={tiempo} onValueChange={setTiempo}>
                    <SelectTrigger className="h-12 border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 group-hover:shadow-md">
                      <SelectValue placeholder="Selecciona el tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">⚡ 30 min</SelectItem>
                      <SelectItem value="45">🔥 45 min</SelectItem>
                      <SelectItem value="60">💪 60 min</SelectItem>
                      <SelectItem value="75">🏋️ 75 min</SelectItem>
                      <SelectItem value="90">🚀 90+ min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    ¿Qué equipo tienes disponible?
                  </Label>
                  <Select value={equipo} onValueChange={setEquipo}>
                    <SelectTrigger className="h-12 border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 group-hover:shadow-md">
                      <SelectValue placeholder="Selecciona el equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo_Cuerpo">🤸 Solo Cuerpo</SelectItem>
                      <SelectItem value="Mancuernas">🏋️ Mancuernas</SelectItem>
                      <SelectItem value="Gym_Completo">🏢 Gym Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 group">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    ¿Cuál es tu sexo?
                  </Label>
                  <Select value={sexo} onValueChange={setSexo}>
                    <SelectTrigger className="h-12 border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 group-hover:shadow-md">
                      <SelectValue placeholder="Selecciona tu sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">👨 Masculino</SelectItem>
                      <SelectItem value="Femenino">👩 Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 md:col-span-2 group">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    ¿Cuál es tu edad?
                  </Label>
                  <Input
                    type="number"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="Ingresa tu edad (16-90)"
                    min="16"
                    max="90"
                    className="h-12 border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 group-hover:shadow-md"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90 text-primary-foreground font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
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
                  <div className="p-4 border-2 border-destructive/40 bg-destructive/10 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm text-destructive leading-relaxed font-medium">{error}</span>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {loading && (
            <Card className="border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-background via-primary/5 to-purple-500/5 animate-in fade-in slide-in-from-right-5 duration-500 overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Loader2 className="h-20 w-20 animate-spin text-primary" />
                    <div className="absolute inset-0 h-20 w-20 animate-ping text-purple-500 opacity-20">
                      <Loader2 className="h-20 w-20" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">Analizando tus datos...</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-sm text-base">
                      Nuestro algoritmo está procesando tu información para generar la mejor recomendación
                      personalizada.
                    </p>
                  </div>
                  <div className="w-full max-w-xs space-y-3 pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-muted-foreground">Analizando objetivos...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div
                        className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span className="text-muted-foreground">Evaluando nivel de experiencia...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div
                        className="h-2 w-2 rounded-full bg-primary animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                      <span className="text-muted-foreground">Generando recomendación...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {resultado && (
            <Card className="border-2 border-purple-600/40 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-background via-primary/5 to-purple-500/5 animate-in fade-in slide-in-from-right-5 duration-500 overflow-hidden">
              <CardHeader className="space-y-3 pb-6 pt-8 px-6 border-b border-border/40 bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)] pointer-events-none" />
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground relative">
                  <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                    <CheckCircle className="h-7 w-7 text-primary" />
                  </div>
                  Tu Programa Recomendado
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed relative">
                  Basado en tu perfil, hemos encontrado el programa perfecto para ti
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {loadingPrograma && (
                  <div className="text-center py-12 space-y-6">
                    <h3 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {resultado.replace(/_/g, " ")}
                    </h3>
                    <div className="flex items-center justify-center gap-3 text-primary">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-base font-medium">Cargando detalles y rutinas...</span>
                    </div>
                  </div>
                )}

                {errorPrograma && (
                  <div className="flex flex-col items-center justify-center gap-4 text-destructive py-12 animate-in fade-in duration-300">
                    <div className="p-4 rounded-full bg-destructive/10 border-2 border-destructive/20">
                      <AlertCircle className="h-10 w-10" />
                    </div>
                    <span className="text-base font-medium">No fue posible cargar los detalles del programa.</span>
                  </div>
                )}

                {programa && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <h2 className="text-4xl font-bold text-foreground leading-tight bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                            {programa.nombre?.replace(/_/g, " ")}
                          </h2>
                          <p className="text-base text-muted-foreground leading-relaxed">{programa.descripcion}</p>
                        </div>
                        <Button
                          onClick={handleCopyProgram}
                          disabled={isCloning}
                          size="lg"
                          className="bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90 text-primary-foreground font-bold flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 relative overflow-hidden group"
                          title="Copiar programa a 'Mis Rutinas'"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          {isCloning ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <PlusCircle className="h-5 w-5" />
                          )}
                          Copiar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                          <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-600 rounded-full" />
                          Rutinas del Programa
                        </h3>
                        <div className="h-1 w-24 bg-gradient-to-r from-primary to-purple-600 rounded-full" />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {(programa.ProgramasRutinas ?? []).map((item: any, idx: number) => (
                          <Card
                            key={idx}
                            className="border-2 border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br from-background to-primary/5 group"
                          >
                            <CardHeader className="pb-3 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3 relative">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-purple-600" />
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
                  <div className="text-center py-16 space-y-6 animate-in fade-in duration-300">
                    <div className="p-6 rounded-full bg-muted/50 border-2 border-border/40 w-fit mx-auto">
                      <AlertCircle className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                      <p className="font-bold text-xl text-foreground">No se encontró el programa recomendado</p>
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
  );
}
