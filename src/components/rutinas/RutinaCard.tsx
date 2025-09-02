import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Play, Pause, MoreHorizontal, Edit, Copy, Trash2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCambiarPrivacidadRutinaMutation, useCambiarActividadRutinaMutation } from "@/features/rutinas/api/rutinasApi";
import type { RutinaConUsuario } from "@/types/rutinas";

interface RutinaCardProps {
  rutina: RutinaConUsuario;
  onDelete?: (id: number, name: string) => void;
  showActions?: boolean;
}

export default function RutinaCard({ rutina, onDelete, showActions = true }: RutinaCardProps) {
  const [isChangingPrivacy, setIsChangingPrivacy] = useState(false);
  const [isChangingActivity, setIsChangingActivity] = useState(false);

  const [cambiarPrivacidad] = useCambiarPrivacidadRutinaMutation();
  const [cambiarActividad] = useCambiarActividadRutinaMutation();

  // Debug logging
  console.log("RutinaCard - rutina:", rutina);
  console.log("RutinaCard - usuarioRutina:", rutina.usuarioRutina);

  // Validar que la rutina tenga usuarioRutina
  if (!rutina.usuarioRutina) {
    console.error("RutinaCard - usuarioRutina es undefined:", rutina);
    return (
      <Card className="rounded-2xl shadow-sm border-destructive">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error: Datos de rutina incompletos</p>
            <p className="text-sm">ID: {rutina.id_rutina}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePrivacyChange = async (privada: boolean) => {
    if (isChangingPrivacy) return;
    
    setIsChangingPrivacy(true);
    try {
      await cambiarPrivacidad({
        id_usuario_rutina: rutina.usuarioRutina.id,
        privada
      }).unwrap();
      
      toast.success(
        privada 
          ? "Rutina marcada como privada" 
          : "Rutina marcada como pública"
      );
    } catch (error) {
      console.error("Error cambiando privacidad:", error);
      toast.error("Error al cambiar la privacidad de la rutina");
    } finally {
      setIsChangingPrivacy(false);
    }
  };

  const handleActivityChange = async (activa: boolean) => {
    if (isChangingActivity) return;
    
    setIsChangingActivity(true);
    try {
      await cambiarActividad({
        id_usuario_rutina: rutina.usuarioRutina.id,
        activa
      }).unwrap();
      
      toast.success(
        activa 
          ? "Rutina marcada como activa" 
          : "Rutina marcada como inactiva"
      );
    } catch (error) {
      console.error("Error cambiando actividad:", error);
      toast.error("Error al cambiar la actividad de la rutina");
    } finally {
      setIsChangingActivity(false);
    }
  };

  const getLevelBadgeVariant = (level: string | null) => {
    switch (level) {
      case "principiante":
        return "default";
      case "intermedio":
        return "secondary";
      case "avanzado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getObjectiveBadgeVariant = (objective: string | null) => {
    switch (objective) {
      case "fuerza":
        return "default";
      case "hipertrofia":
        return "secondary";
      case "resistencia":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-border rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg">
                {rutina.nombre}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {rutina.descripcion || "Sin descripción"}
              </CardDescription>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/routines/${rutina.id_rutina}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(rutina.id_rutina, rutina.nombre)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <Link to={`/dashboard/routines/${rutina.id_rutina}`}>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {rutina.nivel_recomendado && (
                <Badge variant={getLevelBadgeVariant(rutina.nivel_recomendado)} className="rounded-full">
                  {rutina.nivel_recomendado}
                </Badge>
              )}
              {rutina.objetivo && (
                <Badge variant={getObjectiveBadgeVariant(rutina.objetivo)} className="rounded-full">
                  {rutina.objetivo}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {rutina.duracion_estimada && (
                <span>{rutina.duracion_estimada} min</span>
              )}
              <span>0 ejercicios</span>
            </div>
          </CardContent>
        </Link>

        {/* Controles de privacidad y actividad */}
        <div className="px-6 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {rutina.usuarioRutina.privada ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Unlock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {rutina.usuarioRutina.privada ? "Privada" : "Pública"}
              </span>
            </div>
            <Switch
              checked={rutina.usuarioRutina.privada}
              onCheckedChange={handlePrivacyChange}
              disabled={isChangingPrivacy}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {rutina.usuarioRutina.activa ? (
                <Play className="h-4 w-4 text-green-600" />
              ) : (
                <Pause className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {rutina.usuarioRutina.activa ? "Activa" : "Inactiva"}
              </span>
            </div>
            <Switch
              checked={rutina.usuarioRutina.activa}
              onCheckedChange={handleActivityChange}
              disabled={isChangingActivity}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
