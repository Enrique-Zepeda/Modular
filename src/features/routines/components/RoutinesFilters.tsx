import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RoutinesFilters({
  searchTerm,
  onSearch,
  onClear,
}: {
  searchTerm: string;
  onSearch: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar rutinas..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Button variant="outline" onClick={onClear} className="rounded-xl">
            <Filter className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
