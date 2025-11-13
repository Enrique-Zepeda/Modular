import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Target, TrendingUp } from "lucide-react";

export function RoutinesHeader() {
  return (
    <div
      className="
      relative overflow-hidden rounded-3xl border-2 border-primary/20
      bg-gradient-to-br from-primary/15 via-purple-500/10 to-background
      p-6 md:p-8 lg:p-10 shadow-2xl
    "
    >
      {/* Fondos decorativos (no bloquean interacciones) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-60 md:w-72 h-60 md:h-72 bg-gradient-to-tr from-purple-500/15 to-primary/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Layout responsivo: columna en móvil, fila en desktop */}
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Texto e insignias */}
        <div className="space-y-5 min-w-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 md:h-10 md:w-10 text-purple-500 animate-ping opacity-20">
                <Sparkles className="h-8 w-8 md:h-10 md:w-10" />
              </div>
            </div>
            <h1
              className="
              text-3xl md:text-5xl font-extrabold tracking-tight text-balance
              bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent
            "
            >
              Mis Rutinas
            </h1>
          </div>

          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-prose md:max-w-2xl leading-relaxed text-pretty">
            Gestiona y crea tus rutinas de ejercicios personalizadas para alcanzar tus objetivos
          </p>

          {/* Chips: wrap en móvil, alturas y espaciados consistentes */}
          <div className="flex flex-wrap gap-3 pt-1.5 md:pt-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-semibold text-foreground">Personalizado</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs md:text-sm font-semibold text-foreground">Progreso Continuo</span>
            </div>
          </div>
        </div>

        {/* CTA: full width en móvil, compacto en desktop */}
        <Button
          asChild
          className="
          h-11 md:h-12 w-full sm:w-auto
          bg-gradient-to-r from-primary via-purple-600 to-primary
          hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90
          text-primary-foreground font-bold shadow-xl hover:shadow-2xl
          transition-all duration-300 hover:scale-105 active:scale-95
          relative overflow-hidden group px-5 md:px-6
        "
        >
          <Link to="/dashboard/routines/new">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <Plus className="h-5 w-5 mr-2" />
            Nueva Rutina
          </Link>
        </Button>
      </div>
    </div>
  );
}
