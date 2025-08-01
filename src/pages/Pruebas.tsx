import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import EjercicioCard from "@/components/EjercicioCard";

interface Ejercicio {
  id: number;
  nombre: string;
  ejemplo: string;
}

const EjerciciosPage = () => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEjercicios = async () => {
      const { data, error } = await supabase
        .from("Ejercicios")
        .select("id, nombre, ejemplo");

      if (error) {
        console.error("Error al obtener ejercicios:", error);
      } else {
        setEjercicios(data || []);
      }
      setLoading(false);
    };

    fetchEjercicios();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-xl">Cargando ejercicios...</p>;
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {ejercicios.map((ejercicio) => (
        <EjercicioCard
          key={ejercicio.id}
          nombre={ejercicio.nombre}
          ejemplo={ejercicio.ejemplo}
        />
      ))}
    </div>
  );
};

export default EjerciciosPage;
