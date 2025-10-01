import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuscleVolumeDistribution } from "@/features/profile/hooks/useMuscleVolumeDistribution";
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
    <Card className="border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Distribución de volumen
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {recentDays > 0 ? `Últimos ${recentDays} días` : "Histórico"}
            </div>
            <div className="text-sm font-semibold">
              Total: <span className="text-primary">{Math.round(total).toLocaleString()} kg</span>
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
                  const pct = props?.payload?.value && total ? (props.payload.value / total) * 100 : 0;
                  return [
                    `${Math.round(Number(value)).toLocaleString()} kg (${pct.toFixed(1)}%)`,
                    props?.payload?.name,
                  ];
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
