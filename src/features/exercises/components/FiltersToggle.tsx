import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, X } from "lucide-react";

export function FiltersToggle({
  expanded,
  setExpanded,
  activeCount,
  hasActive,
  onClear,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  activeCount: number;
  hasActive: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300 rounded-xl"
      >
        <Filter className="h-4 w-4" />
        <span className="font-semibold">Filtros avanzados</span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="ml-2 bg-primary/15 border border-primary/30 text-primary font-bold">
            {activeCount}
          </Badge>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
      </Button>
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs hover:bg-destructive/10 hover:text-destructive transition-all duration-300 rounded-xl font-semibold"
        >
          <X className="h-3 w-3 mr-1" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
}
