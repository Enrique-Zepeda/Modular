import { memo } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  count?: number;
  /** Compat: si no pasas onToggle, se usa onOpen */
  onOpen?: () => void;
  onToggle?: () => void;
  isOpen?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
};

export const CommentsTrigger = memo(function CommentsTrigger({
  count = 0,
  onOpen,
  onToggle,
  isOpen = false,
  className,
  size = "sm",
}: Props) {
  const handleClick = () => {
    if (onToggle) onToggle();
    else onOpen?.();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn(
        // Mobile-first: tap target seguro, padding y radios responsivos, sin romper el size del Button
        "inline-flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] rounded-lg sm:rounded-xl font-bold shadow-sm",
        // Estilos de realce y accesibilidad
        "hover:bg-gradient-to-br hover:from-sky-50 hover:to-blue-50 dark:hover:from-sky-950/30 dark:hover:to-blue-950/30",
        "border-2 border-border/80 hover:border-sky-400 dark:hover:border-sky-600",
        "hover:shadow-md hover:shadow-sky-500/10 hover:scale-105 active:scale-95 transition-all duration-200 group",
        "focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2",
        className
      )}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Ocultar comentarios" : `Ver ${count} comentarios`}
      title={isOpen ? "Ocultar comentarios" : "Ver comentarios"}
    >
      <MessageSquare
        className="h-4 w-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform duration-200"
        aria-hidden="true"
      />
      <span className="text-xs sm:text-sm font-bold tabular-nums min-w-[2ch] text-sky-700 dark:text-sky-300">
        {count}
      </span>
    </Button>
  );
});
