import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RoutinesFilters({ searchTerm, onSearch }: { searchTerm: string; onSearch: (v: string) => void }) {
  return (
    <Card className="rounded-2xl shadow-lg border-2 border-border/60 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-50 pointer-events-none" />
      <CardContent className="p-6 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar rutinas..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-12 h-12 rounded-xl border-2 border-border/60 hover:border-primary/50 focus:border-primary transition-all duration-300 text-base font-medium"
          />
        </div>
      </CardContent>
    </Card>
  );
}
