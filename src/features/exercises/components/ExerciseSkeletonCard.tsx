import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExerciseSkeletonCard() {
  return (
    <Card className="border-0 shadow-md">
      {/* Header: títulos esqueleto; en móvil ajustamos alturas y gaps */}
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 sm:h-6 w-2/3 sm:w-3/4 rounded-md" />
          <Skeleton className="h-8 sm:h-6 w-20 rounded-full" />
        </div>
      </CardHeader>

      {/* Contenido: mobile-first, sin desbordes y con alturas táctiles en chips */}
      <CardContent className="space-y-3 sm:space-y-4 animate-pulse">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 sm:h-6 w-24 sm:w-20 rounded-full" />
          <Skeleton className="h-8 sm:h-6 w-20 sm:w-16 rounded-full" />
        </div>

        <Skeleton className="h-3.5 sm:h-4 w-[92%] sm:w-full rounded-md" />
        <Skeleton className="h-3.5 sm:h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3.5 sm:h-4 w-1/2 rounded-md" />

        <div className="aspect-video w-full">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}
