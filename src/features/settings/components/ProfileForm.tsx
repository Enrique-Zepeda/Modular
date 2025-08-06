import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ProfileFormUI() {
  return (
    <form className="space-y-6 max-w-md mx-auto">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" value="usuario@correo.com" disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">El correo electrónico no se puede modificar</p>
      </div>

      {/* Nombre completo */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input id="name" placeholder="Ingresa tu nombre completo" />
      </div>

      {/* Peso */}
      <div className="space-y-2">
        <Label htmlFor="weight_kg">Peso (kg)</Label>
        <Input id="weight_kg" type="number" step="0.1" min="0" placeholder="70.5" />
        <p className="text-xs text-muted-foreground">Opcional: ayuda a calcular recomendaciones personalizadas</p>
      </div>

      {/* Botón */}
      <div className="flex justify-end">
        <Button type="submit" className="min-w-24">
          Guardar
        </Button>
      </div>
    </form>
  );
}
