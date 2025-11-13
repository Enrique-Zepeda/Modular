import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RoutinesFilters({ searchTerm, onSearch }: { searchTerm: string; onSearch: (v: string) => void }) {
  return (
    <Card
      className="
      relative overflow-hidden rounded-2xl
      border-2 border-border/60
      bg-gradient-to-br from-background via-background to-primary/5
      shadow-lg
    "
    >
      {/* Overlay decorativo, no bloquea interacciones */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-50" />

      <CardContent className="relative p-4 sm:p-6">
        <div role="search" className="min-w-0">
          <label htmlFor="routines-search" className="sr-only">
            Buscar rutinas
          </label>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="routines-search"
              placeholder="Buscar rutinas..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              inputMode="search"
              autoComplete="off"
              className="
              h-11 sm:h-12 w-full
              pl-11 rounded-xl
              text-base font-medium
              border-2 border-border/60
              hover:border-primary/50
              focus:border-primary
              focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
              transition-all duration-300
            "
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
