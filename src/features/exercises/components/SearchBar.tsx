import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Buscar ejercicios por nombre o descripción..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 h-12 text-base border-0 bg-muted/50 focus:bg-background transition-colors"
      />
    </div>
  );
}
