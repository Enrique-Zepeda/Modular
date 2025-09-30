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
      className={cn(
        "gap-2.5 transition-all duration-200 group px-4 py-2.5 h-auto border-2 rounded-xl font-bold shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        likedByMe
          ? "bg-gradient-to-br from-rose-500 via-pink-500 to-pink-600 text-white border-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-pink-700 hover:border-rose-600 shadow-lg hover:shadow-xl hover:shadow-rose-500/30 hover:scale-105 focus-visible:ring-rose-500"
          : "hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-950/30 dark:hover:to-pink-950/30 border-border/80 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-md hover:shadow-rose-500/10 hover:scale-105 active:scale-95 focus-visible:ring-rose-400",
        className
      )}
      onClick={onClick}
      disabled={loading}
      aria-pressed={likedByMe}
      aria-label={likedByMe ? "Quitar Me gusta" : "Dar Me gusta"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200",
          likedByMe
            ? "fill-white scale-110 drop-shadow-sm"
            : "fill-transparent group-hover:fill-rose-500/30 group-hover:scale-110 text-rose-600 dark:text-rose-400"
        )}
        aria-hidden="true"
      />

      <span
        className={cn(
          "text-xs font-bold tabular-nums min-w-[2ch]",
          likedByMe ? "text-white drop-shadow-sm" : "text-rose-700 dark:text-rose-300"
        )}
      >
        {count}
      </span>
    </Button>
  );
});
