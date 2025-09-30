import { memo } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  count?: number;
  onOpen?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
};

export const CommentsTrigger = memo(function CommentsTrigger({ count = 0, onOpen, className, size = "sm" }: Props) {
  return (
    <Button type="button" variant="ghost" size={size} onClick={onOpen} className={cn("gap-2", className)}>
      <MessageSquare className="h-4 w-4" />
      <span className="text-sm tabular-nums">{count}</span>
    </Button>
  );
});
