import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      {/* Icono no bloquea clics; ajusta posiciones por breakpoint */}
      <Search className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar ejercicios por nombre o descripción..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-4 text-[15px] sm:text-base border-2 border-border/60 md:hover:border-primary/50 focus:border-primary bg-background transition-all duration-300 rounded-xl"
        aria-label="Buscar ejercicios por nombre o descripción"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}
