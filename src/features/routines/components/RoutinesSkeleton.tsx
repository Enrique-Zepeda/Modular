import { Card, CardContent } from "@/components/ui/card";

export function RoutinesSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
      </div>

      <Card className="rounded-2xl shadow-sm">
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-sm h-48">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-muted rounded-md animate-pulse" />
                <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-1/2 bg-muted rounded-md animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
