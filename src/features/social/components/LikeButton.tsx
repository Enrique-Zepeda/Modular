import { memo, useCallback } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLikes } from "../hooks/useLikes";
import { toast } from "react-hot-toast";

type Props = {
  sessionId: number;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  initialCount?: number;
  initialLikedByMe?: boolean;
};

export const LikeButton = memo(function LikeButton({
  sessionId,
  className,
  size = "sm",
  initialCount,
  initialLikedByMe,
}: Props) {
  // Solo pasamos "initial" si viene al menos uno de los dos valores
  const hasInitial = typeof initialCount === "number" || typeof initialLikedByMe === "boolean";
  const initialArg = hasInitial ? { count: initialCount, likedByMe: initialLikedByMe } : undefined;

  const { count, likedByMe, loading, like, unlike } = useLikes(sessionId, initialArg);

  const onClick = useCallback(async () => {
    try {
      if (likedByMe) {
        await unlike();
      } else {
        await like();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo actualizar el like");
    }
  }, [likedByMe, like, unlike]);

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn("gap-2", className)}
      onClick={onClick}
      disabled={loading}
      aria-pressed={likedByMe}
      aria-label={likedByMe ? "Quitar Me gusta" : "Dar Me gusta"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform",
          likedByMe ? "fill-current" : "fill-transparent",
          likedByMe && "scale-110"
        )}
      />
      <span className="text-sm tabular-nums">{count}</span>
    </Button>
  );
});
