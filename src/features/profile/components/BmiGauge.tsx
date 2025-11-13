import * as React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BMI_RANGES, type BmiCategoryKey } from "../hooks/useBmi";

/**
 * Colores sólidos (fallback seguros). Si tu tema ya define --chart-1..5,
 * puedes cambiarlos por "hsl(var(--chart-x))".
 */
const RANGE_COLORS: Record<BmiCategoryKey, string> = {
  under: "#38bdf8", // sky-400
  normal: "#34d399", // emerald-400
  over: "#f59e0b", // amber-500
  obese: "#ea580c", // orange-600
  morbid: "#ef4444", // red-500
};

// Full circle: dibujamos 360° (de 90° a -270° en sentido horario)
const START_ANGLE = 90;
const END_ANGLE = -270;

type GaugeData = { key: BmiCategoryKey; value: number };

function buildGaugeData(minDomain = 12, maxDomain = 50): GaugeData[] {
  const total = maxDomain - minDomain;
  return BMI_RANGES.map((r) => ({
    key: r.key,
    value: Math.max(0, Math.min(r.max, maxDomain) - Math.max(r.min, minDomain)) / total,
  })) as GaugeData[];
}

function mapBmiToAngle(bmi: number, minDomain = 12, maxDomain = 50) {
  const clamped = Math.max(minDomain, Math.min(maxDomain, bmi));
  const ratio = (clamped - minDomain) / (maxDomain - minDomain); // 0..1
  return START_ANGLE + (END_ANGLE - START_ANGLE) * ratio; // 90 .. -270
}

export function BmiGauge({
  bmi,
  category,
  className,
  height = 260,
  caption,
}: {
  bmi: number;
  category: BmiCategoryKey;
  height?: number;
  caption?: React.ReactNode;
  className?: string;
}) {
  const data = React.useMemo(() => buildGaugeData(), []);
  const angle = React.useMemo(() => mapBmiToAngle(bmi), [bmi]);
  const categoryLabel = React.useMemo(() => BMI_RANGES.find((r) => r.key === category)?.label ?? "", [category]);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="pt-4 sm:pt-6">
        {/* Contenedor responsivo: altura fija en px pero adaptado a ancho completo */}
        <div className="relative w-full max-w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                startAngle={START_ANGLE}
                endAngle={END_ANGLE}
                innerRadius="65%"
                outerRadius="90%"
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={RANGE_COLORS[d.key]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Aguja animada */}
          <svg className="absolute inset-0" viewBox="0 0 100 100" role="img" aria-label="Indicador IMC">
            <motion.g
              initial={false}
              animate={{ rotate: angle }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              style={{ transformOrigin: "50px 50px" }}
            >
              <line x1="50" y1="50" x2="50" y2="8" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="3.5" fill="hsl(var(--foreground))" />
            </motion.g>
          </svg>

          {/* Valor central: tipografía responsiva y sin desbordar en mobile */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div className="text-xs sm:text-sm text-muted-foreground">IMC</div>
            <div className="text-2xl sm:text-3xl font-bold leading-none">{bmi.toFixed(1)}</div>
            <div className="text-[0.7rem] sm:text-xs font-medium text-muted-foreground text-center px-2">
              {categoryLabel}
            </div>
            {caption ? (
              <div className="mt-1 text-[0.7rem] sm:text-xs text-muted-foreground text-center px-4">{caption}</div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BmiGauge;
