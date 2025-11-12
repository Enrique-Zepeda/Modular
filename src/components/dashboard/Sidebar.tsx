import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/auth/thunks";
import { useAppDispatch } from "@/hooks/useStore";
import { useTheme } from "@/features/theme/hooks/useTheme";

import {
  Home,
  Calendar,
  Dumbbell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  UserPlus,
  Users,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoutConfirmDialog from "../ui/logout-confirm-dialog";
import LogoPng from "../media/LogoGymApp.png";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Rutinas", href: "/dashboard/routines", icon: Calendar },
  { name: "Recomendación de Rutina", href: "/recomendacion", icon: Sparkles },
  { name: "Ejercicios", href: "/dashboard/ejercicios", icon: Dumbbell },
  { name: "Agregar amigos", href: "/dashboard/friends", icon: UserPlus },
  { name: "Solicitudes", href: "/dashboard/notifications", icon: Users },
  { name: "Perfil", href: "/profile", icon: User },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r border-border/50 bg-gradient-to-b from-background via-background to-muted/20 backdrop-blur-xl transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Header */}
      <div
        className={cn(
          "relative flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm",
          isCollapsed && "justify-center"
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105">
              <img
                src={LogoPng || "/placeholder.svg"}
                alt="GymApp"
                className="h-[88px] w-[88px] object-contain shrink-0 select-none transition-transform duration-300 group-hover:scale-110"
                draggable={false}
              />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              GymApp
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "h-8 w-8 p-0 rounded-lg hover:bg-accent/50 hover:scale-110 transition-all duration-200",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {navigation.map((item, index) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === "/dashboard/routines" && location.pathname.startsWith("/dashboard/routines"));

          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "relative w-full justify-start gap-3 h-11 group transition-all duration-200",
                  isCollapsed ? "justify-center px-2" : "px-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:translate-x-1"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary-foreground rounded-r-full shadow-sm" />
                )}

                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-all duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110",
                    isCollapsed && "mx-auto"
                  )}
                />

                {!isCollapsed && (
                  <span className="font-medium text-sm truncate transition-all duration-200">{item.name}</span>
                )}

                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="relative p-3 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            "w-full justify-start gap-3 h-11 hover:bg-accent/50 transition-all duration-200 group",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className="relative">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
            ) : (
              <Sun className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-90" />
            )}
          </div>
          {!isCollapsed && (
            <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {theme === "dark" ? "Modo Oscuro" : "Modo Claro"}
            </span>
          )}
        </Button>
      </div>

      {/* User Section */}
      <div className="relative p-3 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={() => setConfirmOpen(true)}
          className={cn(
            "w-full justify-start gap-3 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          {!isCollapsed && <span className="font-medium text-sm">Cerrar Sesión</span>}
        </Button>
      </div>

      <LogoutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleLogout} />
    </div>
  );
}
