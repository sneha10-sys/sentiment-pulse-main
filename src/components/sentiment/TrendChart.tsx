import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface TrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface Props { data: TrendPoint[]; }

export function TrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
        <Line type="monotone" dataKey="positive" stroke="hsl(var(--positive))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="negative" stroke="hsl(var(--negative))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="neutral"  stroke="hsl(var(--neutral))"  strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
