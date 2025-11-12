import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuscleVolumeDistribution } from "@/features/profile/hooks/useMuscleVolumeDistribution";
import { useWeightUnit } from "@/hooks";
import { presentInUserUnit } from "@/lib/weight";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from "recharts";

const COLORS = [
  "#9B59B6",
  "#3498DB",
  "#E67E22",
  "#2ECC71",
  "#E74C3C",
  "#F1C40F",
  "#1ABC9C",
  "#95A5A6",
  "#2C3E50",
  "#8E44AD",
];

export default function ProfileMuscleDistribution({
  username,
  recentDays = 60,
}: {
  username: string;
  recentDays?: number;
}) {
  const { data, total, isLoading } = useMuscleVolumeDistribution(username, recentDays);
  const { unit } = useWeightUnit();
  const displayTotal = presentInUserUnit(total, unit);
  if (isLoading) return <Skeleton className="h-80 w-full rounded-xl" />;

  if (!data.length || total <= 0) {
    return (
      <Card className="border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Aún no hay datos suficientes para la distribución de volumen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border/60 bg-gradient-to-br from-card via-card/98 to-card/95 shadow-lg hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <CardContent className="p-6 relative">
        <div className="mb-6 space-y-3">
          <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Distribución de volumen</h3>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-semibold bg-muted/50 px-3 py-1.5 rounded-lg">
              {recentDays > 0 ? `Últimos ${recentDays} días` : "Histórico"}
            </div>
            <div className="text-sm font-bold">
              Total:
              <span className="text-primary">
                {displayTotal.toLocaleString()} {unit}
              </span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full px-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="75%"
                isAnimationActive
                label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, _name: any, props: any) => {
                  const raw = Number(value) || 0; // viene en kg
                  const displayVal = presentInUserUnit(raw, unit);
                  const pct = props?.payload?.value && total ? (props.payload.value / total) * 100 : 0;
                  return [`${displayVal.toLocaleString()} ${unit} (${pct.toFixed(1)}%)`, props?.payload?.name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
