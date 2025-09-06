import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function RoutinesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Rutinas</h1>
        <p className="text-muted-foreground">Gestiona y crea tus rutinas de ejercicios personalizadas</p>
      </div>
      <Button asChild className="rounded-xl">
        <Link to="/dashboard/routines/new">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Rutina
        </Link>
      </Button>
    </div>
  );
}
