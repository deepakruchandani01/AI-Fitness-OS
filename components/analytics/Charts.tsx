"use client";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

const tick = { fontSize: 11, fill: "#8A91A0" };
export function WeightChart({ data, target }: { data: { date: string; weight: number }[]; target: number | null }) {
  return (
    <div className="h-44">
      <ResponsiveContainer><LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <XAxis dataKey="date" tick={tick} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
        <YAxis tick={tick} domain={["dataMin - 1", "dataMax + 1"]} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E8E3", fontSize: 12 }} />
        {target && <ReferenceLine y={target} stroke="#1E7A68" strokeDasharray="4 4" />}
        <Line type="monotone" dataKey="weight" stroke="#15181D" strokeWidth={2} dot={false} />
      </LineChart></ResponsiveContainer>
    </div>
  );
}
export function DailyBars({ data, dataKey, goal, color }: { data: any[]; dataKey: string; goal?: number; color: string }) {
  return (
    <div className="h-44">
      <ResponsiveContainer><BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <XAxis dataKey="date" tick={tick} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
        <YAxis tick={tick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E8E3", fontSize: 12 }} />
        {goal && <ReferenceLine y={goal} stroke="#8A91A0" strokeDasharray="4 4" />}
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart></ResponsiveContainer>
    </div>
  );
}
