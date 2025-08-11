import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/auth/thunks";
import { useAppDispatch } from "@/hooks/useStore";
import { Home, Calendar, Dumbbell, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Rutinas", href: "/dashboard/routines", icon: Calendar },
  { name: "Ejercicios", href: "/dashboard/ejercicios", icon: Dumbbell },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">FitTracker</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-8 w-8 p-0", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === "/dashboard/routines" && location.pathname.startsWith("/dashboard/routines"));

          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isCollapsed && "justify-center px-2",
                  isActive && "bg-secondary text-secondary-foreground font-medium"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );
}
