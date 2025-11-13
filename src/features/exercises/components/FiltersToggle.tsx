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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full sm:w-auto min-h-11 sm:min-h-0 px-3 sm:px-4 rounded-xl flex items-center justify-between sm:justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-semibold">Filtros avanzados</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-primary/15 border border-primary/30 text-primary font-bold">
              {activeCount}
            </Badge>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
      </Button>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="w-full sm:w-auto min-h-10 sm:min-h-0 text-xs rounded-xl font-semibold hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
        >
          <X className="h-3 w-3 mr-1" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
}
