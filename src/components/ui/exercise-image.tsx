import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

interface ExerciseImageProps {
  src?: string;
  alt: string;
  aspectRatio?: "1/1" | "4/3" | "16/9" | "3/2";
  className?: string;
  showFallback?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ExerciseImage({
  src,
  alt,
  aspectRatio = "4/3",
  className,
  showFallback = true,
  size = "md",
}: ExerciseImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses = {
    "1/1": "aspect-square",
    "4/3": "aspect-[4/3]",
    "16/9": "aspect-video",
    "3/2": "aspect-[3/2]",
  };

  const sizeClasses = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const isGif = src?.toLowerCase().includes(".gif");

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-muted/30 border border-border/50 flex items-center justify-center",
          aspectRatioClasses[aspectRatio],
          sizeClasses[size],
          className
        )}
      >
        {showFallback && (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs text-center px-2 opacity-70">Sin imagen</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-transparent",
        aspectRatioClasses[aspectRatio],
        sizeClasses[size],
        className
      )}
    >
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}

      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full transition-all duration-300",
          isGif ? "object-contain bg-transparent" : "object-cover",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        loading="lazy"
        style={{ backgroundColor: "transparent" }}
      />
    </div>
  );
}
