import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TrendPoint } from '../api/types';

export default function ProgressChart({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return <p className="py-8 text-sm text-muted">Finish at least two interviews to see your trend.</p>;
  }
  return (
    <div className="h-64" role="img" aria-label="Line chart of overall interview scores over time">
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#cfd6df" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#5b6678' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#5b6678' }} />
          <Tooltip formatter={(v: number) => [v.toFixed(1), 'Overall']} />
          <Line type="monotone" dataKey="overallScore" stroke="#0f5f52" strokeWidth={2.5} dot={{ r: 4, fill: '#0f5f52' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
