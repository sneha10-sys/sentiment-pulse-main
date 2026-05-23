import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Props {
  positive: number;
  negative: number;
  neutral: number;
}

export function DonutChart({ positive, negative, neutral }: Props) {
  const data = [
    { name: "Positive", value: positive, fill: "hsl(var(--positive))" },
    { name: "Negative", value: negative, fill: "hsl(var(--negative))" },
    { name: "Neutral",  value: neutral,  fill: "hsl(var(--neutral))" },
  ];
  const total = positive + negative + neutral;

  return (
    <div className="relative h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2} stroke="hsl(var(--background))" strokeWidth={2}>
            {data.map((d) => <Cell key={d.name} fill={d.fill} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-6">
        <div className="text-2xl font-semibold tabular-nums">{total}</div>
        <div className="text-xs text-muted-foreground">total</div>
      </div>
    </div>
  );
}
