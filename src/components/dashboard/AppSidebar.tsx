import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Dumbbell, User, Settings, LogOut, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/useStore";
import { logoutUser } from "@/features/auth/thunks";
import { cn } from "@/lib/utils";
import LogoutConfirmDialog from "../ui/logout-confirm-dialog";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Rutinas", href: "/dashboard/routines", icon: Calendar },
  { name: "Ejercicios", href: "/dashboard/ejercicios", icon: Dumbbell },
  { name: "Agregar amigos", href: "/dashboard/friends", icon: UserPlus },
  { name: "Recomendación de Rutina", href: "/recomendacion", icon: Sparkles },
  { name: "Perfil", href: "/dashboard/profile", icon: User },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <Dumbbell className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">GymApp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === "/dashboard/routines" && location.pathname.startsWith("/dashboard/routines"));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={() => setConfirmOpen(true)}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
      <LogoutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleLogout} />
    </div>
  );
}
