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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative", isDragging && "z-50 opacity-50", className)}>
      <div className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200">
        {/* Drag Handle */}
        <div className="flex-shrink-0 mt-2 cursor-grab active:cursor-grabbing group" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
        </div>

        {children}
      </div>
    </div>
  );
}
