import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RoutinesFilters({ searchTerm, onSearch }: { searchTerm: string; onSearch: (v: string) => void }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar rutinas..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
}
