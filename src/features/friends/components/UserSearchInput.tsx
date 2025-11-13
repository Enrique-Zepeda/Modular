import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export default function UserSearchInput({ value, onChange, placeholder = "Buscar por username…", className }: Props) {
  return (
    <div className={cn("relative group w-full", className)}>
      {/* Gradient border effect, ocupa todo el ancho en mobile */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur transition duration-300 group-focus-within:opacity-40" />

      <div className="relative bg-background rounded-lg">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Sparkles className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 transition-colors group-focus-within:text-purple-500" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 sm:h-12 w-full pl-11 sm:pl-12 pr-11 sm:pr-12 text-sm sm:text-base border-2 border-muted/50 bg-background/50 backdrop-blur-sm focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
