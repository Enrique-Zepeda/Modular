import type React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  id: number;
  children: React.ReactNode;
  className?: string;
}

export function SortableItem({ id, children, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group touch-pan-y select-none", // mejora scroll táctil y evita selección
        isDragging && "z-50 opacity-60",
        className
      )}
    >
      {/* Handle flotante: más pequeño y translúcido en móvil */}
      <div className="pointer-events-none absolute left-1 top-1 sm:left-2 sm:top-2 z-20">
        <button
          type="button"
          aria-label="Reordenar"
          {...attributes}
          {...listeners}
          className={cn(
            "pointer-events-auto h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-md",
            // móvil: oscuro y sutil; desktop: estilo actual
            "bg-black/35 text-white/80 border border-white/20",
            "sm:bg-card/90 sm:text-muted-foreground sm:border-border/60",
            "backdrop-blur flex items-center justify-center shadow-sm",
            "cursor-grab active:cursor-grabbing",
            // opacidad base sutil en mobile
            "opacity-70 sm:opacity-100 active:opacity-100 focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {children}
    </div>
  );
}
