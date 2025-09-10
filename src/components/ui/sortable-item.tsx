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
      <div className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        {/* Drag Handle */}
        <div className="flex-shrink-0 mt-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </div>

        {children}
      </div>
    </div>
  );
}
