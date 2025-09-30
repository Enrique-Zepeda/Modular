import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
// ---> 1. IMPORTACIONES AÑADIDAS
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

  // ---> 2. HOOK DE LA MUTACIÓN
  // Inicializamos el hook para clonar el programa.
  // 'isCloning' nos dirá si la operación está en curso.
  const [cloneProgram, { isLoading: isCloning }] = useCloneProgramForUserMutation();

  const validateForm = () => {
    const edadNum = parseInt(edad);
    if (isNaN(edadNum) || edadNum < 16 || edadNum > 90) {
      setError("La edad debe estar entre 16 y 90 años");
      return false;
    }
    return true;
  };

  // ---> 3. FUNCIÓN HANDLER PARA COPIAR
  // Esta función se ejecutará cuando el usuario haga clic en el botón "+".
  const handleCopyProgram = async () => {
    // Nos aseguramos de que los datos del programa se hayan cargado.
    if (!programa) return;

    // Usamos toast.promise para darle feedback al usuario de forma elegante.
    toast.promise(
      cloneProgram(programa.id).unwrap(), // Llamamos a la mutación con el ID del programa.
      {
        loading: 'Copiando programa a "Mis Rutinas"...',
        success: <b>¡Programa copiado con éxito! Ahora puedes verlo en tu lista de rutinas.</b>,
        error: <b>No se pudo copiar el programa. Inténtalo de nuevo.</b>,
      }
    );
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
      edad: parseInt(edad),
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Recomendación de Rutina</h1>
          </div>
          <p className="text-lg text-gray-600">
            Completa el formulario para obtener una rutina personalizada basada en tus objetivos y características
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ... (Todo el contenido del formulario se queda igual) ... */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">¿Cuál es tu objetivo principal?</Label>
                    <Select value={objetivo} onValueChange={setObjetivo}><SelectTrigger className="h-11"><SelectValue placeholder="Selecciona tu objetivo" /></SelectTrigger><SelectContent><SelectItem value="Ganar_Musculo">Ganar Músculo</SelectItem><SelectItem value="Perder_Grasa">Perder Grasa</SelectItem><SelectItem value="Mantenerse">Mantenerse</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">¿Cuál es tu nivel de experiencia?</Label>
                    <Select value={nivel} onValueChange={setNivel}><SelectTrigger className="h-11"><SelectValue placeholder="Selecciona tu nivel" /></SelectTrigger><SelectContent><SelectItem value="Principiante">Principiante</SelectItem><SelectItem value="Intermedio">Intermedio</SelectItem><SelectItem value="Avanzado">Avanzado</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">¿Cuántos días a la semana planeas entrenar?</Label>
                    <Select value={dias} onValueChange={setDias}><SelectTrigger className="h-11"><SelectValue placeholder="Selecciona los días" /></SelectTrigger><SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="6">6</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">¿Cuánto tiempo tienes por sesión? (minutos)</Label>
                    <Select value={tiempo} onValueChange={setTiempo}><SelectTrigger className="h-11"><SelectValue placeholder="Selecciona el tiempo" /></SelectTrigger><SelectContent><SelectItem value="30">30 min</SelectItem><SelectItem value="45">45 min</SelectItem><SelectItem value="60">60 min</SelectItem><SelectItem value="75">75 min</SelectItem><SelectItem value="90">90+ min</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">¿Qué equipo tienes disponible?</Label>
                    <Select value={equipo} onValueChange={setEquipo}><SelectTrigger className="h-11"><SelectValue placeholder="Selecciona el equipo" /></SelectTrigger><SelectContent><SelectItem value="Solo_Cuerpo">Solo Cuerpo</SelectItem><SelectItem value="Mancuernas">Mancuernas</SelectItem><SelectItem value="Gym_Completo">Gym Completo</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">¿Cuál es tu sexo?</Label>
                    <Select value={sexo} onValueChange={setSexo}><SelectTrigger className="h-11"><SelectValue placeholder="Selecciona tu sexo" /></SelectTrigger><SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Femenino">Femenino</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">¿Cuál es tu edad?</Label>
                    <Input type="number" value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Ingresa tu edad" min="16" max="90" className="h-11" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    {loading ? (<><Loader2 className="mr-3 h-5 w-5 animate-spin" />Generando recomendación...</>) : (<><Sparkles className="mr-3 h-5 w-5" />Obtener Recomendación</>)}
                  </Button>
                  {error && (<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-600" /><span className="text-sm text-red-700">{error}</span></div>)}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Resultado */}
          <div className="space-y-6">

            {/* ---> 1. SECCIÓN DE RESULTADO MEJORADA Y UNIFICADA */}
            {resultado && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Tu Programa Recomendado
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">

                  {/* Estado: Cargando los detalles del programa */}
                  {loadingPrograma && (
                    <div className="text-center py-4">
                      {/* Mostramos el nombre que ya tenemos del primer API */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {resultado.replace(/_/g, ' ')}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-gray-600 mt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando detalles y rutinas...
                      </div>
                    </div>
                  )}

                  {/* Estado: Error al cargar los detalles */}
                  {errorPrograma && (
                    <div className="flex items-center gap-2 text-red-600 justify-center py-4">
                      <AlertCircle className="h-4 w-4" />
                      No fue posible cargar los detalles del programa.
                    </div>
                  )}

                  {/* Estado: Éxito, los detalles del programa se cargaron */}
                  {programa && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <h2 className="text-2xl font-bold text-gray-900">{programa.nombre?.replace(/_/g, ' ')}</h2>
                          <Button
                            onClick={handleCopyProgram}
                            disabled={isCloning}
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            title="Copiar programa a 'Mis Rutinas'"
                          >
                            {isCloning
                              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              : <PlusCircle className="mr-2 h-4 w-4" />
                            }
                            Copiar
                          </Button>
                        </div>
                        <p className="text-gray-700 mt-1">{programa.descripcion}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {(programa.ProgramasRutinas ?? []).map((item: any, idx: number) => (
                          <Card key={idx} className="border border-gray-100 bg-white">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {item?.Rutinas?.nombre?.replace(/_/g, ' ') || 'Rutina'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700">{item?.Rutinas?.descripcion}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            {/* Este bloque de "Analizando tus datos" se queda igual */}
            {loading && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Analizando tus datos...</h3>
                    <p className="text-gray-600">Nuestro algoritmo está procesando tu información para generar la mejor recomendación.</p>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}