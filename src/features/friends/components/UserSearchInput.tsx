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
    <div className={cn("relative group", className)}>
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg opacity-20 group-focus-within:opacity-40 blur transition duration-300" />

      <div className="relative bg-background rounded-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-purple-500 transition-colors" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-12 h-12 text-base border-2 border-muted/50 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
