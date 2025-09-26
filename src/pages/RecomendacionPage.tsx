import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function RecomendacionPage() {
  const [objetivo, setObjetivo] = useState<string>("Ganar Músculo");
  const [nivel, setNivel] = useState<string>("Principiante");
  const [dias, setDias] = useState<string>("3");
  const [tiempo, setTiempo] = useState<string>("60 min");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    // Normalización mínima a lo que espera el backend
    const payload = {
      objetivo,
      nivel,
      dias,
      tiempo,
    } as const;

    try {
      const res = await fetch("http://localhost:5000/predict", {
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
    <div className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Recomendación de Rutina</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>¿Cuál es tu objetivo principal?</Label>
                <Select value={objetivo} onValueChange={setObjetivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganar Músculo">Ganar Músculo</SelectItem>
                    <SelectItem value="Perder Grasa">Perder Grasa</SelectItem>
                    <SelectItem value="Mantenerse">Mantenerse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>¿Cuál es tu nivel de experiencia?</Label>
                <Select value={nivel} onValueChange={setNivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principiante">Principiante</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>¿Cuántos días a la semana planeas entrenar?</Label>
                <Select value={dias} onValueChange={setDias}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona los días" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5 o más">5 o más</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>¿Cuánto tiempo tienes por sesión?</Label>
                <Select value={tiempo} onValueChange={setTiempo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tiempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 min">30 min</SelectItem>
                    <SelectItem value="45 min">45 min</SelectItem>
                    <SelectItem value="60 min">60 min</SelectItem>
                    <SelectItem value="90+ min">90+ min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Obtener Recomendación
              </Button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>

            {resultado && (
              <div className="mt-4 p-4 rounded-md bg-muted">
                <p className="text-sm">Rutina recomendada:</p>
                <p className="text-lg font-semibold">{resultado}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


